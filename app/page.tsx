import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Key, CreditCard } from "lucide-react"
import { APIConsumersTable } from "@/components/api-consumers-table"
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,234,567</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="text-emerald-500">↑</span>
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">10,482</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="text-emerald-500">↑</span>
              +180 new users
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">573</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="text-emerald-500">↑</span>
              +201 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Consumption</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">892,012</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="text-emerald-500">↑</span>
              +19% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <APIConsumersTable />
      </div>
    </div>
  )
}

// export async function generateMetadata() {
//   return {
//     title: 'Redirecting...',
//   }
// }

// export default async function Home() {
//   const redirectUrl = '/dashboard'
//   return (
//     <>
//       <meta httpEquiv="refresh" content={`0;url=${redirectUrl}`} />
//       <script>
//         {`window.location.href = '${redirectUrl}'`}
//       </script>
//     </>
//   )
// }
