"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Database, Globe, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function SuperadminDashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Superadmin Dashboard</h2>
          <p className="text-muted-foreground">Welcome to the superadmin control panel.</p>
        </div>
        <Button variant="default">System Status</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <UserCog className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-emerald-500">+3 from last month</p>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4 GB</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-emerald-500">+1.2 GB since last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$145,231.89</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-emerald-500">+32.5% from last month</p>
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
                <CardTitle>Admin Activity</CardTitle>
                <CardDescription>Recent actions by admin users</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { admin: "John Doe", action: "Created new API key", time: "2 mins ago" },
                { admin: "Jane Smith", action: "Updated user settings", time: "15 mins ago" },
                { admin: "Robert Johnson", action: "Deleted user account", time: "1 hour ago" },
                { admin: "Emily Davis", action: "Modified system settings", time: "3 hours ago" },
                { admin: "Michael Wilson", action: "Generated monthly report", time: "5 hours ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserCog className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.admin}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <div className="text-sm font-medium">Server Uptime</div>
                  </div>
                  <div className="text-sm text-muted-foreground">99.99%</div>
                </div>
                <Progress value={99.99} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    <div className="text-sm font-medium">Database Load</div>
                  </div>
                  <div className="text-sm text-muted-foreground">42%</div>
                </div>
                <Progress value={42} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-indigo-500" />
                    <div className="text-sm font-medium">API Response Time</div>
                  </div>
                  <div className="text-sm text-muted-foreground">85ms</div>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">Error Rate</div>
                  </div>
                  <div className="text-sm text-muted-foreground">0.005%</div>
                </div>
                <Progress value={0.5} className="h-2" />
              </div>

              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold">Recent System Events</h4>
                <div className="space-y-2">
                  {[
                    { time: "5 mins ago", message: "Database backup completed", status: "success" },
                    { time: "30 mins ago", message: "System update scheduled", status: "info" },
                    { time: "2 hours ago", message: "Security scan completed", status: "success" },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          event.status === "success"
                            ? "bg-emerald-500"
                            : event.status === "info"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                      />
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

