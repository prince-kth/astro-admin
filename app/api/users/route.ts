import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        reports: true, // Reports ka pura data
        transactions: true, // Transactions ka pura data
        _count: {
          select: {
            reports: true,
            transactions: true
          }
        }
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phoneNumber,
      countryCode,
      package: packageType,
      city,
      country,
      dateOfBirth,
      timeOfBirth,
      birthPlace,
      latitude,
      longitude,
      walletBalance
    } = body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !countryCode || !dateOfBirth || !timeOfBirth || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await db.user.create({
      data: {
        name,
        email,
        phoneNumber,
        countryCode,
        package: packageType || 'Basic',
        city: city || '',
        country: country || '',
        dateOfBirth: new Date(dateOfBirth),
        timeOfBirth,
        birthPlace,
        latitude: latitude || 0,
        longitude: longitude || 0,
        walletBalance: walletBalance || 0,
        status: 'Active'
      },
      include: {
        _count: {
          select: {
            reports: true,
            transactions: true
          }
        }
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
} 