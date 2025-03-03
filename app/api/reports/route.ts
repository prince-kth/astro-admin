import { NextResponse } from "next/server";
import { Report } from "@/lib/types/models";

// Mock reports data - in a real app, this would be in a database
const mockReports: Report[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const userReports = mockReports.filter(r => r.userId === userId);
    
    return NextResponse.json({
      reports: userReports
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, cost } = body;

    if (!userId || !type || !cost) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new report
    const newReport: Report = {
      id: `r${Date.now()}`,
      userId,
      type,
      generatedAt: new Date().toISOString(),
      status: "generating",
      cost
    };

    // In a real app, save to database
    mockReports.push(newReport);

    // Simulate report generation
    setTimeout(() => {
      newReport.status = "completed";
      newReport.pdfUrl = `/reports/${newReport.id}.pdf`;
    }, 5000);

    return NextResponse.json({
      report: newReport
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
