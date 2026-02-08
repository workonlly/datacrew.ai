"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LogOut, Plus, X, VenetianMask, Pencil, Check, AlertCircle
} from "lucide-react";

interface Mask {
  id: string;       // String to safely handle 64-bit DB IDs
  user_id: string;  
  mask_name: string;
  api_key?: string;
  title?: string;
  description?: string;
  site_url?: string[];
  created_at: string;
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [loading, setLoading] = useState(true);
  const [masks, setMasks] = useState<Mask[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  // Store User ID as a STRING to prevent rounding errors
  const [userId, setUserId] = useState<string | null>(null); 

  // State for Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const API_URL = "http://localhost:8000/masks";

  // --- 1. Fetch User Profile ---
  const fetchProfile = async () => {
    const storedId = localStorage.getItem("user_id");
    
    if (storedId) {
        setUserId(storedId); 
    }

    try {
      const response = await fetch(`http://localhost:8000/users/profile/?user_id=${storedId}`);

      if (!response.ok) return;

      const data = await response.json();
      if (data.id) {
         setUserId(String(data.id)); 
      }
    } catch (error) {
      console.error("Profile Error:", error);
    }
  };

  // --- 2. Fetch Masks ---
  const fetchMasks = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      if (response.ok) {
        const data = await response.json();
        // Ensure all IDs are strings immediately upon receiving
        const safeData = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            user_id: String(item.user_id)
        }));
        setMasks(safeData);
      } else {
        console.error("Failed to fetch masks");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchMasks();
  }, []);

  // --- 3. CREATE (Add Mask) ---
  const handleAddMask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    const formData = new FormData();
    formData.append("mask_name", inputValue.trim());
    formData.append("user_id", userId);
    formData.append("description", "New Mask Description");

    try {
      const response = await fetch(`${API_URL}/add/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const rawNewMask = await response.json();
        // Convert to string immediately
        const newMask = { 
            ...rawNewMask, 
            id: String(rawNewMask.id), 
            user_id: String(rawNewMask.user_id) 
        };
        
        setMasks([newMask, ...masks]);
        setInputValue("");
      } else {
        const errorText = await response.text();
        console.error("Add Failed:", errorText);
        alert(`Add failed: ${errorText}`);
      }
    } catch (err) {
      console.error("Error adding mask:", err);
    }
  };

  // --- 4. DELETE (Remove Mask) ---
  const removeMask = async (idToRemove: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if(!confirm("Are you sure you want to delete this mask?")) return;

    // Optimistic Update: Remove from UI immediately
    const previousMasks = [...masks];
    setMasks(masks.filter((mask) => mask.id !== idToRemove));

    try {
      const response = await fetch(`${API_URL}/delete/${idToRemove}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete failed (Status: ${response.status}):`, errorText);
        throw new Error(errorText);
      }
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert(`Failed to delete: ${err.message || "Server Error"}`);
      setMasks(previousMasks); // Revert UI if failed
    }
  };

  // --- 5. UPDATE (Rename Mask) ---
  const startEditing = (e: React.MouseEvent, mask: Mask) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(mask.id);
    setEditValue(mask.mask_name);
  };

  const saveEdit = async (e?: React.MouseEvent | React.FormEvent) => {
    if(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (!editValue.trim() || editingId === null) return;

    // Optimistic Update
    const previousMasks = [...masks];
    setMasks(masks.map(m => 
        m.id === editingId ? { ...m, mask_name: editValue.trim() } : m
    ));
    setEditingId(null);

    const formData = new FormData();
    formData.append("mask_name", editValue.trim());

    try {
      const response = await fetch(`${API_URL}/update/${editingId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Update failed (Status: ${response.status}):`, errorText);
        
        alert(`Update failed: ${errorText}`);
        setMasks(previousMasks); // Revert UI if failed
      }
    } catch (err) {
      console.error("Error updating mask:", err);
      setMasks(previousMasks); // Revert UI if failed
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-rose-100 bg-white/80 backdrop-blur-xl flex flex-col">
      
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 border-b border-rose-50 shrink-0">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
          DataCrew<span className="text-slate-400 font-medium text-sm ml-1">Admin</span>
        </span>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Dynamic "Masks" Section */}
        <div className="space-y-3">
          <div className="px-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Masks</p>
            <span className="text-xs text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
              {masks.length}
            </span>
          </div>

          {/* Add Mask Input */}
          <form onSubmit={handleAddMask} className="flex gap-2 px-1">
            <input 
              type="text" 
              placeholder={userId ? "New Mask..." : "Loading User..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!userId} 
              className="w-full min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-rose-100 text-sm text-slate-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100/50 transition-all placeholder:text-slate-400 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || !userId}
              className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-rose-200"
            >
              <Plus size={16} />
            </button>
          </form>

          {/* Dynamic List */}
          <div className="space-y-1">
            {loading ? (
                <div className="flex justify-center py-4">
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
                </div>
            ) : masks.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 flex flex-col items-center gap-2">
                    <AlertCircle size={16} />
                    No masks found
                </div>
            ) : (
                masks.map((mask) => {
                const href = `/work/${mask.id}`;
                const isActive = pathname === href;
                const isEditing = editingId === mask.id;
                
                return (
                    <div key={mask.id} className="relative group">
                        {isEditing ? (
                             <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-rose-50 ring-1 ring-rose-200">
                                <input 
                                    autoFocus
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => { if(e.key === 'Enter') saveEdit(e); }}
                                    className="w-full bg-transparent border-none text-sm text-rose-800 focus:outline-none font-medium"
                                />
                                <button onClick={saveEdit} className="p-1 text-rose-600 hover:bg-rose-200 rounded-md">
                                    <Check size={14} />
                                </button>
                            </div>
                        ) : (
                            <Link href={href} className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "text-slate-600 hover:bg-white hover:text-rose-600 hover:shadow-sm"}`}>
                                <div className="flex items-center gap-3 truncate">
                                    <VenetianMask size={18} className={isActive ? "text-rose-600" : "text-slate-400"} />
                                    <span className="truncate">{mask.mask_name}</span>
                                </div>
                                <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <button onClick={(e) => startEditing(e, mask)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"><Pencil size={12} /></button>
                                    <button onClick={(e) => removeMask(mask.id, e)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                                </div>
                            </Link>
                        )}
                    </div>
                );
                })
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="p-4 border-t border-rose-50 shrink-0">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}