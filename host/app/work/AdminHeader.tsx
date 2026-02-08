"use client";
import { useState, useEffect } from "react";
import React from "react";
import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("Admin"); 

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Get the ID from Local Storage
      const userId = localStorage.getItem("user_id");

      try {
        // 2. Use GET and pass user_id in the URL (?)
        const response = await fetch(`http://localhost:8000/users/profile/?user_id=${userId}`);

        if (!response.ok) {
          router.push("/login");
        }

        const data = await response.json();
        
        if (data.username) {
            setUsername(data.username);
        }

      } catch (error) {
        console.error("Profile Error:", error);
      }
    };

    fetchProfile();
  }, [router]);

  // Helper for "SU" from "Sujal"
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-rose-100 bg-white/80 backdrop-blur-xl px-8">
      {/* Right Side Actions */}
      <div className="flex items-center justify-end w-full gap-4">

        <div className="flex items-center  gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700">{username}</p>
                <p className="text-xs text-slate-500">Administrator</p>
            </div>

            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-400 to-pink-400 p-[2px] cursor-pointer shadow-md shadow-rose-200">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-sm font-bold text-rose-600">
                    {getInitials(username)}
                </div>
            </div>
        </div>
      </div>
    </header>
  );
}