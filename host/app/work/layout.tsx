import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-rose-200 selection:text-rose-900">
      
      {/* 1. Fixed Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content Area */}
      <div className="ml-64">
        
        {/* Sticky Header */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}