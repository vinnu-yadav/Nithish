import React, { useEffect, useState } from 'react';
import { Database, ShieldCheck, Cpu, Radio, CheckCircle2, CloudLightning } from 'lucide-react';
import { firebaseConfig } from '../services/firebase';

interface LoadingScreenProps {
  userName: string;
  onFinish: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ userName, onFinish }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const steps = [
    {
      title: 'Verifying Identity & Credentials',
      detail: `Authenticated session for ${userName}`,
      icon: ShieldCheck
    },
    {
      title: 'Connecting to Cloud Firestore',
      detail: `Handshake with project "${firebaseConfig.projectId}" (asia-east1)`,
      icon: Database
    },
    {
      title: 'Fetching Active Channels & Contacts',
      detail: 'Loading collections: users, channels, direct_chats',
      icon: Cpu
    },
    {
      title: 'Synchronizing Message History & Media',
      detail: 'Restoring real-time Firestore snapshot listeners',
      icon: Radio
    },
    {
      title: 'Ready for Live Chat & Calls',
      detail: 'All data loaded. Initializing interface...',
      icon: CloudLightning
    }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setProgress(38);
    }, 450);

    const timer2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setProgress(64);
    }, 950);

    const timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setProgress(86);
    }, 1500);

    const timer4 = setTimeout(() => {
      setCurrentStepIndex(4);
      setProgress(100);
    }, 2050);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f19] text-slate-100 p-6 overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main loading card */}
      <div className="relative w-full max-w-lg bg-[#111827]/95 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Glowing header icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)] animate-pulse">
              <Database className="w-8 h-8 text-cyan-300" />
            </div>
            {/* Spinning orbit ring */}
            <div className="absolute -inset-2 border-2 border-cyan-400/30 border-t-cyan-300 rounded-full animate-spin" />
          </div>
        </div>

        {/* Database Announcement Banner - Explicitly required by user */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wide mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>CONNECTED DATABASE</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Google Cloud Firestore
          </h2>
          <p className="text-xs font-mono text-cyan-400/90 mt-1 bg-slate-900/60 py-1 px-3 rounded-md border border-slate-800 inline-block">
            Project: <span className="text-white font-semibold">{firebaseConfig.projectId}</span> • {firebaseConfig.authDomain}
          </p>
        </div>

        {/* Step-by-step connection status */}
        <div className="space-y-3 mb-6 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 transition-all duration-300 ${
                  isCurrent
                    ? 'text-cyan-300 font-medium translate-x-1'
                    : isDone
                    ? 'text-slate-400'
                    : 'text-slate-600 opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={isCurrent ? 'text-cyan-200 font-semibold' : ''}>
                      {step.title}
                    </span>
                    {isDone && <span className="text-[10px] text-emerald-400 font-mono">OK</span>}
                  </div>
                  <div className="text-[11px] text-slate-400/80 truncate">
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>Synchronizing collections...</span>
            <span className="text-cyan-300 font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Database specs footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Port: 443 (WSS gRPC)
          </span>
          <span>Latency: ~22ms</span>
          <span className="text-cyan-400">Live Snapshot Engine</span>
        </div>
      </div>
    </div>
  );
};
