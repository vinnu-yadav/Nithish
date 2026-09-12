import React, { useState } from 'react';
import {
  Search,
  LogOut,
  Plus,
  UserPlus,
  PhoneCall,
  Edit,
  CheckCircle2,
  Sparkles,
  Radio,
  Hash,
  MessageCircle,
  Database
} from 'lucide-react';
import { User, Channel, Conversation } from '../types';
import { firebaseConfig } from '../services/firebase';

interface SidebarProps {
  currentUser: User;
  contacts: User[];
  channels: Channel[];
  activeConversation: Conversation | null;
  onSelectConversation: (convo: Conversation) => void;
  onSignOut: () => void;
  onOpenDatabaseModal: () => void;
  onAddContact: (email: string, name: string) => void;
  onSimulateIncomingCall: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  contacts,
  channels,
  activeConversation,
  onSelectConversation,
  onSignOut,
  onOpenDatabaseModal,
  onAddContact,
  onSimulateIncomingCall
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'channels'>('messages');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    onAddContact(newEmail.trim(), newName.trim() || newEmail.split('@')[0]);
    setNewEmail('');
    setNewName('');
    setShowAddContact(false);
  };

  const getHandle = (user: User) => {
    if (user.email) {
      return user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
    }
    return user.displayName.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <aside className="w-full md:w-84 lg:w-96 h-full bg-[#000000] border-r border-[#262626] flex flex-col shrink-0 text-zinc-100 select-none">
      {/* Instagram DM Top Profile Header */}
      <div className="h-16 px-4 border-b border-[#262626] flex items-center justify-between shrink-0 bg-[#000000]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 cursor-pointer">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-black"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-black" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white truncate">
                {getHandle(currentUser)}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0095f6] shrink-0" />
            </div>
            <span className="text-[11px] text-zinc-400 truncate block">
              {currentUser.displayName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* New message / Add Contact */}
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition"
            title="New Chat / Add Contact"
          >
            <Edit className="w-5 h-5" />
          </button>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instagram Story / Active Contacts Horizontal Bubbles ("Notes" style) */}
      <div className="px-3 pt-3 pb-2 border-b border-[#262626]/70 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-3">
          {/* Current user 'Your note' bubble */}
          <div className="flex flex-col items-center gap-1 shrink-0 w-16 cursor-pointer group">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt="Your note"
                className="w-13 h-13 rounded-full object-cover ring-2 ring-zinc-700"
              />
              <div className="absolute -top-1.5 -right-1 bg-zinc-800 text-[9px] px-1.5 py-0.5 rounded-full border border-zinc-700 text-zinc-300 shadow">
                Note...
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 truncate w-full text-center">Your note</span>
          </div>

          {/* Active Contacts Avatars */}
          {contacts.map((contact) => {
            const isSelected = activeConversation && !activeConversation.isChannel && activeConversation.peer.uid === contact.uid;
            return (
              <button
                key={contact.uid}
                onClick={() =>
                  onSelectConversation({
                    id: contact.uid,
                    peer: contact,
                    isChannel: false
                  })
                }
                className="flex flex-col items-center gap-1 shrink-0 w-16 group transition text-center"
              >
                <div className="relative">
                  <div
                    className={`p-0.5 rounded-full transition ${
                      isSelected
                        ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] scale-105'
                        : contact.online
                        ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 group-hover:scale-105'
                        : 'bg-zinc-700 group-hover:bg-zinc-600'
                    }`}
                  >
                    <img
                      src={contact.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={contact.displayName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-black"
                    />
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-black" />
                  )}
                </div>
                <span
                  className={`text-[11px] truncate w-full ${
                    isSelected ? 'text-white font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {contact.displayName.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages or people"
            className="w-full bg-[#121212] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
          />
        </div>
      </div>

      {/* Tabs: Messages (Direct) vs Channels */}
      <div className="flex border-b border-[#262626] px-4">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'messages'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Messages</span>
          <span className="text-[10px] text-zinc-500 font-mono">({filteredContacts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'channels'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Channels</span>
          <span className="text-[10px] text-zinc-500 font-mono">({filteredChannels.length})</span>
        </button>
      </div>

      {/* Modal / Inline form to Add Contact */}
      {showAddContact && (
        <div className="mx-3 my-2 p-3 bg-[#121212] rounded-xl border border-zinc-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#0095f6]" />
              Start Chat with Account
            </span>
            <button
              onClick={() => setShowAddContact(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddSubmit} className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name (e.g. Maya Lin)"
              className="w-full bg-[#1c1c1c] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email or handle"
              required
              className="w-full bg-[#1c1c1c] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500"
            />
            <button
              type="submit"
              className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold py-1.5 rounded-lg text-xs transition"
            >
              Start Conversation
            </button>
          </form>
        </div>
      )}

      {/* Inbox List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {activeTab === 'messages' ? (
          filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No direct messages found
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isActive =
                activeConversation &&
                !activeConversation.isChannel &&
                activeConversation.peer.uid === contact.uid;

              return (
                <button
                  key={contact.uid}
                  onClick={() =>
                    onSelectConversation({
                      id: contact.uid,
                      peer: contact,
                      isChannel: false
                    })
                  }
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left group ${
                    isActive
                      ? 'bg-[#1e1e1e] text-white'
                      : 'hover:bg-[#121212] text-zinc-300'
                  }`}
                >
                  {/* Avatar with Story gradient or status */}
                  <div className="relative shrink-0">
                    <div
                      className={`p-0.5 rounded-full ${
                        isActive
                          ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                          : 'bg-transparent'
                      }`}
                    >
                      <img
                        src={contact.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={contact.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-1 ring-zinc-800"
                      />
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-black" />
                    )}
                  </div>

                  {/* Account Name & Message Snippet */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs truncate ${isActive ? 'font-bold text-white' : 'font-medium text-zinc-200'}`}>
                        {contact.displayName}
                      </span>
                      <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                        {contact.online ? 'now' : contact.lastSeen || ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-zinc-400 truncate">
                        {contact.statusText || (contact.online ? 'Active now' : `Seen ${contact.lastSeen || 'recently'}`)}
                      </p>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#0095f6] shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )
        ) : (
          filteredChannels.map((channel) => {
            const isActive = activeConversation && activeConversation.isChannel && activeConversation.id === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => onSelectConversation(channel)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left ${
                  isActive
                    ? 'bg-[#1e1e1e] text-white'
                    : 'hover:bg-[#121212] text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 text-sm font-semibold shrink-0">
                    {channel.icon || '#'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      #{channel.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {channel.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Instagram DM Bottom Bar: Quick simulate call & database stats */}
      <div className="p-3 border-t border-[#262626] bg-[#000000] space-y-2">
        <button
          onClick={onSimulateIncomingCall}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#121212] hover:bg-[#1c1c1c] border border-zinc-800 text-xs text-zinc-300 hover:text-white transition"
          title="Simulate an incoming audio/video call"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#0095f6]" />
          <span>Simulate Incoming Call</span>
        </button>

        {/* Database cluster status badge */}
        <button
          onClick={onOpenDatabaseModal}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0d1422] hover:bg-[#111c30] border border-cyan-500/30 text-[11px] font-mono text-left transition group"
          title="Inspect Cloud Firestore database connection"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-zinc-300 group-hover:text-white truncate">
              Firestore: <strong className="text-cyan-400">{firebaseConfig.projectId}</strong>
            </span>
          </div>
          <span className="text-[10px] text-cyan-400">Live</span>
        </button>
      </div>
    </aside>
  );
};
