import React from 'react';
import {
  MessageSquare,
  Send,
  LogOut
} from 'lucide-react';
import { User as UserType } from '../types';

interface InstagramNavProps {
  currentUser: UserType;
  unreadDirectCount: number;
  onSignOut: () => void;
}

export const InstagramNav: React.FC<InstagramNavProps> = ({
  currentUser,
  unreadDirectCount,
  onSignOut
}) => {
  return (
    <aside
      id="instagram-sidebar-nav"
      className="w-16 md:w-20 lg:w-64 h-full bg-[#000000] border-r border-[#262626] flex flex-col justify-between p-3 select-none shrink-0 text-[#f5f5f5] z-20"
    >
      {/* Brand & Logo */}
      <div className="space-y-6">
        <div className="px-2 pt-3 pb-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center p-0.5 shadow-md shadow-pink-500/20 shrink-0">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Send className="w-4 h-4 text-white -rotate-45 translate-x-0.5 -translate-y-0.5" />
            </div>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none">
              Wire Direct
            </h1>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
              Messenger
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 px-1">
          {/* Messages (Active) */}
          <button
            type="button"
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl bg-[#1a1a1a] text-white font-semibold transition hover:bg-[#262626] group relative"
          >
            <div className="relative shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
              {unreadDirectCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#ff3040] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-black">
                  {unreadDirectCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-sm font-semibold tracking-wide">
              Messages
            </span>
          </button>
        </nav>
      </div>

      {/* User profile & Sign Out Footer */}
      <div className="pt-3 border-t border-[#262626] space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1a1a1a] transition">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={currentUser.displayName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0095f6]"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
          </div>
          <div className="hidden lg:block min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser.displayName}
            </div>
            <div className="text-[11px] text-[#8e8e8e] truncate">
              {currentUser.email}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-[#a8a8a8] hover:text-[#ff3040] hover:bg-[#261518] transition text-xs font-medium"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:inline">Log out</span>
        </button>
      </div>
    </aside>
  );
};
