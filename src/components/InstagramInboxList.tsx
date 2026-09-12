import React, { useState } from 'react';
import {
  Search,
  Edit,
  UserPlus,
  Hash,
  Sparkles,
  Check,
  CheckCheck,
  CircleDot
} from 'lucide-react';
import { User, Channel, Conversation, Message } from '../types';

interface InstagramInboxListProps {
  currentUser: User;
  contacts: User[];
  channels: Channel[];
  messages: Record<string, Message[]>;
  activeConversation: Conversation | null;
  onSelectConversation: (convo: Conversation) => void;
  onAddContact: (email: string, name: string) => void;
}

export const InstagramInboxList: React.FC<InstagramInboxListProps> = ({
  currentUser,
  contacts,
  channels,
  messages,
  activeConversation,
  onSelectConversation,
  onAddContact
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'primary' | 'channels'>('primary');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const filteredContacts = contacts.filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    onAddContact(newEmail.trim(), newName.trim() || newEmail.split('@')[0]);
    setNewEmail('');
    setNewName('');
    setShowAddContact(false);
  };

  // Helper to get latest message snippet for a conversation
  const getLastMessageInfo = (convoId: string) => {
    const list = messages[convoId] || [];
    if (list.length === 0) return null;
    return list[list.length - 1];
  };

  return (
    <div
      id="instagram-inbox-column"
      className="w-full max-w-2xl h-full bg-[#000000] md:border-r border-[#262626] flex flex-col text-[#f5f5f5] select-none"
    >
      {/* Top Header */}
      <div className="h-16 px-4 border-b border-[#262626] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            {currentUser.displayName || 'Messages'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-black" />
        </div>

        <button
          type="button"
          onClick={() => setShowAddContact(!showAddContact)}
          className="p-2 rounded-full hover:bg-[#1a1a1a] text-white hover:text-[#0095f6] transition"
          title="New Message / Add Contact"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      {/* Stories / Active People Horizontal Bubbles (Instagram Direct signature) */}
      <div className="px-3 pt-3 pb-2 border-b border-[#262626]/60 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 min-w-max">
          {/* Current user note / status */}
          <div className="flex flex-col items-center gap-1.5 w-16 text-center cursor-pointer group">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={currentUser.displayName}
                className="w-14 h-14 rounded-full object-cover p-[2px] ring-2 ring-[#363636]"
              />
              <span className="absolute -top-1.5 right-0 bg-[#262626] text-[10px] text-white px-1.5 py-0.5 rounded-full border border-slate-700 font-medium">
                Note
              </span>
            </div>
            <span className="text-[11px] text-[#a8a8a8] group-hover:text-white truncate w-14">
              Your note
            </span>
          </div>

          {/* Online contacts in Instagram Stories circles */}
          {contacts.slice(0, 7).map((contact) => {
            const isSelected = activeConversation && !activeConversation.isChannel && activeConversation.peer.uid === contact.uid;
            return (
              <button
                key={contact.uid}
                type="button"
                onClick={() =>
                  onSelectConversation({
                    id: contact.uid,
                    peer: contact,
                    isChannel: false
                  })
                }
                className="flex flex-col items-center gap-1.5 w-16 text-center cursor-pointer group focus:outline-none"
              >
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-full p-[2px] transition ${
                      contact.online
                        ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm'
                        : 'bg-[#363636]'
                    } ${isSelected ? 'ring-2 ring-white' : ''}`}
                  >
                    <img
                      src={contact.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={contact.displayName}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" />
                  )}
                </div>
                <span className="text-[11px] text-[#a8a8a8] group-hover:text-white truncate w-14">
                  {contact.displayName.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline New Contact Form */}
      {showAddContact && (
        <form
          onSubmit={handleAddSubmit}
          className="m-3 p-3 bg-[#121212] rounded-xl border border-[#262626] text-xs space-y-2.5 animate-fadeIn"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span>New Direct Conversation</span>
            <span className="text-[10px] text-[#0095f6] font-mono">Synced to Firestore</span>
          </div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full Name (e.g. Maya Lin)"
            className="w-full bg-[#1e1e1e] border border-[#333333] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#0095f6]"
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full bg-[#1e1e1e] border border-[#333333] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#0095f6]"
          />
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold py-1.5 rounded-lg text-xs transition"
            >
              Start Chat
            </button>
            <button
              type="button"
              onClick={() => setShowAddContact(false)}
              className="px-3 bg-[#262626] text-[#a8a8a8] hover:text-white rounded-lg text-xs transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="px-4 py-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Direct Messages..."
            className="w-full bg-[#262626] border-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:ring-1 focus:ring-[#737373] transition"
          />
        </div>
      </div>

      {/* Tabs: Direct (Primary) vs Channels */}
      <div className="flex items-center px-4 border-b border-[#262626] text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('primary')}
          className={`flex-1 py-2.5 text-center transition border-b-2 ${
            activeTab === 'primary'
              ? 'border-white text-white'
              : 'border-transparent text-[#737373] hover:text-[#a8a8a8]'
          }`}
        >
          Direct ({filteredContacts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-2.5 text-center transition border-b-2 ${
            activeTab === 'channels'
              ? 'border-white text-white'
              : 'border-transparent text-[#737373] hover:text-[#a8a8a8]'
          }`}
        >
          Channels ({filteredChannels.length})
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1a1a1a]/50">
        {activeTab === 'primary' ? (
          filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-[#737373] text-xs">
              No direct chats match "{searchTerm}"
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected =
                activeConversation &&
                !activeConversation.isChannel &&
                activeConversation.peer.uid === contact.uid;
              const lastMsg = getLastMessageInfo(contact.uid);

              return (
                <button
                  key={contact.uid}
                  type="button"
                  onClick={() =>
                    onSelectConversation({
                      id: contact.uid,
                      peer: contact,
                      isChannel: false
                    })
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-[#121212] group ${
                    isSelected ? 'bg-[#1a1a1a]' : ''
                  }`}
                >
                  {/* Avatar with Story gradient ring if active */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full p-[2px] ${
                        contact.online
                          ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
                          : 'bg-[#262626]'
                      }`}
                    >
                      <img
                        src={
                          contact.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                        }
                        alt={contact.displayName}
                        className="w-full h-full rounded-full object-cover border-2 border-black"
                      />
                    </div>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                    )}
                  </div>

                  {/* Name and Latest Message */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm truncate ${
                          isSelected ? 'font-bold text-white' : 'font-medium text-white'
                        }`}
                      >
                        {contact.displayName}
                      </span>
                      {lastMsg && (
                        <span className="text-[11px] text-[#737373] font-normal shrink-0 ml-1">
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5 text-xs text-[#a8a8a8] truncate">
                      {lastMsg ? (
                        <>
                          {lastMsg.senderId === currentUser.uid && (
                            <span className="text-[#737373] shrink-0">You: </span>
                          )}
                          <span className="truncate">
                            {lastMsg.text || (lastMsg.mediaUrl ? 'Sent an attachment' : 'Photo')}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#737373] italic">
                          {contact.statusText || (contact.online ? 'Active now' : 'Active recently')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator dot */}
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#0095f6] shrink-0" />
                  )}
                </button>
              );
            })
          )
        ) : (
          filteredChannels.map((channel) => {
            const isSelected =
              activeConversation &&
              activeConversation.isChannel &&
              activeConversation.id === channel.id;
            const lastMsg = getLastMessageInfo(channel.id);

            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => onSelectConversation(channel)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-[#121212] group ${
                  isSelected ? 'bg-[#1a1a1a]' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1e1e1e] border border-[#333333] flex items-center justify-center text-xl shrink-0 group-hover:border-[#0095f6]/50 transition">
                  {channel.icon || '#'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white truncate">
                      #{channel.name}
                    </span>
                    {channel.unreadCount && channel.unreadCount > 0 ? (
                      <span className="w-4 h-4 rounded-full bg-[#0095f6] text-white text-[10px] font-bold flex items-center justify-center">
                        {channel.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-[#737373] truncate mt-0.5">
                    {lastMsg ? lastMsg.text : channel.description}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
