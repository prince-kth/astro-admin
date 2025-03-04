import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET endpoint to fetch transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where = {
      ...(userId && { userId: parseInt(userId) }),
      ...(type && { type }),
      ...(status && { status }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new transaction
export async function POST(request: Request) {
  try {
    const { userId, amount, type, description } = await request.json();

    if (!userId || !amount || !type || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (type === "debit" && user.walletBalance < amount) {
        throw new Error("Insufficient balance");
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount,
          type,
          description,
          status: "completed",
          timestamp: new Date(),
        },
      });

      const newBalance =
        type === "credit" ? user.walletBalance + amount : user.walletBalance - amount;

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
      });

      return { transaction, newBalance };
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      balance: result.newBalance,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
