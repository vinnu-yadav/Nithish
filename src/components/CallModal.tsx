import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  ScreenShare,
  Volume2,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { User, CallSession } from '../types';

interface CallModalProps {
  session: CallSession;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  session,
  onEndCall,
  onToggleMute,
  onToggleVideo
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    const setupMedia = async () => {
      if (session.type === 'video') {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          setStream(localStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        } catch {
          // Camera permission denied or not available
        }
      }
    };

    setupMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [session.type]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b12]/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 select-none animate-in fade-in">
      {/* Top Status Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>WebRTC P2P • STUN Relay Active</span>
        </div>
        <div className="text-sm font-mono text-slate-300 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800">
          {session.status === 'connected' ? (
            <span className="text-emerald-400 font-semibold">{formatDuration(session.durationSeconds)}</span>
          ) : (
            <span className="text-cyan-400 animate-pulse">{session.status === 'calling' ? 'Calling...' : 'Ringing...'}</span>
          )}
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Cluster: kartify-a4e66
        </div>
      </div>

      {/* Main Video / Avatar Stage */}
      <div className="relative w-full max-w-3xl flex-1 flex items-center justify-center my-4">
        {session.type === 'video' ? (
          <div className="relative w-full h-[65vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Simulated Remote Feed with Peer Avatar */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/80 to-slate-950">
              <div className="relative mb-4">
                <img
                  src={session.peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={session.peer.displayName}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-cyan-500/40 shadow-xl"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{session.peer.displayName}</h3>
              <p className="text-xs text-slate-400">{session.peer.email}</p>
              <div className="mt-3 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                HD Video • 1080p @ 60fps
              </div>
            </div>

            {/* Local Video Thumbnail (PiP) */}
            <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl">
              {!session.isVideoOff && stream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 text-xs">
                  <VideoOff className="w-6 h-6 mb-1 text-slate-600" />
                  <span>Camera Off</span>
                </div>
              )}
              <span className="absolute bottom-1.5 left-2 text-[10px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-white">
                You
              </span>
            </div>
          </div>
        ) : (
          /* Audio Call Presentation */
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 p-1 shadow-[0_0_50px_rgba(34,211,238,0.3)] animate-pulse">
                <img
                  src={session.peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={session.peer.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {session.status === 'connected' && (
                <div className="absolute -inset-4 border-2 border-cyan-400/30 rounded-full animate-ping pointer-events-none" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1.5">{session.peer.displayName}</h2>
            <p className="text-sm text-cyan-400 font-mono mb-2">{session.peer.email}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Opus High Definition Audio (48kHz)</span>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls Floating Bar */}
      <div className="bg-[#141d2d] border border-slate-700/80 rounded-2xl px-6 py-3.5 flex items-center gap-4 shadow-2xl">
        <button
          onClick={onToggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            session.isMuted
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
          title={session.isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {session.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {session.type === 'video' && (
          <button
            onClick={onToggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              session.isVideoOff
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
            title={session.isVideoOff ? 'Turn video on' : 'Turn video off'}
          >
            {session.isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
