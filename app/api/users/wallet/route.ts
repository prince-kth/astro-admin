import { NextResponse } from "next/server";

// Mock data for wallet balances - in a real app, this would be stored in a database
let userWallets = [
  { userId: 1, balance: 1250.75 },
  { userId: 2, balance: 450.25 },
  { userId: 3, balance: 2800.50 },
  { userId: 4, balance: 0.00 },
  { userId: 6, balance: 12520.75 },
  { userId: 7, balance: 51850.25 },
  { userId: 8, balance: 9375.50 },
  { userId: 9, balance: 82950.00 },
  { userId: 10, balance: 16625.25 },
];

// GET endpoint to fetch all user wallets
export async function GET() {
  try {
    return NextResponse.json({ wallets: userWallets });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}

// POST endpoint to update a user's wallet balance
export async function POST(request: Request) {
  try {
    const { userId, amount, operation } = await request.json();
    
    // Find the user's wallet
    const walletIndex = userWallets.findIndex(wallet => wallet.userId === userId);
    
    if (walletIndex === -1) {
      // If user doesn't have a wallet yet, create one
      if (operation === 'credit') {
        userWallets.push({ userId, balance: amount });
        return NextResponse.json({ 
          success: true, 
          message: 'Wallet created and credited successfully',
          balance: amount
        });
      } else {
        return NextResponse.json(
          { error: 'Cannot debit from non-existent wallet' },
          { status: 400 }
        );
      }
    }
    
    // Update the wallet balance based on the operation
    if (operation === 'credit') {
      userWallets[walletIndex].balance += amount;
    } else if (operation === 'debit') {
      if (userWallets[walletIndex].balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
      userWallets[walletIndex].balance -= amount;
    } else {
      return NextResponse.json(
        { error: 'Invalid operation. Use "credit" or "debit"' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Wallet ${operation}ed successfully`,
      balance: userWallets[walletIndex].balance
    });
    
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    );
  }
} 