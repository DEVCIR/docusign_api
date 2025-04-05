"use client";

import type React from "react";

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Add these imports
import Logo from "../../components/Logo";
import TestimonialCard from "../../components/TestimonialCard";
import DashboardPreview from "../../components/DashboardPreview";
import { apiUrl } from "../../config/api";
import axios from "axios";
import { AuthResponse } from "./Login";

const LoginPage = () => {
  const navigate = useNavigate();
  // const token = localStorage.getItem("token");
  // if (token) {
  //   navigate("/dashboard");
  // }
  const [email, setEmail] = useState<string>("admin@example.com");
  const [password, setPassword] = useState<string>("password123");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("submit working");
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);

    const loginRequest = {
      url: `${apiUrl}/api/admin/login`,
      data: {
        email,
        password,
      },
      config: {
        withCredentials: true,
      },
    };

    try {
      const response = await axios.post<AuthResponse>(
        loginRequest.url,
        loginRequest.data,
        loginRequest.config
      );

      localStorage.setItem("token", response.data.access_token);
      console.log(response.data);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }

    navigate("/dashboard");
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex flex-col items-center justify-center w-full max-w-md px-6 py-8 mx-auto">
        <div className="w-full max-w-sm">
          <Logo />
          {error && <div className="text-danger mb-3">{error}</div>}
          <h1 className="mt-6 text-2xl font-bold text-gray-900 text-center">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Welcome back! Please enter your details.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="block ml-2 text-sm text-gray-700"
                >
                  Remember for 30 days
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? "Loading..." : "Sign in"}
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
                Sign in with Google
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <div
          className="flex flex-col h-full rounded-lg overflow-hidden mr-4 md:mr-8"
          style={{ backgroundColor: "#F2F4F7" }}
        >
          <div className="p-6">
            <TestimonialCard />
          </div>
          <div className="flex-1 pl-6 pr-0 pb-0 mt-2">
            {/* Custom positioning for login page */}
            <div className="relative w-full h-full overflow-hidden">
              <div
                className="absolute"
                style={{
                  top: "0", // Position at the top of container
                  left: "0", // Start from left edge
                  right: "-15%", // Extend beyond right edge
                  bottom: "-15%", // Extend beyond bottom edge
                  width: "115%", // Make wider than container
                  transformOrigin: "top left", // Scale from top left
                }}
              >
                <div className="relative bg-gray-800 rounded-lg p-0.5 sm:p-1 md:p-1.5 w-full shadow-xl">
                  <div className="bg-white rounded overflow-hidden aspect-[16/10]">
                    <img
                      src="/image.png"
                      alt="Dashboard Preview"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/800x500?text=Dashboard+Preview";
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
  );
};

export default LoginPage;
