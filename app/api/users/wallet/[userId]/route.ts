import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock data for wallet balances - in a real app, this would be stored in a database
// This should match the data in the main wallet route
const userWallets = [
  { userId: 1, balance: 45250.75 },
  { userId: 2, balance: 15450.25 },
  { userId: 3, balance: 78800.50 },
  { userId: 4, balance: 8175.30 },
  { userId: 5, balance: 92000.00 },
  { userId: 6, balance: 12520.75 },
  { userId: 7, balance: 51850.25 },
  { userId: 8, balance: 9375.50 },
  { userId: 9, balance: 82950.00 },
  { userId: 10, balance: 16625.25 }
];

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletBalance: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { userId, balance: 0, exists: false },
        { status: 200 }
      );
    }
    
    return NextResponse.json({ 
      userId: user.id, 
      balance: user.walletBalance,
      transactionCount: user._count.transactions,
      exists: true
    });
    
  } catch (error) {
    console.error('Error fetching user wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user wallet' },
      { status: 500 }
    );
  }
} 