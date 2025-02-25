'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  // SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  Eye,
  FilterIcon,
  ListFilterIcon,
  PlusIcon,
  Loader2,
  Trash,
  Edit,
  MoreHorizontal,
  FileSpreadsheet,
  Search,
  LayoutGrid,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState, useCallback } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

type User = {
  id: number;
  name: string;
  email: string;
  package: "Basic" | "Premium";
  createdAt: string;
  walletBalance: number;
  mobileNumber: string;
  countryCode: string;
  city: string;
  country: string;
  status: "Active" | "Inactive" | "Blocked";
};

const initialUsers: User[] = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    package: "Premium",
    createdAt: "2024-02-15T10:30:00",
    walletBalance: 1250.75,
    mobileNumber: "9234567890",
    countryCode: "+91",
    city: "New York",
    country: "USA",
    status: "Active"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    package: "Basic",
    createdAt: "2024-02-16T15:45:00",
    walletBalance: 450.25,
    mobileNumber: "8876543210",
    countryCode: "+91",
    city: "Los Angeles",
    country: "USA",
    status: "Active"
  },
  { 
    id: 3, 
    name: "Bob Johnson", 
    email: "bob@example.com", 
    package: "Premium",
    createdAt: "2024-02-17T09:20:00",
    walletBalance: 2800.50,
    mobileNumber: "9551234567",
    countryCode: "+91",
    city: "Chicago",
    country: "USA",
    status: "Active"
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    package: "Premium",
    createdAt: "2024-02-18T14:10:00",
    walletBalance: 2300.25,
    mobileNumber: "9988776655",
    countryCode: "+91",
    city: "Miami",
    country: "USA",
    status: "Active"
    
  },
  {
    id: 5,
    name: "David Brown",
    email: "david@example.com",
    package: "Basic",
    createdAt: "2024-02-19T10:50:00",
    walletBalance: 1500.50,
    mobileNumber: "8877665544",
    countryCode: "+91",
    city: "Houston",
    country: "USA",
    status: "Active"
    
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily@example.com",
    package: "Basic",
    createdAt: "2024-02-20T12:30:00",
    walletBalance: 1000.75,
    mobileNumber: "9998887777",
    countryCode: "+91",
    city: "Phoenix",
    country: "USA",
    status: "Active"
    
  }
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = users;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    package: "Basic" as "Basic" | "Premium",
    walletBalance: 0,
    mobileNumber: "",
    countryCode: "+91",
    city: "",
    country: "",
    status: "Active" as "Active" | "Inactive" | "Blocked"
  });

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "srNo",
      header: "Sr. No",
      cell: ({ row }) => {
        return <div>{row.index + 1}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {/* <Avatar className="bg-gradient-to-br from-purple-500/80 to-blue-500/80">
            <AvatarFallback>{row.getValue("name").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar> */}
          <div className="font-medium">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Package",
      accessorKey: "package",
      cell: ({ row }) => (
        <Badge 
          variant={row.getValue("package") === "Premium" ? "default" : "secondary"}
          className={row.getValue("package") === "Premium" 
            ? "bg-purple-100 text-purple-700" 
            : "bg-blue-100 text-blue-700"}
        >
          {row.getValue("package")}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.getValue("status") === "Active" ? "default" :
            row.getValue("status") === "Inactive" ? "secondary" : "destructive"
          }
        >
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      header: "Phone",
      accessorKey: "mobileNumber",
      cell: ({ row }) => (
        <div>{row.original.countryCode} {row.getValue("mobileNumber")}</div>
      ),
    },
    {
      header: "Location",
      accessorKey: "city",
      cell: ({ row }) => (
        <div>{row.getValue("city")}, {row.original.country}</div>
      ),
    },
    {
      header: "Balance",
      accessorKey: "walletBalance",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("walletBalance"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return formatted;
      },
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user);
                setIsDrawerOpen(true);
              }}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setDeleteUser(user);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filterUsers = useCallback(() => {
    let filtered = [...initialUsers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobileNumber.includes(searchQuery) ||
        user.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (date?.from || date?.to) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt);
        if (date.from && date.to) {
          return userDate >= date.from && userDate <= date.to;
        } else if (date.from) {
          return userDate >= date.from;
        } else if (date.to) {
          return userDate <= date.to;
        }
        return true;
      });
    }

    setUsers(filtered);
  }, [searchQuery, date, initialUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    table.setPageSize(5);
  }, [table]);

  const handleAddEdit = async () => {
    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Please enter a name")
      return
    }
    if (!formData.email.trim()) {
      toast.error("Please enter an email")
      return
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }
    if (!formData.package) {
      toast.error("Please select a package")
      return
    }

    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (editingUser) {
        // Check if email already exists (except for current user)
        const emailExists = users.some(user => 
          user.email === formData.email && user.id !== editingUser.id
        )
        if (emailExists) {
          toast.error("A user with this email already exists")
          return
        }

        // Edit existing user
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? {
                ...user,
                name: formData.name.trim(),
                email: formData.email.trim(),
                package: formData.package,
                walletBalance: formData.walletBalance,
                mobileNumber: formData.mobileNumber,
                countryCode: formData.countryCode,
                city: formData.city,
                country: formData.country,
                status: formData.status
              }
            : user
        ))
        toast.success("User updated successfully")
      } else {
        // Check if email already exists
        if (users.some(user => user.email === formData.email)) {
          toast.error("A user with this email already exists")
          return
        }

        // Add new user
        const newUser: User = {
          id: users.length + 1,
          name: formData.name.trim(),
          email: formData.email.trim(),
          package: formData.package,
          createdAt: new Date().toISOString(),
          walletBalance: formData.walletBalance,
          mobileNumber: formData.mobileNumber,
          countryCode: formData.countryCode,
          city: formData.city,
          country: formData.country,
          status: formData.status
        }
        setUsers([...users, newUser])
        toast.success("User added successfully")
      }
      
      handleCloseDialog()
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (userId: number) => {
    const userToDelete = users.find(user => user.id === userId)
    if (userToDelete) {
      setDeleteUser(userToDelete)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!deleteUser) return

    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(users.filter(user => user.id !== deleteUser.id))
      toast.success("User deleted successfully")
      setIsDeleteDialogOpen(false)
      setDeleteUser(null)
    } catch (error) {
      toast.error("An error occurred while deleting the user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      package: user.package,
      walletBalance: user.walletBalance,
      mobileNumber: user.mobileNumber,
      countryCode: user.countryCode,
      city: user.city,
      country: user.country,
      status: user.status
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      package: "Basic",
      walletBalance: 0,
      mobileNumber: "",
      countryCode: "+91",
      city: "",
      country: "",
      status: "Active"
    })
  }

  const refreshData = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(initialUsers)
      toast.success("Data refreshed")
    } catch (error) {
      toast.error("Failed to refresh data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportToExcel = async () => {
    try {
      setIsLoading(true);
      
      // Load XLSX library dynamically
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/xlsx/dist/xlsx.full.min.js';
      document.body.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      // Prepare data for export
      const exportData = users.map(user => ({
        Name: user.name,
        Email: user.email,
        Package: user.package,
        Status: user.status,
        Phone: `${user.countryCode} ${user.mobileNumber}`,
        Location: `${user.city}, ${user.country}`,
        Balance: `$${user.walletBalance.toFixed(2)}`,
        'Created At': formatDate(user.createdAt)
      }));

      // @ts-ignore
      const XLSX = window.XLSX;
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(data);
      link.href = url;
      link.download = 'users.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export successful');
      
      // Cleanup
      document.body.removeChild(script);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    filterUsers();
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" expand={false} richColors closeButton />
      
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-600">User Management</h1>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-blue-100 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[240px]",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns().map((column) => {
                // Skip select and actions columns from toggle
                if (column.id === "select" || column.id === "actions" || column.id === "srNo") return null;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "mobileNumber" ? "Phone" : 
                     column.id === "createdAt" ? "Created At" : 
                     column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </Button>

          <Button
            onClick={handleExportToExcel}
            variant="outline"
            size="sm"
            className="h-9 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span>Export to Excel</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-100">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className="py-3 px-4 text-left font-semibold text-gray-900"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="py-3 px-4"
                    >
                      <div className={cn(
                        "flex items-center",
                        cell.column.id === "srNo" && "justify-center",
                        cell.column.id === "select" && "justify-center",
                        cell.column.id === "status" && "justify-start",
                        cell.column.id === "actions" && "justify-end"
                      )}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base flex items-center gap-2 text-red-600">
              {/* <AlertTriangle className="h-5 w-5" /> */}
              Confirm Deletion
            </DialogTitle>
            <div className="overflow-y-auto">
              <div className="px-6 py-4">
                <DialogDescription className="pt-3">
                  Are you sure you want to delete user <span className="font-medium">{deleteUser?.name}</span>?
                  This action cannot be undone.
                </DialogDescription>
              </div>
              <DialogFooter className="px-6 pb-6 gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4" />
                      Delete User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* User Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">User Details</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <div className="mt-1 text-sm">{selectedUser.name}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="mt-1 text-sm">{selectedUser.email}</div>
                    </div>
                    <div>
                      <Label>Package</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={selectedUser.package === "Premium" ? "default" : "secondary"}
                          className={selectedUser.package === "Premium" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-blue-100 text-blue-700"}
                        >
                          {selectedUser.package}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={
                            selectedUser.status === "Active" ? "default" :
                            selectedUser.status === "Inactive" ? "secondary" : "destructive"
                          }
                        >
                          {selectedUser.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number</Label>
                      <div className="mt-1 text-sm">{selectedUser.countryCode} {selectedUser.mobileNumber}</div>
                    </div>
                    <div>
                      <Label>City</Label>
                      <div className="mt-1 text-sm">{selectedUser.city}</div>
                    </div>
                    <div>
                      <Label>Country</Label>
                      <div className="mt-1 text-sm">{selectedUser.country}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Financial Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Wallet Balance</Label>
                      <div className="mt-1 text-sm">${selectedUser.walletBalance.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Serial Number</Label>
                      <div className="mt-1 text-sm">{indexOfFirstItem + currentItems.indexOf(selectedUser) + 1}</div>
                    </div>
                    <div>
                      <Label>Created At</Label>
                      <div className="mt-1 text-sm">{formatDate(selectedUser.createdAt)}</div>
                    </div>
                    <div>
                      <Label>User ID</Label>
                      <div className="mt-1 text-sm">{selectedUser.id}</div>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Close</Button>
                  <Button onClick={() => handleEdit(selectedUser)}>Edit User</Button>
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <div className="overflow-y-auto">
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Package</Label>
                    <Select value={formData.package} onValueChange={(value: "Basic" | "Premium") => setFormData({ ...formData, package: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wallet Balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter wallet balance"
                      value={formData.walletBalance}
                      onChange={(e) => setFormData({ ...formData, walletBalance: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
                    <Input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country Code</Label>
                    <Input
                      type="tel"
                      placeholder="Enter country code"
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      placeholder="Enter country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: "Active" | "Inactive" | "Blocked") => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="px-6 pb-6">
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleAddEdit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingUser ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingUser ? "Update User" : "Add User"}</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
