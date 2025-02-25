import { NextResponse, NextRequest } from "next/server";

interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  latitude: string;
  longitude: string;
}

// Mock user data - replace with your actual database query
const mockUserDetails: Record<string, UserData> = {
  "+919876543210": {
    firstName: "Aarav",
    lastName: "Patel",
    phoneNumber: "+919876543210",
    email: "aarav.patel@gmail.com",
    dateOfBirth: "1995-04-15",
    timeOfBirth: "14:30",
    birthPlace: "Mumbai, Maharashtra",
    latitude: "19.0760",
    longitude: "72.8777",
  },
  "+919876543211": {
    firstName: "Priya",
    lastName: "Sharma",
    phoneNumber: "+919876543211",
    email: "priya.sharma@gmail.com",
    dateOfBirth: "1992-08-23",
    timeOfBirth: "08:45",
    birthPlace: "Delhi, NCR",
    latitude: "28.6139",
    longitude: "77.2090",
  },
  "+919876543212": {
    firstName: "Arjun",
    lastName: "Singh",
    phoneNumber: "+919876543212",
    email: "arjun.singh@gmail.com",
    dateOfBirth: "1988-12-05",
    timeOfBirth: "23:15",
    birthPlace: "Chandigarh, Punjab",
    latitude: "30.7333",
    longitude: "76.7794",
  },
  "+919876543213": {
    firstName: "Zara",
    lastName: "Khan",
    phoneNumber: "+919876543213",
    email: "zara.khan@gmail.com",
    dateOfBirth: "1997-03-30",
    timeOfBirth: "11:20",
    birthPlace: "Bangalore, Karnataka",
    latitude: "12.9716",
    longitude: "77.5946",
  },
  "+919876543214": {
    firstName: "Vihaan",
    lastName: "Gupta",
    phoneNumber: "+919876543214",
    email: "vihaan.gupta@gmail.com",
    dateOfBirth: "1993-06-18",
    timeOfBirth: "16:05",
    birthPlace: "Jaipur, Rajasthan",
    latitude: "26.9124",
    longitude: "75.7873",
  },
  "+919876543215": {
    firstName: "Ananya",
    lastName: "Reddy",
    phoneNumber: "+919876543215",
    email: "ananya.reddy@gmail.com",
    dateOfBirth: "1994-09-12",
    timeOfBirth: "05:30",
    birthPlace: "Hyderabad, Telangana",
    latitude: "17.3850",
    longitude: "78.4867",
  },
  "+919876543216": {
    firstName: "Kabir",
    lastName: "Malhotra",
    phoneNumber: "+919876543216",
    email: "kabir.malhotra@gmail.com",
    dateOfBirth: "1991-11-25",
    timeOfBirth: "19:45",
    birthPlace: "Kolkata, West Bengal",
    latitude: "22.5726",
    longitude: "88.3639",
  },
  "+919876543217": {
    firstName: "Aisha",
    lastName: "Verma",
    phoneNumber: "+919876543217",
    email: "aisha.verma@gmail.com",
    dateOfBirth: "1996-02-08",
    timeOfBirth: "13:10",
    birthPlace: "Pune, Maharashtra",
    latitude: "18.5204",
    longitude: "73.8567",
  },
  "+919876543218": {
    firstName: "Advait",
    lastName: "Kumar",
    phoneNumber: "+919876543218",
    email: "advait.kumar@gmail.com",
    dateOfBirth: "1990-07-21",
    timeOfBirth: "22:00",
    birthPlace: "Ahmedabad, Gujarat",
    latitude: "23.0225",
    longitude: "72.5714",
  },
  "+919876543219": {
    firstName: "Riya",
    lastName: "Mehta",
    phoneNumber: "+919876543219",
    email: "riya.mehta@gmail.com",
    dateOfBirth: "1998-01-14",
    timeOfBirth: "07:25",
    birthPlace: "Chennai, Tamil Nadu",
    latitude: "13.0827",
    longitude: "80.2707",
  },
  "+919876543220": {
    firstName: "Ishaan",
    lastName: "Chopra",
    phoneNumber: "+919876543220",
    email: "ishaan.chopra@gmail.com",
    dateOfBirth: "1989-05-03",
    timeOfBirth: "15:50",
    birthPlace: "Lucknow, Uttar Pradesh",
    latitude: "26.8467",
    longitude: "80.9462",
  },
  "+919876543221": {
    firstName: "Diya",
    lastName: "Kapoor",
    phoneNumber: "+919876543221",
    email: "diya.kapoor@gmail.com",
    dateOfBirth: "1999-10-17",
    timeOfBirth: "10:35",
    birthPlace: "Indore, Madhya Pradesh",
    latitude: "22.7196",
    longitude: "75.8577",
  },
  "+919876543222": {
    firstName: "Vivaan",
    lastName: "Joshi",
    phoneNumber: "+919876543222",
    email: "vivaan.joshi@gmail.com",
    dateOfBirth: "1987-04-29",
    timeOfBirth: "20:15",
    birthPlace: "Nagpur, Maharashtra",
    latitude: "21.1458",
    longitude: "79.0882",
  },
  "+919876543223": {
    firstName: "Mira",
    lastName: "Saxena",
    phoneNumber: "+919876543223",
    email: "mira.saxena@gmail.com",
    dateOfBirth: "1994-12-11",
    timeOfBirth: "04:40",
    birthPlace: "Bhopal, Madhya Pradesh",
    latitude: "23.2599",
    longitude: "77.4126",
  },
  "+919876543224": {
    firstName: "Reyansh",
    lastName: "Iyer",
    phoneNumber: "+919876543224",
    email: "reyansh.iyer@gmail.com",
    dateOfBirth: "1992-03-26",
    timeOfBirth: "17:55",
    birthPlace: "Surat, Gujarat",
    latitude: "21.1702",
    longitude: "72.8311",
  },
};

export async function GET(request: NextRequest) {
    try {
      const nextUrl = new URL(request.url);
      const pathParts = nextUrl.pathname.split('/');
      const phoneNumber = pathParts[pathParts.length - 1]; // Get the last segment as phoneNumber
  
      if (!phoneNumber || phoneNumber === '') {
        return NextResponse.json(
          { error: 'Phone number is required' },
          { status: 400 }
        );
      }
  
      const userData = mockUserDetails[phoneNumber];
  
      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 500 }
      );
    }
  }