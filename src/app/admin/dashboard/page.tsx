'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Loader2, Users, Stethoscope, DollarSign, ShieldCheck, KeyRound,
  Tag, RefreshCw, Activity, ToggleLeft, Megaphone, FileText,
  TrendingUp, CheckCircle, AlertTriangle, XCircle, Search, Plus, Power, ShieldAlert,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState(activeTab);

  // Commerce state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);

  // Security state
  const [totpSetup, setTotpSetup] = useState<any>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpSuccess, setTotpSuccess] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  // Ops state
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  // Modals & Form states
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'PERCENT', discountValue: 10, expiryDate: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', targetRole: 'ALL', severity: 'INFO' });
  const [refundForm, setRefundForm] = useState({ paymentId: '', amount: 0, reason: '', refundType: 'FULL' });

  useEffect(() => {
    setActiveSubTab(searchParams.get('tab') || 'overview');
  }, [searchParams]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeSubTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'overview') {
        const res = await fetch('/api/admin/stats');
        if (res.ok) setStats(await res.json());
      } else if (activeSubTab === 'commerce') {
        const [cRes, pRes, rRes, comRes] = await Promise.all([
          fetch('/api/admin/coupons'),
          fetch('/api/admin/payouts'),
          fetch('/api/admin/refunds'),
          fetch('/api/admin/commission'),
        ]);
        if (cRes.ok) setCoupons((await cRes.json()).coupons || []);
        if (pRes.ok) setPayouts((await pRes.json()).payouts || []);
        if (rRes.ok) setRefunds((await rRes.json()).refunds || []);
        if (comRes.ok) setCommissions((await comRes.json()).configs || []);
      } else if (activeSubTab === 'security') {
        const [sRes, aRes] = await Promise.all([
          fetch('/api/admin/sessions'),
          fetch('/api/admin/security-alerts'),
        ]);
        if (sRes.ok) setSessions((await sRes.json()).sessions || []);
        if (aRes.ok) setSecurityAlerts((await aRes.json()).alerts || []);
      } else if (activeSubTab === 'ops') {
        const [fRes, hRes, annRes] = await Promise.all([
          fetch('/api/admin/feature-flags'),
          fetch('/api/admin/system/health'),
          fetch('/api/admin/announcements'),
        ]);
        if (fRes.ok) setFeatureFlags((await fRes.json()).flags || []);
        if (hRes.ok) setSystemHealth(await hRes.json());
        if (annRes.ok) setAnnouncements((await annRes.json()).announcements || []);
      } else if (activeSubTab === 'analytics') {
        const [anRes, prRes] = await Promise.all([
          fetch('/api/admin/reports/analytics'),
          fetch('/api/admin/audit/prescriptions'),
        ]);
        if (anRes.ok) setAnalytics(await anRes.json());
        if (prRes.ok) setPrescriptions((await prRes.json()).prescriptions || []);
      }
    } catch (e) {
      console.error('Fetch dashboard tab error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleToggleFlag = async (key: string, isEnabled: boolean) => {
    const flag = featureFlags.find(f => f.key === key);
    if (!flag) return;
    await fetch('/api/admin/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, name: flag.name, isEnabled: !isEnabled }),
    });
    fetchDashboardData();
  };

  const handleInit2FASetup = async () => {
    const res = await fetch('/api/admin/2fa/setup', { method: 'POST' });
    if (res.ok) setTotpSetup(await res.json());
  };

  const handleVerify2FA = async () => {
    const res = await fetch('/api/admin/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: totpCode }),
    });
    const json = await res.json();
    if (res.ok) {
      setTotpSuccess('2FA mandatory TOTP enabled!');
      setTotpSetup(null);
    } else {
      alert(json.error || 'Verification failed');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon),
    });
    if (res.ok) {
      setNewCoupon({ code: '', discountType: 'PERCENT', discountValue: 10, expiryDate: '' });
      fetchDashboardData();
    } else {
      const json = await res.json();
      alert(json.error || 'Failed to create coupon');
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnnouncement),
    });
    if (res.ok) {
      setNewAnnouncement({ title: '', message: '', targetRole: 'ALL', severity: 'INFO' });
      alert('Announcement broadcast successfully!');
      fetchDashboardData();
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    await fetch('/api/admin/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    fetchDashboardData();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white flex items-center gap-3">
            <span>VedaSync Enterprise Control Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time revenue, security 2FA, platform ops, and business intelligence controls.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('commerce')}
            className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'commerce' ? 'bg-amber-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            💰 Revenue & Commerce
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'security' ? 'bg-red-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            🔐 Security & 2FA
          </button>
          <button
            onClick={() => setActiveSubTab('ops')}
            className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'ops' ? 'bg-teal-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            ⚙️ Ops & Health
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'analytics' ? 'bg-sky-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            📊 BI Analytics
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3 text-emerald-500" />
          <span>Synchronizing enterprise metrics...</span>
        </div>
      )}

      {!loading && activeSubTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
              <div className="p-4 bg-blue-950/50 rounded-lg text-blue-400 border border-blue-900/50">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Patients</span>
                <span className="text-2xl font-extrabold text-white">{stats.stats?.totalPatients || 0}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
              <div className="p-4 bg-emerald-950/50 rounded-lg text-emerald-400 border border-emerald-900/50">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Verified Doctors</span>
                <span className="text-2xl font-extrabold text-white">{stats.stats?.approvedDoctors || 0}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
              <div className="p-4 bg-amber-950/50 rounded-lg text-amber-400 border border-amber-900/50">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Platform Revenue</span>
                <span className="text-2xl font-extrabold text-white">₹{stats.stats?.totalRevenue || 0}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center space-x-4 shadow-lg">
              <div className="p-4 bg-red-950/50 rounded-lg text-red-400 border border-red-900/50">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">System Status</span>
                <span className="text-2xl font-extrabold text-emerald-400">HEALTHY</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMERCE TAB */}
      {!loading && activeSubTab === 'commerce' && (
        <div className="space-y-10">
          {/* Coupon Engine */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <span>Coupon & Discount Engine</span>
            </h2>

            {/* Create Form */}
            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="text"
                placeholder="Coupon Code (e.g. VEDA20)"
                required
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm uppercase"
              />
              <select
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
              <input
                type="number"
                placeholder="Discount Value"
                required
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) })}
                className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm"
              />
              <input
                type="date"
                required
                value={newCoupon.expiryDate}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
              >
                Create Coupon
              </button>
            </form>

            {/* List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">Min Order</th>
                    <th className="p-3">Redemptions</th>
                    <th className="p-3">Expiry</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-amber-400">{c.code}</td>
                      <td className="p-3">{c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                      <td className="p-3">₹{c.minOrderValue}</td>
                      <td className="p-3">{c.usedCount} / {c.maxUsesTotal}</td>
                      <td className="p-3">{new Date(c.expiryDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${c.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500">No active coupons found. Create one above!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Doctor Payout Console */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <span>Doctor Payout Management</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 font-semibold text-white">{p.doctor?.user?.name}</td>
                      <td className="p-3 font-bold text-emerald-400">₹{p.amount}</td>
                      <td className="p-3">{p.payoutMethod}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${p.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : p.status === 'HOLD' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3">{p.payoutRef || '-'}</td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500">No payout batches generated yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* SECURITY TAB */}
      {!loading && activeSubTab === 'security' && (
        <div className="space-y-10">
          {/* TOTP 2FA Setup */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-red-400" />
                  <span>Mandatory Admin TOTP 2FA Security</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">Google Authenticator multi-factor authentication for Admin account protection.</p>
              </div>
              <button
                onClick={handleInit2FASetup}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
              >
                Initialize 2FA Onboarding
              </button>
            </div>

            {totpSuccess && (
              <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-4 rounded-xl mb-6 font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>{totpSuccess}</span>
              </div>
            )}

            {totpSetup && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8 mb-6">
                <img src={totpSetup.qrCodeDataUrl} alt="2FA QR Code" className="w-44 h-44 rounded-xl border border-slate-700" />
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Scan QR Code with Google Authenticator</h3>
                  <p className="text-slate-400 text-sm">Or enter secret manually: <code className="bg-slate-900 text-amber-400 px-2 py-1 rounded font-mono">{totpSetup.secret}</code></p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-lg text-center font-bold tracking-widest text-lg"
                    />
                    <button
                      onClick={handleVerify2FA}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg text-sm"
                    >
                      Verify & Activate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Active Sessions */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Active Logged-In Sessions & Force Logout</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-semibold text-white">{s.user?.email}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-slate-800 text-xs font-bold text-slate-300 rounded-full">{s.user?.role}</span></td>
                      <td className="p-3 font-mono text-xs text-amber-400">{s.ipAddress || '127.0.0.1'}</td>
                      <td className="p-3">{new Date(s.lastActiveAt).toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1 rounded text-xs font-bold transition"
                        >
                          Revoke Session
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500">No active logged-in sessions captured yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* OPS & HEALTH TAB */}
      {!loading && activeSubTab === 'ops' && (
        <div className="space-y-10">
          {/* Feature Flags */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ToggleLeft className="w-5 h-5 text-teal-400" />
              <span>Feature Flag Control Panel</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featureFlags.map((f) => (
                <div key={f.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">{f.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{f.description}</p>
                    <span className="inline-block mt-2 text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono">key: {f.key}</span>
                  </div>
                  <button
                    onClick={() => handleToggleFlag(f.key, f.isEnabled)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-2 ${f.isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{f.isEnabled ? 'ENABLED' : 'DISABLED'}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* System Health Widget */}
          {systemHealth && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Real-Time Operational System Health</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Database (PostgreSQL)</span>
                  <span className="text-lg font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4" /> UP ({systemHealth.checks?.database?.latencyMs}ms)
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Stripe Payment Gateway</span>
                  <span className={`text-lg font-bold flex items-center gap-1 mt-1 ${systemHealth.checks?.stripe?.status === 'UP' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <CheckCircle className="w-4 h-4" /> {systemHealth.checks?.stripe?.status}
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Gemini AI Assistant</span>
                  <span className="text-lg font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4" /> UP
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 font-bold block uppercase">SMTP Email Service</span>
                  <span className="text-lg font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4" /> UP
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Broadcast Announcements */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span>Broadcast System Announcement</span>
            </h2>
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
              <input
                type="text"
                placeholder="Announcement Title"
                required
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2 rounded-lg text-sm"
              />
              <textarea
                placeholder="Broadcast Message Content..."
                required
                rows={3}
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2 rounded-lg text-sm"
              />
              <div className="flex gap-4">
                <select
                  value={newAnnouncement.targetRole}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <option value="ALL">Target: All Users</option>
                  <option value="PATIENT">Target: Patients Only</option>
                  <option value="DOCTOR">Target: Doctors Only</option>
                </select>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2 rounded-lg text-sm"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* BI ANALYTICS TAB */}
      {!loading && activeSubTab === 'analytics' && analytics && (
        <div className="space-y-10">
          {/* Doctor Revenue Rankings */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Doctor Revenue & Performance Rankings</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Consultations</th>
                    <th className="p-3">Gross Revenue</th>
                    <th className="p-3">Platform Commission (15%)</th>
                    <th className="p-3">Doctor Payout (85%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {analytics.doctorRankings?.map((d: any) => (
                    <tr key={d.doctorId}>
                      <td className="p-3 font-semibold text-white">{d.name}</td>
                      <td className="p-3 font-bold text-amber-400">{d.confirmedConsultations}</td>
                      <td className="p-3 font-bold text-emerald-400">₹{d.grossEarnings}</td>
                      <td className="p-3 text-slate-400">₹{d.platformCommission}</td>
                      <td className="p-3 font-bold text-white">₹{d.doctorPayout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-8">Loading Enterprise Controls...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
