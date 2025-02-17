'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const consumers = [
  {
    id: 1,
    name: "Acme Corp",
    apiKey: "ak_1234567890",
    usageThisMonth: 50000,
    creditBalance: 950000,
    status: "Active",
  },
  {
    id: 2,
    name: "Globex Inc",
    apiKey: "ak_0987654321",
    usageThisMonth: 75000,
    creditBalance: 425000,
    status: "Active",
  },
  {
    id: 3,
    name: "Initech LLC",
    apiKey: "ak_1122334455",
    usageThisMonth: 25000,
    creditBalance: 175000,
    status: "Inactive",
  },
]

export function APIConsumersTable() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">API Consumers</h2>
        <Badge variant="outline" className="px-4 py-1">
          {consumers.length} Total
        </Badge>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-slate-50/50">
            <TableHead className="font-semibold text-slate-900">Name</TableHead>
            <TableHead className="font-semibold text-slate-900">API Key</TableHead>
            <TableHead className="font-semibold text-slate-900">Usage This Month</TableHead>
            <TableHead className="font-semibold text-slate-900">Credit Balance</TableHead>
            <TableHead className="font-semibold text-slate-900">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consumers.map((consumer) => (
            <TableRow key={consumer.id} className="hover:bg-slate-50/80 transition-colors">
              <TableCell className="font-medium">{consumer.name}</TableCell>
              <TableCell className="font-mono text-sm text-slate-600">{consumer.apiKey}</TableCell>
              <TableCell className="text-blue-600 font-medium">{consumer.usageThisMonth.toLocaleString('en-US')}</TableCell>
              <TableCell className="text-emerald-600 font-medium">{consumer.creditBalance.toLocaleString('en-US')}</TableCell>
              <TableCell>
                <Badge 
                  variant={consumer.status === "Active" ? "default" : "secondary"}
                  className={consumer.status === "Active" 
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
                >
                  {consumer.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
