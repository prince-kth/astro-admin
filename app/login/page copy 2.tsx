"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "sonner"
import { useRouter } from "next/navigation"
import { Moon, Stars, Sun, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(5, "Password must be at least 6 characters"),
})

type LoginValues = z.infer<typeof loginSchema>

const VALID_EMAIL = "admin@gmail.com"
const VALID_PASSWORD = "admin"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
    },
  })

  const handleSubmit = async (data: LoginValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (data.email === VALID_EMAIL && data.password === VALID_PASSWORD) {
        document.cookie = "isAuthenticated=true; path=/; max-age=86400"
        toast.success("Login successful!")
        router.push("/dashboard")
      } else {
        toast.error("Invalid email or password")
      }
    } catch (error) {
      toast.error("An error occurred during login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 -z-10 bg-[#0B1120]"
        style={{
          backgroundImage: 'url(https://img.freepik.com/free-vector/gradient-numerology-background_23-2150001894.jpg?t=st=1739794416~exp=1739798016~hmac=2a3c5301461448adc64b5c76a50f82a16ec6c93d927b1b6a8c434bedda7ed8f9&w=900)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay with gradient and blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120]/80 via-purple-900/50 to-[#0B1120]/90 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"></div>

      <Toaster position="top-right" expand={false} richColors />
      
      <div className="w-[420px] backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10 relative z-10">
        <div className="flex flex-col items-center space-y-4 mb-8">
          {/* Logo container with animated gradient */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Moon className="w-8 h-8 text-white relative z-10 group-hover:rotate-180 transition-transform duration-500" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">
            Welcome to Astrofy
          </h1>
          <p className="text-sm text-indigo-200/80 text-center max-w-[280px]">
            Enter your credentials to access the cosmic dashboard
          </p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-200">Email</label>
            <div className="relative">
              <Input
                {...form.register("email")}
                type="email"
                placeholder="e.g. admin@example.com"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/50 hover:border-purple-400/50 focus:border-purple-400 transition-colors pl-11"
                defaultValue={VALID_EMAIL}
              />
              <Stars className="w-5 h-5 text-indigo-300 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-200">Password</label>
            <div className="relative">
              <Input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/50 hover:border-purple-400/50 focus:border-purple-400 transition-colors pl-11 pr-11"
                defaultValue={VALID_PASSWORD}
              />
              <Sun className="w-5 h-5 text-indigo-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-200 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200 rounded-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              "Enter the Cosmos"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
