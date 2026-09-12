import React from 'react';
import { Phone, PhoneOff, Video, Volume2 } from 'lucide-react';
import { User } from '../types';

interface IncomingCallBannerProps {
  caller: User;
  type: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallBanner: React.FC<IncomingCallBannerProps> = ({
  caller,
  type,
  onAccept,
  onDecline
}) => {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[#131d2e] border border-cyan-500/50 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img
            src={caller.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={caller.displayName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-400"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] shadow">
            {type === 'video' ? <Video className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">{caller.displayName}</div>
          <div className="text-xs text-cyan-300 font-mono animate-pulse">
            Incoming {type === 'video' ? 'Video' : 'Voice'} Call...
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onDecline}
          className="w-10 h-10 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center transition shadow-md"
          title="Decline"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
        <button
          onClick={onAccept}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
          title="Accept"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Accept</span>
        </button>
      </div>
    </div>
  );
};
