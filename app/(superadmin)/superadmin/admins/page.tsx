"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster, toast } from "sonner"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Shield, Mail, Calendar, Key } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample admin data
const ADMINS = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@astrofy.com",
    role: "Admin",
    permissions: ["users", "reports", "settings"],
    status: "Active",
    lastActive: "2023-05-15T10:30:00",
    createdAt: "2023-01-10T08:00:00",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@astrofy.com",
    role: "Super Admin",
    permissions: ["users", "reports", "settings", "admins", "system"],
    status: "Active",
    lastActive: "2023-05-16T14:45:00",
    createdAt: "2023-01-05T09:30:00",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@astrofy.com",
    role: "Admin",
    permissions: ["users", "reports"],
    status: "Inactive",
    lastActive: "2023-04-20T11:15:00",
    createdAt: "2023-02-15T10:00:00",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@astrofy.com",
    role: "Admin",
    permissions: ["users", "reports", "settings"],
    status: "Active",
    lastActive: "2023-05-16T09:20:00",
    createdAt: "2023-03-01T08:45:00",
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "michael.wilson@astrofy.com",
    role: "Admin",
    permissions: ["users", "reports"],
    status: "Active",
    lastActive: "2023-05-15T16:30:00",
    createdAt: "2023-03-10T11:20:00",
  },
  {
    id: 6,
    name: "Sarah Thompson",
    email: "sarah.thompson@astrofy.com",
    role: "Admin",
    permissions: ["users", "reports", "settings"],
    status: "Active",
    lastActive: "2023-05-16T13:10:00",
    createdAt: "2023-03-15T09:15:00",
  },
]

export default function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Admin",
    permissions: ["users", "reports"],
    status: "Active",
  })

  const filteredAdmins = ADMINS.filter((admin) => {
    // Filter by search query
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && admin.status === "Active") ||
      (activeTab === "inactive" && admin.status === "Inactive") ||
      (activeTab === "superadmin" && admin.role === "Super Admin")

    return matchesSearch && matchesTab
  })

  const handleAddAdmin = () => {
    // Validate form
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    // Add admin logic would go here
    toast.success("Admin added successfully")
    setIsAddDialogOpen(false)
    setFormData({
      name: "",
      email: "",
      role: "Admin",
      permissions: ["users", "reports"],
      status: "Active",
    })
  }

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin)
    setIsViewDialogOpen(true)
  }

  const handleDeleteAdmin = (admin) => {
    setSelectedAdmin(admin)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAdmin = () => {
    // Delete admin logic would go here
    toast.success(`Admin ${selectedAdmin.name} deleted successfully`)
    setIsDeleteDialogOpen(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-muted-foreground">Manage admin users and their permissions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Admin
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="superadmin">Super Admins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAdmins.map((admin) => (
          <Card key={admin.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback
                      className={
                        admin.role === "Super Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }
                    >
                      {admin.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{admin.name}</CardTitle>
                    <CardDescription className="text-sm">{admin.email}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewAdmin(admin)}>
                      <Shield className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAdmin(admin)}>
                      <Trash className="mr-2 h-4 w-4" /> Delete Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={admin.role === "Super Admin" ? "default" : "outline"}
                  className={admin.role === "Super Admin" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : ""}
                >
                  {admin.role}
                </Badge>
                <Badge
                  variant={admin.status === "Active" ? "default" : "destructive"}
                  className={admin.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                >
                  {admin.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Key className="h-3.5 w-3.5" />
                  <span>Permissions: {admin.permissions.join(", ")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last active: {formatDate(admin.lastActive)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <Button variant="ghost" className="w-full" onClick={() => handleViewAdmin(admin)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new admin user with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter admin name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter admin email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin}>Add Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Admin Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAdmin && (
            <>
              <DialogHeader>
                <DialogTitle>Admin Details</DialogTitle>
                <DialogDescription>Detailed information about this admin user.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback
                      className={
                        selectedAdmin.role === "Super Admin"
                          ? "bg-purple-100 text-purple-700 text-xl"
                          : "bg-blue-100 text-blue-700 text-xl"
                      }
                    >
                      {selectedAdmin.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedAdmin.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={selectedAdmin.role === "Super Admin" ? "default" : "outline"}
                        className={selectedAdmin.role === "Super Admin" ? "bg-purple-100 text-purple-700" : ""}
                      >
                        {selectedAdmin.role}
                      </Badge>
                      <Badge
                        variant={selectedAdmin.status === "Active" ? "default" : "destructive"}
                        className={selectedAdmin.status === "Active" ? "bg-green-100 text-green-700" : ""}
                      >
                        {selectedAdmin.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedAdmin.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Permissions</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAdmin.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="capitalize">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p className="font-medium">{formatDate(selectedAdmin.lastActive)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created At</p>
                      <p className="font-medium">{formatDate(selectedAdmin.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button>Edit Admin</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedAdmin && (
            <>
              <DialogHeader>
                <DialogTitle className="text-red-600">Delete Admin</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this admin? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="font-medium">{selectedAdmin.name}</p>
                <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAdmin}>
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

