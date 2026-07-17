'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Users, Stethoscope, Video, DollarSign, Bot, Star, AlertTriangle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Failed to load admin stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-red-500" />
        <span>Aggregating Platform metrics...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const chartData = data?.growthChartData || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">Overview Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Platform-wide statistics and growth metrics.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs font-semibold text-slate-300">
          Last Synced: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Grid Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
          <div className="p-4 bg-blue-950/50 rounded-lg text-blue-400 border border-blue-900/50">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Patients</span>
            <span className="text-2xl font-extrabold text-white">{stats.totalPatients}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
          <div className="p-4 bg-emerald-950/50 rounded-lg text-emerald-400 border border-emerald-900/50">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Verified Doctors</span>
            <span className="text-2xl font-extrabold text-white">
              {stats.approvedDoctors} <span className="text-xs font-medium text-slate-500">/ {stats.totalDoctors}</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
          <div className="p-4 bg-amber-950/50 rounded-lg text-amber-400 border border-amber-900/50">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Platform Revenue</span>
            <span className="text-2xl font-extrabold text-white">₹{stats.totalRevenue}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
          <div className="p-4 bg-red-950/50 rounded-lg text-red-400 border border-red-900/50">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Flagged AI Chats</span>
            <span className="text-2xl font-extrabold text-white">
              {stats.flaggedAiChats} <span className="text-xs font-medium text-slate-500">/ {stats.totalAiChats}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      {mounted && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Revenue Trend */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-display font-bold text-lg text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> Revenue & Patient Growth
              </h3>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue (₹)" />
                  <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} name="New Patients" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Common Ailments */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-display font-bold text-lg text-white">Top Diagnostic Ailments</h3>
              </div>
              <div className="space-y-4">
                {stats.commonAilments?.map((ailment: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{ailment.name}</span>
                      <span>{ailment.count} cases</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold-600 rounded-full" 
                        style={{ width: `${Math.min(100, (ailment.count / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 mt-6 flex items-center space-x-3 text-xs font-semibold text-slate-400">
              <AlertTriangle className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <span>Ailments stats are auto-compiled from physician consultation diagnosis logs.</span>
            </div>
          </div>
        </section>
      )}

      {/* Extra Row stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
          <span className="text-2xl font-extrabold text-white">{stats.totalConsultations}</span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Bookings</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
          <span className="text-2xl font-extrabold text-white">{stats.completedConsultations}</span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Completed Calls</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
          <span className="text-2xl font-extrabold text-white flex items-center justify-center">
            {stats.avgRating} <Star className="w-4 h-4 fill-gold-600 text-gold-600 ml-1.5" />
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Average Consultation Rating</span>
        </div>
      </section>
    </div>
  );
}
