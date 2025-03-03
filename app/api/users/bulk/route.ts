import { NextResponse, NextRequest } from "next/server";

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

// In-memory storage for user data
let users = [...mockUsers];

// Bulk operations on users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, userIds } = body;

    if (!operation || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Operation and userIds array are required' },
        { status: 400 }
      );
    }

    // Convert string IDs to numbers
    const ids = userIds.map(id => typeof id === 'string' ? parseInt(id) : id);

    // Check for invalid IDs
    if (ids.some(id => isNaN(id))) {
      return NextResponse.json(
        { error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    let count = 0;
    const now = new Date().toISOString();

    switch (operation) {
      case 'delete':
        // Delete multiple users
        const initialLength = users.length;
        users = users.filter(user => !ids.includes(user.id));
        count = initialLength - users.length;
        break;

      case 'activate':
        // Activate multiple users
        users = users.map(user => {
          if (ids.includes(user.id) && user.status !== 'Active') {
            count++;
            return { ...user, status: 'Active', updatedAt: now };
          }
          return user;
        });
        break;

      case 'deactivate':
        // Deactivate multiple users
        users = users.map(user => {
          if (ids.includes(user.id) && user.status !== 'Inactive') {
            count++;
            return { ...user, status: 'Inactive', updatedAt: now };
          }
          return user;
        });
        break;

      case 'block':
        // Block multiple users
        users = users.map(user => {
          if (ids.includes(user.id) && user.status !== 'Blocked') {
            count++;
            return { ...user, status: 'Blocked', updatedAt: now };
          }
          return user;
        });
        break;

      case 'upgrade':
        // Upgrade users to Premium
        users = users.map(user => {
          if (ids.includes(user.id) && user.package !== 'Premium') {
            count++;
            return { ...user, package: 'Premium', updatedAt: now };
          }
          return user;
        });
        break;

      case 'downgrade':
        // Downgrade users to Basic
        users = users.map(user => {
          if (ids.includes(user.id) && user.package !== 'Basic') {
            count++;
            return { ...user, package: 'Basic', updatedAt: now };
          }
          return user;
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      operation,
      count
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
} 