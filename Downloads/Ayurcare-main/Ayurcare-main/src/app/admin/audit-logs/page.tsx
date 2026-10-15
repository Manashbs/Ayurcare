'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, ScrollText, Calendar, User, Settings } from 'lucide-react';

export default function SecurityAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const json = await res.json();
        setLogs(json.auditLogs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const actorName = log.actor?.name?.toLowerCase() || '';
    const action = log.action?.toLowerCase() || '';
    const metadata = log.metadata?.toLowerCase() || '';
    return actorName.includes(term) || action.includes(term) || metadata.includes(term);
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">Security Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-1">Immutable records of all administrative actions and medical records accesses.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-400">
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Encryption at Rest: Enabled</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center space-x-4 max-w-md">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by actor, action, metadata..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-lg text-sm transition cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span>Vetting ledger records...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <ScrollText className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <h3 className="font-bold text-lg text-white">No Audit Records Found</h3>
          <p className="text-sm mt-1">No logs match your current search queries.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Security Action</th>
                  <th className="px-6 py-4">Target Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredLogs.map((log) => {
                  let metadataObj = {};
                  try {
                    metadataObj = JSON.parse(log.metadata || '{}');
                  } catch (e) {}

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 text-slate-400 font-sans whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <div>
                            <div>{log.actor?.name || 'SYSTEM'}</div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">{log.actor?.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          log.action.includes(' purges') || log.action.includes('DELETE') || log.action.includes('BANNED')
                            ? 'bg-red-950/40 text-red-400 border-red-900/60'
                            : log.action.includes('IMPERSONATE')
                            ? 'bg-amber-955/40 text-amber-500 border-amber-900/60 bg-amber-950/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 leading-relaxed font-sans max-w-xs sm:max-w-sm truncate hover:text-clip hover:whitespace-normal">
                        {log.metadata || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
