"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react" // Add these imports
import Logo from "../components/Logo"
import TestimonialCard from "../components/TestimonialCard"
import DashboardPreview from "../components/DashboardPreview"

const SignUpPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) // Add this state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would register with a backend here
    navigate("/dashboard")
  }

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex flex-col items-center justify-center w-full max-w-md px-6 py-8 mx-auto">
        <div className="w-full max-w-sm">
          <Logo />

          <h1 className="mt-6 text-2xl font-bold text-gray-900 text-center">Start your free trial</h1>
          <p className="mt-2 text-sm text-gray-600 text-center">Sign up in less than 2 minutes.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
            </div>

            <div>
              <button
                type="submit"
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get started
              </button>
            </div>

            <div>
              <button
                type="button"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign up with Google
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Log in
            </a>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <div className="flex flex-col h-full rounded-lg overflow-hidden mr-4 md:mr-8" style={{ backgroundColor: "#F2F4F7" }}>
          <div className="p-6">
            <TestimonialCard />
          </div>
          <div className="flex-1 pl-6 pr-0 pb-0 mt-2 overflow-hidden">
            {/* Custom positioning for signup page with overflow clipping - increased height */}
            <div className="relative w-full" style={{ height: "calc(100% + 40px)" }}>
              <div 
                className="absolute" 
                style={{ 
                  top: "0", 
                  left: "0", 
                  right: "-15%",
                  width: "115%",
                  height: "calc(100% - 10px)",
                  clipPath: "inset(0 0 0 0)",
                }}>
                <div className="relative bg-gray-800 rounded-t-lg p-0.5 sm:p-1 md:p-1.5 w-full h-full shadow-xl">
                  <div className="bg-white rounded-t overflow-hidden h-full">
                    <img
                      src="/image.png"
                      alt="Dashboard Preview"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/800x500?text=Dashboard+Preview"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage

