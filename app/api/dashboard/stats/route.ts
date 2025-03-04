import { prisma } from "@/lib/prisma"; // Apne prisma instance ka import check kar le
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalReport=await prisma.report.count()
    // const totalReports = await prisma.report.count({
    //   where: { status: 'COMPLETED' }
    // })
    const totalTransactions = await prisma.transaction.count()
    return NextResponse.json({ totalUsers, totalReport,totalTransactions });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
