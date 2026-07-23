'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, UserCheck, BookOpen, MessageSquareWarning, Database, ScrollText, LogOut, Ticket } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  // If visiting admin login page, bypass layout guards
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-semibold">
        Verifying Administrative Access...
      </div>
    );
  }

  // Double check admin role on client side (middleware already handles route guards)
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-500 font-bold text-center p-6">
        Access Denied: Administrative Credentials Required.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans" id="admin-workspace">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-3 text-red-500">
            <ShieldCheck className="w-7 h-7" />
            <span className="font-display font-bold text-lg tracking-wide">VedaSync Admin</span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2 flex flex-col text-sm font-semibold text-slate-400">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>System Overview</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
            >
              <Users className="w-4 h-4" />
              <span>User Manager (CRUD)</span>
            </Link>
            <Link
              href="/admin/approvals"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition relative"
            >
              <UserCheck className="w-4 h-4" />
              <span>Doctor Verification Queue</span>
            </Link>
            <Link
              href="/admin/catalog"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Medicine Catalog</span>
            </Link>
            <Link
              href="/admin/chats"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
            >
              <MessageSquareWarning className="w-4 h-4" />
              <span>Flagged AI Triage</span>
            </Link>
            <Link
              href="/admin/tickets"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
            >
              <Ticket className="w-4 h-4" />
              <span>Support Tickets</span>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
            >
              <ScrollText className="w-4 h-4" />
              <span>Security Audit Trail</span>
            </Link>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-800 mt-6 space-y-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
            Operator: {user.name}
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 bg-slate-800 hover:bg-red-950 hover:text-red-200 text-slate-300 font-bold rounded-lg transition duration-200 flex items-center justify-center text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            System Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
