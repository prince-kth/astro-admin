'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  CreditCard, 
  PlusCircle, 
  MinusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableHead,
  TableRow
} from "@/components/ui/table";
import { 
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { 
  ChevronFirstIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronLastIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  package: "Basic" | "Premium";
  walletBalance: number;
  city: string;
  country: string;
  status: "Active" | "Blocked";
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reports: number;
    transactions: number;
  };
}

interface Transaction {
  id: string;
  userId: number;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Wallet {
  userId: number;
  balance: number;
  exists: boolean;
  transactionCount?: number;
}

interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface WalletResponse {
  userId: number;
  balance: number;
  transactionCount: number;
  exists: boolean;
}

// Fetch transactions from API
async function fetchTransactions(userId: number): Promise<Transaction[]> {
  try {
    const response = await fetch(`/api/users/transactions/${userId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch transactions');
    }
    
    return data.transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    toast.error('Failed to fetch transactions');
    return [];
  }
};

// Create new transaction
async function createTransaction(
  userId: number,
  amount: number,
  type: 'credit' | 'debit',
  description: string
): Promise<Transaction | null> {
  try {
    const response = await fetch('/api/users/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        type,
        description,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create transaction');
    }
    
    return data.transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to create transaction');
    return null;
  }
};

// Loading row component for table
const LoadingRow = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
  </TableRow>
);

export default function WalletPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);
  const [operation, setOperation] = useState<'credit' | 'debit'>('credit');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users/list');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch users');
        }
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch wallet data when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setWallet(null);
      setTransactions([]);
      return;
    }

    const fetchWallet = async () => {
      setLoadingWallet(true);
      try {
        // Extract user ID from phone number for demo purposes
        // In a real app, you would use the actual user ID
        const userId = parseInt(selectedUser.replace(/\D/g, '').slice(-1)) || 1;
        
        const response = await fetch(`/api/users/wallet/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
          setWallet(data);
          // Fetch transactions
          const fetchedTransactions = await fetchTransactions(userId);
          setTransactions(fetchedTransactions);
        } else {
          toast.error(data.error || 'Failed to load wallet');
          setWallet(null);
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
        toast.error('Failed to load wallet');
        setWallet(null);
        setTransactions([]);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWallet();
  }, [selectedUser]);

  const handleSubmit = async () => {
    if (!selectedUser || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('Please select a user and enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Extract user ID from phone number for demo purposes
      // In a real app, you would use the actual user ID
      const userId = parseInt(selectedUser.replace(/\D/g, '').slice(-1)) || 1;
      
      const response = await fetch('/api/users/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          operation,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || `Wallet ${operation}ed successfully`);
        // Update the wallet balance
        setWallet(prev => prev ? { ...prev, balance: data.balance } : null);
        
        // Create new transaction
        const newTransaction = await createTransaction(userId, parseFloat(amount), operation, operation === 'credit' ? 'Manual credit adjustment' : 'Manual debit adjustment');
        if (newTransaction) {
          setTransactions(prev => [newTransaction, ...prev]);
        }
        setAmount(''); // Reset amount field
      } else {
        toast.error(data.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.phoneNumber.includes(searchQuery)
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status badge for transactions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return null;
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="h-5 w-5 text-amber-500" />;
    if (status === 'failed') return <AlertCircle className="h-5 w-5 text-red-500" />;
    
    return type === 'credit' 
      ? <ArrowUpRight className="h-5 w-5 text-green-500" />
      : <ArrowDownLeft className="h-5 w-5 text-red-500" />;
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <div className="flex items-center gap-2">
            {type === 'credit' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownLeft className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(
              "capitalize",
              type === 'credit' ? "text-green-600" : "text-red-600"
            )}>
              {type}
            </span>
          </div>
        );
      },
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const type = row.original.type;
        return (
          <div className={cn(
            "font-medium",
            type === 'credit' ? "text-green-600" : "text-red-600"
          )}>
            {type === 'credit' ? '+' : '-'}{formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Date",
      accessorKey: "timestamp",
      cell: ({ row }) => format(new Date(row.getValue("timestamp")), 'MMM dd, yyyy HH:mm'),
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" expand={false} richColors closeButton />
      
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-600">Wallet Management</h1>
        <p className="text-slate-500 mt-1">Manage user credits and transactions</p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-blue-100 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Select 
            value={selectedUser} 
            onValueChange={setSelectedUser}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="p-2 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </div>
              ) : users.length === 0 ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  No users found
                </div>
              ) : (
                users.map((user) => (
                  <SelectItem 
                    key={user.id} 
                    value={user.id.toString()}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddEditOpen(true)}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet ? formatCurrency(wallet.balance) : '₹0.00'}</div>
            <p className="text-xs text-slate-500 mt-1">Available Credits</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total Amount Credited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total Amount Debited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-slate-500 mt-1">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-100">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-3 px-4 text-left font-semibold text-gray-900">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <LoadingRow key={`loading-${index}`} />
                ))}
              </>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="h-8 w-8 text-slate-400" />
                    <p className="text-sm text-slate-500">No transactions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of {transactions.length} transactions
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                          table.setPageSize(Number(value));
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          {table.getState().pagination.pageSize}
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <span className="sr-only">Go to first page</span>
                        <ChevronFirstIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                      >
                        <span className="sr-only">Go to last page</span>
                        <ChevronLastIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Add a new transaction to the selected user's wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Operation</Label>
              <Tabs value={operation} onValueChange={(v) => setOperation(v as 'credit' | 'debit')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="credit" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Credit
                  </TabsTrigger>
                  <TabsTrigger value="debit" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                    <MinusCircle className="h-4 w-4 mr-2" />
                    Debit
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                <Input
                  placeholder="Enter amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
              className={cn(
                operation === 'credit' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {operation === 'credit' ? (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <MinusCircle className="mr-2 h-4 w-4" />
                  )}
                  {operation === 'credit' ? 'Add Credit' : 'Deduct Credit'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 