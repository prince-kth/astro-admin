import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    // TODO: Add your database update logic here
    
    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: Add your database fetch logic here
    const mockProfile = {
      name: "John Doe",
      email: "john@example.com",
      bio: "Software Developer",
      avatar: "",
    };

    return NextResponse.json(mockProfile, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
