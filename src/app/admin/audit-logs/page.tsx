"use client";

import React, { useState, useEffect } from "react";
import { ScrollText, ShieldCheck, Clock, User, CheckCircle2 } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/admin/audit-logs");
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Database & Security Audit Logs</h2>
        <p className="text-xs text-slate-400">
          Immutable ledger of transaction events, hold locks, payment verifications, and cancellations.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading audit ledger...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">Details / Mutation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="p-3 text-slate-400">
                      {new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 font-bold ${
                          log.action.includes("CONFIRMED") || log.action.includes("SUCCEEDED")
                            ? "bg-emerald-500/20 text-emerald-300"
                            : log.action.includes("CANCELLED")
                            ? "bg-rose-500/20 text-rose-300"
                            : log.action.includes("HOLD")
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-cyan-500/20 text-cyan-300"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{log.entityType}</td>
                    <td className="p-3 text-amber-400 font-bold">{log.entityId}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">
                      {JSON.stringify(log.newValues || log.oldValues || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
