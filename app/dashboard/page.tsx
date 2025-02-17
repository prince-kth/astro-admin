'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, Users, Key, CreditCard, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { APIConsumersTable } from "@/components/api-consumers-table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
        
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-emerald-500">+20.1% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-emerald-500">+19 since last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-emerald-500">+201K this month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-emerald-500">+20.1% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent API Consumers</CardTitle>
                <CardDescription>Overview of recent API usage and performance</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <APIConsumersTable />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <div className="text-sm font-medium">API Response Time</div>
                  </div>
                  <div className="text-sm text-muted-foreground">120ms avg</div>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div className="text-sm font-medium">System Uptime</div>
                  </div>
                  <div className="text-sm text-muted-foreground">99.9%</div>
                </div>
                <Progress value={99} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">Error Rate</div>
                  </div>
                  <div className="text-sm text-muted-foreground">0.01%</div>
                </div>
                <Progress value={2} className="h-2" />
              </div>

              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold">Recent System Events</h4>
                <div className="space-y-2">
                  {[
                    { time: '2 mins ago', message: 'New API key generated', status: 'success' },
                    { time: '15 mins ago', message: 'System update completed', status: 'success' },
                    { time: '1 hour ago', message: 'Database backup completed', status: 'success' },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <div className={`h-2 w-2 rounded-full ${
                        event.status === 'success' ? 'bg-emerald-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-muted-foreground">{event.time}</span>
                      <span>{event.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
