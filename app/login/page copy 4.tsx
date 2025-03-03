"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "sonner"
import { useRouter } from "next/navigation"
import { Moon, Stars, Sun, Eye, EyeOff, GalleryVerticalEnd, Rocket } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { LoginForm } from "@/components/login-form"

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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Rocket className="size-4" />
            </div>
            Astrofy.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="e.g. admin@example.com"
                    className="h-12 bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-purple-400/50 focus:border-purple-400 transition-colors pl-11"
                    defaultValue={VALID_EMAIL}
                  />
                  <Stars className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-purple-400/50 focus:border-purple-400 transition-colors pl-11 pr-11"
                    defaultValue={VALID_PASSWORD}
                  />
                  <Sun className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
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
      </div>

     
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://img.freepik.com/free-vector/gradient-abstract-wireframe-background_23-2148997904.jpg?t=st=1739949843~exp=1739953443~hmac=95274ec6829ca179f2daacfd12a5e695a3d32d9a0635563a32165f9f45f91496&w=900"
          alt="Login background"
          className="absolute inset-1 h-full w-full object-cover "
        />
      </div>
    </div>
  )
}
