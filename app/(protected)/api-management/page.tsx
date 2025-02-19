'use client';

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash, Power, Search, RefreshCw } from "lucide-react"
import { useState } from "react"

const apiKeys = [
  {
    id: 1,
    key: "ak_1234567890",
    client: "Acme Corp",
    expiryDate: "2024-12-31",
    status: "Active",
  },
  {
    id: 2,
    key: "ak_0987654321",
    client: "Globex Inc",
    expiryDate: "2024-06-30",
    status: "Active",
  },
  {
    id: 3,
    key: "ak_1122334455",
    client: "Initech LLC",
    expiryDate: "2023-12-31",
    status: "Inactive",
  },
]

export default function APIManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.key.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || key.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          API Management
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Create API Key
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by client or API key..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-900">API Key</TableHead>
              <TableHead className="font-semibold text-slate-900">Client</TableHead>
              <TableHead className="font-semibold text-slate-900">Expiry Date</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="font-semibold text-slate-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKeys.map((apiKey) => (
              <TableRow key={apiKey.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="font-mono text-sm">{apiKey.key}</TableCell>
                <TableCell className="font-medium">{apiKey.client}</TableCell>
                <TableCell>{apiKey.expiryDate}</TableCell>
                <TableCell>
                  <Badge 
                    variant={apiKey.status === "Active" ? "default" : "secondary"}
                    className={apiKey.status === "Active" 
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
                  >
                    {apiKey.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-amber-600">
                      <Power className="h-4 w-4" />
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
