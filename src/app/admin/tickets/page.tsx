'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Ticket, CheckCircle, Clock, Inbox, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SupportTicketsManager() {
  const { user: currentAdmin } = useAuth();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicket = async (id: string, status: string, assignToMe = false) => {
    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignToMe }),
      });

      if (res.ok) {
        setSuccessMsg(assignToMe ? 'Ticket successfully assigned to you!' : 'Ticket status updated!');
        fetchTickets();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update ticket.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">Customer Support Tickets</h1>
        <p className="text-slate-400 text-sm mt-1">Review and resolve platform inquiries from patients and doctors.</p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-900 text-emerald-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-900 text-red-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span>Gathering open tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Inbox className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <h3 className="font-bold text-lg text-white">All Caught Up!</h3>
          <p className="text-sm mt-1">No support tickets currently open on the platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tickets.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between gap-6 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <h3 className="font-display font-bold text-lg text-white">{t.subject}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    t.status === 'OPEN' ? 'bg-red-950 text-red-400' :
                    t.status === 'IN_PROGRESS' ? 'bg-yellow-950 text-yellow-500' :
                    'bg-green-950 text-green-400'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">{t.message}</p>

                <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <div className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    <span>From: {t.user?.name} ({t.user?.role})</span>
                  </div>
                  <div>
                    <span>Email: {t.user?.email}</span>
                  </div>
                  <div>
                    <span>Submitted: {new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {t.assignedAdmin && (
                  <div className="text-[10px] font-bold text-emerald-500">
                    Assigned Admin: {t.assignedAdmin.name}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="sm:border-l sm:border-slate-850 sm:pl-6 flex flex-col justify-center space-y-2.5 min-w-[150px]">
                {t.status !== 'RESOLVED' && (
                  <>
                    {!t.assignedAdminId && (
                      <button
                        onClick={() => handleUpdateTicket(t.id, 'IN_PROGRESS', true)}
                        disabled={actionLoading}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        Assign to Me
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateTicket(t.id, 'RESOLVED')}
                      disabled={actionLoading}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center"
                    >
                      Mark Resolved
                    </button>
                  </>
                )}
                {t.status === 'RESOLVED' && (
                  <div className="text-xs font-bold text-emerald-500 text-center flex items-center justify-center py-2 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                    ✓ Closed / Resolved
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
