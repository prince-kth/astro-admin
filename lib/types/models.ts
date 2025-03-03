export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  package: "Basic" | "Premium";
  walletBalance: number;
  city: string;
  country: string;
  status: "Active" | "Inactive" | "Blocked";
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: number;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
}

export interface Report {
  id: string;
  userId: number;
  type: string;
  generatedAt: string;
  status: string;
  pdfUrl?: string;
  cost: number;
}
