'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Shield, Bell, Globe, Database, Mail, Palette, Languages } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const themeColors = [
  { name: 'blue', color: '#2563eb', hue: 221.2 },
  { name: 'purple', color: '#7c3aed', hue: 259.1 },
  { name: 'green', color: '#16a34a', hue: 142.1 },
  { name: 'orange', color: '#ea580c', hue: 24.6 }
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeColor, setActiveColor] = useState('blue')

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Get stored theme color from localStorage
    const storedColor = localStorage.getItem('theme-color') || 'blue'
    setActiveColor(storedColor)
    updateThemeColor(storedColor)
  }, [])

  const updateThemeColor = (colorName: string) => {
    const color = themeColors.find(c => c.name === colorName)
    if (!color) return

    // Update CSS variables
    const root = document.documentElement
    root.style.setProperty('--primary-hue', color.hue.toString())
    root.style.setProperty('--sidebar-ring-hue', color.hue.toString())
    
    // Store the selection
    localStorage.setItem('theme-color', colorName)
  }

  const handleColorChange = (colorName: string) => {
    setActiveColor(colorName)
    updateThemeColor(colorName)
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto p-6 max-w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        Settings
        </h1>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="bg-white border border-slate-200 p-1 gap-1 rounded-lg">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 gap-2 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 gap-2 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 gap-2 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="api" 
            className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 gap-2 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Globe className="w-4 h-4" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-slate-900">Appearance</CardTitle>
                </div>
                <CardDescription className="text-slate-600">
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-900">
                      Application Name
                    </Label>
                    <div className="mt-2">
                      <Input 
                        defaultValue="Astrophi Admin" 
                        className="border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* <div className="flex items-center justify-between py-6 space-x-6">
                    <div className="flex-grow">
                      <Label className="text-base font-medium text-slate-900">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-slate-600 mt-1.5">
                        Enable dark mode for better visibility in low-light conditions
                      </p>
                    </div>
                    <Switch 
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => {
                        setTheme(checked ? "dark" : "light")
                      }}
                      className="mt-0.5"
                    />
                  </div> */}

                  <div className="h-px bg-slate-200 my-6" />

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium text-slate-900">
                        Theme Color
                      </Label>
                      <p className="text-sm text-slate-600 mt-1.5">
                        Choose your preferred accent color for the interface
                      </p>
                    </div>
                    <div className="flex gap-4 mt-4">
                      {themeColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleColorChange(color.name)}
                          className={`
                            w-10 h-10 rounded-full transition-all duration-200 hover:scale-110
                            ${activeColor === color.name ? 'ring-2 ring-offset-2 ring-offset-white shadow-lg' : ''}
                          `}
                          style={{
                            backgroundColor: color.color,
                            borderColor: color.color
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-slate-900">Localization</CardTitle>
                </div>
                <CardDescription className="text-slate-600">
                  Language and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-slate-900">
                      Default Language
                    </Label>
                    <p className="text-sm text-slate-600 mt-1.5">
                      Select your preferred language
                    </p>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-2 border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-slate-900 dark:text-white">Authentication</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Manage authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      Two-Factor Authentication
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Require 2FA for all admin users
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    Session Timeout
                  </Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="max-w-md border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Automatically log out inactive users
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-slate-900 dark:text-white">Data Protection</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Configure data security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      Data Encryption
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Enable end-to-end encryption for sensitive data
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      Audit Logging
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Track all security-related events
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-slate-900 dark:text-white">Email Notifications</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Configure email alert preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      Security Alerts
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Get notified about security events
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      API Usage Alerts
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Notifications for API limit warnings
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      System Updates
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Receive system maintenance notifications
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-slate-900 dark:text-white">In-App Notifications</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Manage in-app notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      Desktop Notifications
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Show desktop notifications
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      Sound Alerts
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Play sound for important notifications
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-slate-900 dark:text-white">API Rate Limits</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Configure API usage limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-200" htmlFor="daily-limit">
                    Daily API Request Limit
                  </Label>
                  <Input 
                    id="daily-limit" 
                    type="number" 
                    placeholder="e.g., 10000" 
                    defaultValue="10000" 
                    className="max-w-md border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Maximum API calls per day
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-200" htmlFor="monthly-limit">
                    Monthly API Request Limit
                  </Label>
                  <Input 
                    id="monthly-limit" 
                    type="number" 
                    placeholder="e.g., 300000" 
                    defaultValue="300000" 
                    className="max-w-md border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Maximum API calls per month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-slate-900 dark:text-white">API Security</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Configure API security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    Rate Limiting Strategy
                  </Label>
                  <Select defaultValue="sliding">
                    <SelectTrigger className="max-w-md border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sliding">Sliding Window</SelectItem>
                      <SelectItem value="fixed">Fixed Window</SelectItem>
                      <SelectItem value="token">Token Bucket</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    How rate limits are calculated
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      API Key Rotation
                    </Label>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Automatically rotate keys every 90 days
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-200 hover:bg-blue-700 hover:text-white">
          Reset to Defaults
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 hover:text-white">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
