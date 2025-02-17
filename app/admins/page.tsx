'use client';

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PlusCircle, Edit, Trash, Search, RefreshCw, Shield } from "lucide-react"
import { useState } from "react"

const admins = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    role: "Superadmin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    lastActive: "2 hours ago"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    role: "Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    lastActive: "5 mins ago"
  },
  { 
    id: 3, 
    name: "Bob Johnson", 
    email: "bob@example.com", 
    role: "Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    lastActive: "1 day ago"
  },
]

export default function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || admin.role.toLowerCase() === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Admin Management
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Admin
        </Button>
      </div>

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
              <SelectItem value="superadmin">Superadmin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-900">Admin</TableHead>
              <TableHead className="font-semibold text-slate-900">Email</TableHead>
              <TableHead className="font-semibold text-slate-900">Role</TableHead>
              <TableHead className="font-semibold text-slate-900">Last Active</TableHead>
              <TableHead className="font-semibold text-slate-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{admin.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{admin.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={admin.role === "Superadmin" ? "default" : "secondary"}
                    className={admin.role === "Superadmin" 
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200" 
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{admin.lastActive}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-red-600">
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
