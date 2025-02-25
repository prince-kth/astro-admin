import { NextResponse } from "next/server";

// This is mock data - replace with your actual database query
const mockUsers = [
  { phoneNumber: "+919876543210", name: "Aarav Patel" },
  { phoneNumber: "+919876543211", name: "Priya Sharma" },
  { phoneNumber: "+919876543212", name: "Arjun Singh" },
  { phoneNumber: "+919876543213", name: "Zara Khan" },
  { phoneNumber: "+919876543214", name: "Vihaan Gupta" },
  { phoneNumber: "+919876543215", name: "Ananya Reddy" },
  { phoneNumber: "+919876543216", name: "Kabir Malhotra" },
  { phoneNumber: "+919876543217", name: "Aisha Verma" },
  { phoneNumber: "+919876543218", name: "Advait Kumar" },
  { phoneNumber: "+919876543219", name: "Riya Mehta" },
  { phoneNumber: "+919876543220", name: "Ishaan Chopra" },
  { phoneNumber: "+919876543221", name: "Diya Kapoor" },
  { phoneNumber: "+919876543222", name: "Vivaan Joshi" },
  { phoneNumber: "+919876543223", name: "Mira Saxena" },
  { phoneNumber: "+919876543224", name: "Reyansh Iyer" },
];

export async function GET() {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we're returning mock data
    return NextResponse.json({ users: mockUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}