import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Server,
  Activity,
  Layers,
  RefreshCw,
  HardDrive,
  Cpu,
  Radio,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { firebaseConfig, getDatabaseMetadata, measureDatabasePing } from '../services/firebase';
import { DatabaseStatus } from '../types';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<DatabaseStatus>(getDatabaseMetadata());
  const [pinging, setPinging] = useState(false);
  const [currentPing, setCurrentPing] = useState(21);

  useEffect(() => {
    if (isOpen) {
      handleRefreshPing();
    }
  }, [isOpen]);

  const handleRefreshPing = async () => {
    setPinging(true);
    const res = await measureDatabasePing();
    setCurrentPing(res.latency);
    setData((prev) => ({
      ...prev,
      latencyMs: res.latency,
      lastSyncTime: new Date().toLocaleTimeString()
    }));
    setPinging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111827] border border-cyan-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-200 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Database Connection Diagnostics</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  ACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Live Firebase cluster telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Main banner */}
          <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-teal-950/40 border border-cyan-500/30 rounded-xl p-4">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Connected Primary Database
            </div>
            <div className="text-lg font-bold text-white tracking-tight">
              Google Cloud Firestore & Realtime DB
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PROJECT ID</span>
                <span className="text-cyan-300 font-semibold">{firebaseConfig.projectId}</span>
              </div>
              <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ROUND-TRIP LATENCY</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentPing} ms
                </span>
              </div>
            </div>
          </div>

          {/* Detailed endpoints */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Cloud Infrastructure Endpoints
            </h4>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Auth Gateway:</span>
                <span className="text-slate-200">{firebaseConfig.authDomain}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Realtime DB URL:</span>
                <span className="text-cyan-300 truncate max-w-[240px]" title={firebaseConfig.databaseURL}>
                  {firebaseConfig.databaseURL}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Cloud Storage:</span>
                <span className="text-slate-200 truncate max-w-[240px]">{firebaseConfig.storageBucket}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Sync Transport:</span>
                <span className="text-emerald-400">{data.activeTransport}</span>
              </div>
            </div>
          </div>

          {/* Synced collections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Active Firestore Collections
              </h4>
              <span className="text-[11px] font-mono text-cyan-400">Auto-synced</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.collections.map((col, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="text-slate-500">/</span>
                      {col.name}
                    </span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                      {col.count} records
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight truncate">
                    {col.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleRefreshPing}
            disabled={pinging}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
            <span>Test Ping</span>
          </button>
          <span className="text-slate-500 text-[11px] font-mono">
            Synced: {data.lastSyncTime}
          </span>
        </div>
      </div>
    </div>
  );
};
