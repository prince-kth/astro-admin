import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock user data - using the same data as in the other routes
const mockUsers = [
  { 
    id: 1, 
    name: "John Does", 
    email: "john@example.com", 
    phoneNumber: "9234567890",
    countryCode: "+91",
    package: "Premium",
    walletBalance: 1250.75,
    city: "New York",
    country: "USA",
    status: "Active",
    dateOfBirth: "1990-05-15",
    timeOfBirth: "14:30",
    birthPlace: "New York",
    latitude: 40.7128,
    longitude: -74.0060,
    createdAt: "2024-02-15T10:30:00Z",
    updatedAt: "2024-02-15T10:30:00Z"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    phoneNumber: "8876543210",
    countryCode: "+91",
    package: "Basic",
    walletBalance: 450.25,
    city: "Los Angeles",
    country: "USA",
    status: "Active",
    dateOfBirth: "1992-08-20",
    timeOfBirth: "09:15",
    birthPlace: "Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
    createdAt: "2024-02-16T15:45:00Z",
    updatedAt: "2024-02-16T15:45:00Z"
  },
  { 
    id: 3, 
    name: "Bob Johnson", 
    email: "bob@example.com", 
    phoneNumber: "9551234567",
    countryCode: "+91",
    package: "Premium",
    walletBalance: 2800.50,
    city: "Chicago",
    country: "USA",
    status: "Inactive",
    dateOfBirth: "1985-11-10",
    timeOfBirth: "22:45",
    birthPlace: "Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
    createdAt: "2024-02-17T09:20:00Z",
    updatedAt: "2024-02-17T09:20:00Z"
  },
  { 
    id: 4, 
    name: "Alice Williams", 
    email: "alice@example.com", 
    phoneNumber: "7789012345",
    countryCode: "+91",
    package: "Basic",
    walletBalance: 175.30,
    city: "Houston",
    country: "USA",
    status: "Blocked",
    dateOfBirth: "1988-03-25",
    timeOfBirth: "11:30",
    birthPlace: "Houston",
    latitude: 29.7604,
    longitude: -95.3698,
    createdAt: "2024-02-18T14:10:00Z",
    updatedAt: "2024-02-18T14:10:00Z"
  },
  { 
    id: 5, 
    name: "Charlie Brown", 
    email: "charlie@example.com", 
    phoneNumber: "8890123456",
    countryCode: "+91",
    package: "Premium",
    walletBalance: 3200.00,
    city: "Phoenix",
    country: "USA",
    status: "Active",
    dateOfBirth: "1995-07-08",
    timeOfBirth: "16:20",
    birthPlace: "Phoenix",
    latitude: 33.4484,
    longitude: -112.0740,
    createdAt: "2024-02-19T08:55:00Z",
    updatedAt: "2024-02-19T08:55:00Z"
  },
  { 
    id: 6, 
    name: "Eva Garcia", 
    email: "eva@example.com", 
    phoneNumber: "9912345678",
    countryCode: "+91",
    package: "Basic",
    walletBalance: 520.75,
    city: "Philadelphia",
    country: "USA",
    status: "Active",
    dateOfBirth: "1993-12-15",
    timeOfBirth: "07:45",
    birthPlace: "Philadelphia",
    latitude: 39.9526,
    longitude: -75.1652,
    createdAt: "2024-02-20T11:30:00Z",
    updatedAt: "2024-02-20T11:30:00Z"
  },
  { 
    id: 7, 
    name: "David Lee", 
    email: "david@example.com", 
    phoneNumber: "7701234567",
    countryCode: "+91",
    package: "Premium",
    walletBalance: 1850.25,
    city: "San Antonio",
    country: "USA",
    status: "Inactive",
    dateOfBirth: "1987-09-30",
    timeOfBirth: "19:10",
    birthPlace: "San Antonio",
    latitude: 29.4241,
    longitude: -98.4936,
    createdAt: "2024-02-21T16:45:00Z",
    updatedAt: "2024-02-21T16:45:00Z"
  },
  { 
    id: 8, 
    name: "Grace Kim", 
    email: "grace@example.com", 
    phoneNumber: "8812345678",
    countryCode: "+91",
    package: "Basic",
    walletBalance: 375.50,
    city: "San Diego",
    country: "USA",
    status: "Active",
    dateOfBirth: "1991-04-12",
    timeOfBirth: "13:25",
    birthPlace: "San Diego",
    latitude: 32.7157,
    longitude: -117.1611,
    createdAt: "2024-02-22T09:15:00Z",
    updatedAt: "2024-02-22T09:15:00Z"
  },
  { 
    id: 9, 
    name: "Frank Wilson", 
    email: "frank@example.com", 
    phoneNumber: "9923456789",
    countryCode: "+91",
    package: "Premium",
    walletBalance: 2950.00,
    city: "Dallas",
    country: "USA",
    status: "Blocked",
    dateOfBirth: "1984-02-28",
    timeOfBirth: "05:50",
    birthPlace: "Dallas",
    latitude: 32.7767,
    longitude: -96.7970,
    createdAt: "2024-02-23T14:30:00Z",
    updatedAt: "2024-02-23T14:30:00Z"
  },
  { 
    id: 10, 
    name: "Helen Martinez", 
    email: "helen@example.com", 
    phoneNumber: "7734567890",
    countryCode: "+91",
    package: "Basic",
    walletBalance: 625.25,
    city: "San Jose",
    country: "USA",
    status: "Active",
    dateOfBirth: "1996-10-05",
    timeOfBirth: "10:40",
    birthPlace: "San Jose",
    latitude: 37.3382,
    longitude: -121.8863,
    createdAt: "2024-02-24T10:20:00Z",
    updatedAt: "2024-02-24T10:20:00Z"
  }
];

// Search users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phoneNumber: { contains: query } },
        { city: { contains: query, mode: 'insensitive' } },
        { country: { contains: query, mode: 'insensitive' } },
        { birthPlace: { contains: query, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              reports: true,
              transactions: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}