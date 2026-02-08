"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  
  // State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Client-Side Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // FIX 1: Convert data to URLSearchParams (Form Data)
      // Because your backend uses `Form(...)`, it cannot read JSON.
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('email', formData.email);
      params.append('password', formData.password);

      // FIX 2: Update URL to include the router prefix "/users"
      const response = await fetch("http://localhost:8000/users/signup/", {
        method: "POST",
        headers: { 
            // This tells FastAPI to parse it as form data
            "Content-Type": "application/x-www-form-urlencoded" 
        },
        body: params, // Send the params object, not JSON string
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      // 3. Success -> Redirect to Login
      router.push("/login");

    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (Your existing UI code remains exactly the same) ...
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 font-sans text-slate-800">
      <div className="w-full max-w-md p-10 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/50">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
                Create Account
            </h2>
            <p className="text-slate-500 text-sm mt-2">
                Join us to start scraping live data
            </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}