import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get single user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reports: true,
            transactions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

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
      status,
      walletBalance
    } = body;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If email is being changed, check if new email is already taken
    if (email && email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(countryCode && { countryCode }),
        ...(packageType && { package: packageType }),
        ...(city && { city }),
        ...(country && { country }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(timeOfBirth && { timeOfBirth }),
        ...(birthPlace && { birthPlace }),
        ...(typeof latitude !== 'undefined' && { latitude }),
        ...(typeof longitude !== 'undefined' && { longitude }),
        ...(status && { status }),
        ...(walletBalance && { walletBalance })
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// Support PATCH as an alias for PUT
// export const PATCH = PUT; 




// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = parseInt(params.id);

//     if (isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Invalid user ID' },
//         { status: 400 }
//       );
//     }

//     // Fetch user by ID
//     const user = await db.user.findUnique({
//       where: { id },
//       include: {
//         reports: true, // Include reports data
//         transactions: true, // Include transactions data
//       }
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(user);
//   } catch (error) {
//     console.error('Error fetching user by ID:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch user' },
//       { status: 500 }
//     );
//   }
// }
