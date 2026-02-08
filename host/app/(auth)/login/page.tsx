"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Better than <a> tag for Next.js

export default function LoginPage() {
  const router = useRouter();
  
  // State for form fields
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Prepare Data as URLSearchParams (Standard for FastAPI Form data)
      const params = new URLSearchParams();
      params.append("username", formData.username);
      params.append("password", formData.password);

      // 2. Send Request to your new endpoint
      const response = await fetch("http://localhost:8000/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid credentials");
      }

      const data = await response.json();

      // 3. Save User Data (You can switch to Context/Cookies later)
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      // 4. Redirect to Dashboard
      router.push("/work");

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Background: Matches Signup (Light Rose Gradient)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-white to-pink-50 font-sans text-slate-800">
      
      {/* 2. Card: White Frosted Glass */}
      <div className="w-full max-w-md p-10 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/50">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
                Welcome Back
            </h2>
            <p className="text-slate-500 text-sm mt-2">
                Enter your credentials to access the Data API
            </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="admin"
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
                Sign up
            </Link>
        </div>

      </div>
    </div>
  );
}