'use client';

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from "sonner"
import { PlusCircle, Edit, Trash, Search, RefreshCw, Shield, Loader2, AlertTriangle } from "lucide-react"
import { useState } from "react"

interface User {
  id: number
  name: string
  email: string
  role: "Premium" | "Basic"
  createdAt: string
  walletBalance: number
}

const initialUsers: User[] = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    role: "Premium",
    createdAt: "2024-02-15T10:30:00",
    walletBalance: 1250.75
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    role: "Basic",
    createdAt: "2024-02-16T15:45:00",
    walletBalance: 450.25
  },
  { 
    id: 3, 
    name: "Bob Johnson", 
    email: "bob@example.com", 
    role: "Premium",
    createdAt: "2024-02-17T09:20:00",
    walletBalance: 2800.50
  },
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
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Basic" as "Basic" | "Premium",
    walletBalance: 0
  })

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

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
    if (!formData.role) {
      toast.error("Please select a role")
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
                role: formData.role,
                walletBalance: formData.walletBalance
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
          role: formData.role,
          createdAt: new Date().toISOString(),
          walletBalance: formData.walletBalance
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
      role: user.role,
      walletBalance: user.walletBalance
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      role: "Basic",
      walletBalance: 0
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

  return (
    <div className="w-full flex-1 space-y-6 p-8 pt-6">
      <Toaster position="top-right" expand={false} richColors closeButton />
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          User Management
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setFormData({ name: "", email: "", role: "Basic", walletBalance: 0 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(value: "Basic" | "Premium") => setFormData({ ...formData, role: value })}>
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
            </div>
            <DialogFooter>
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-3">
              Are you sure you want to delete user <span className="font-medium">{deleteUser?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
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
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-900">User</TableHead>
              <TableHead className="font-semibold text-slate-900">Email</TableHead>
              <TableHead className="font-semibold text-slate-900">Role</TableHead>
              <TableHead className="font-semibold text-slate-900">Wallet Balance</TableHead>
              <TableHead className="font-semibold text-slate-900">Created At</TableHead>
              <TableHead className="font-semibold text-slate-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-gradient-to-br from-purple-500/80 to-blue-500/80">
                      <AvatarFallback className="text-white font-medium bg-green">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === "Premium" ? "default" : "secondary"}
                    className={user.role === "Premium" 
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200" 
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">
                    ${user.walletBalance.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:text-blue-600"
                      onClick={() => handleEdit(user)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:text-red-600"
                      onClick={() => handleDelete(user.id)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
