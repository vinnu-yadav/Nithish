import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Send,
  Smile,
  Image as ImageIcon,
  Heart,
  Mic,
  MoreVertical,
  ChevronLeft,
  Info,
  Check,
  CheckCheck,
  Hash,
  FileText,
  Download,
  Database,
  Camera,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Conversation, Message, User } from '../types';
import { firebaseConfig } from '../services/firebase';

interface ChatAreaProps {
  conversation: Conversation | null;
  currentUser: User;
  messages: Message[];
  contacts?: User[];
  onSendMessage: (text: string, media?: { url: string; type: string; name: string }) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenDatabaseModal: () => void;
  onBack?: () => void;
  onSelectConversation?: (convo: Conversation) => void;
}

const INSTA_REACTIONS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  currentUser,
  messages,
  contacts = [],
  onSendMessage,
  onAddReaction,
  onStartCall,
  onOpenDatabaseModal,
  onBack,
  onSelectConversation
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [likedAnimationMessageId, setLikedAnimationMessageId] = useState<string | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    onSendMessage(text);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSendHeart = () => {
    onSendMessage('❤️');
  };

  const handleDoubleTapMessage = (msgId: string) => {
    onAddReaction(msgId, '❤️');
    setLikedAnimationMessageId(msgId);
    setTimeout(() => {
      setLikedAnimationMessageId(null);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onSendMessage('', {
        url: result,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleVoiceNoteSim = () => {
    setIsRecordingAudio(true);
    setTimeout(() => {
      setIsRecordingAudio(false);
      onSendMessage('🎙️ Voice message (0:08)');
    }, 1200);
  };

  // If no conversation is active, show the authentic Instagram Direct Empty State
  if (!conversation) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#000000] text-zinc-200 p-6 select-none">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-24 h-24 rounded-full border-2 border-zinc-700 flex items-center justify-center mx-auto bg-[#121212] shadow-xl">
            <div className="p-3 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
              <MessageCircle className="w-10 h-10" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Your messages</h2>
            <p className="text-sm text-zinc-400">
              Send private messages, photos, and start high-definition audio & video calls with your team.
            </p>
          </div>

          {contacts.length > 0 && (
            <div className="pt-2">
              <div className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">
                Quick Select Receiver
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {contacts.slice(0, 4).map((c) => (
                  <button
                    key={c.uid}
                    onClick={() =>
                      onSelectConversation &&
                      onSelectConversation({
                        id: c.uid,
                        peer: c,
                        isChannel: false
                      })
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1c1c] hover:bg-[#262626] border border-zinc-800 text-xs text-zinc-300 hover:text-white transition"
                  >
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{c.displayName.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isChannel = conversation.isChannel;
  const peer = !isChannel ? conversation.peer : null;
  const peerHandle = peer
    ? peer.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
    : conversation.name;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#000000] text-zinc-200 overflow-hidden select-none relative">
      {/* Instagram DM Header */}
      <header className="h-16 px-4 border-b border-[#262626] bg-[#000000] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile/tablet */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-800 transition"
              title="Back to inbox"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Avatar with Story gradient / Status */}
          <div
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className="cursor-pointer relative shrink-0"
          >
            {isChannel ? (
              <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                {conversation.icon || '#'}
              </div>
            ) : (
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                <img
                  src={peer?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={peer?.displayName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-black"
                />
              </div>
            )}
            {!isChannel && peer?.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-black" />
            )}
          </div>

          {/* Name & Active Status */}
          <div
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className="min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white truncate hover:underline">
                {isChannel ? `#${conversation.name}` : peer?.displayName}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
              {!isChannel && peer?.online && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              )}
              <span className="truncate">
                {isChannel
                  ? conversation.description
                  : peer?.online
                  ? 'Active now'
                  : peer?.lastSeen
                  ? `Active ${peer.lastSeen}`
                  : `@${peerHandle}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons (Instagram Call & Info buttons) */}
        <div className="flex items-center gap-1">
          {/* Database Live Telemetry Pill */}
          <button
            onClick={onOpenDatabaseModal}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-cyan-500/40 text-[11px] font-mono text-cyan-300 hover:border-cyan-400 transition"
            title="Inspect Google Cloud Firestore connection"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Firestore: {firebaseConfig.projectId}</span>
          </button>

          {!isChannel && (
            <>
              {/* Phone Audio Call */}
              <button
                onClick={() => onStartCall('audio')}
                className="p-2.5 rounded-full text-zinc-200 hover:text-white hover:bg-[#1f1f1f] transition"
                title="Start Audio Call"
              >
                <Phone className="w-5 h-5" />
              </button>

              {/* Video Call */}
              <button
                onClick={() => onStartCall('video')}
                className="p-2.5 rounded-full text-zinc-200 hover:text-white hover:bg-[#1f1f1f] transition"
                title="Start Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Details / Info Button */}
          <button
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className={`p-2.5 rounded-full transition ${
              showProfileDrawer
                ? 'text-[#0095f6] bg-[#1f1f1f]'
                : 'text-zinc-200 hover:text-white hover:bg-[#1f1f1f]'
            }`}
            title="Conversation Info"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Instagram Profile Card at the Top of Chat */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 border-b border-zinc-900 mb-4">
          <div className="relative">
            <div className="p-1 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
              <img
                src={
                  isChannel
                    ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200'
                    : peer?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                }
                alt={isChannel ? conversation.name : peer?.displayName}
                className="w-22 h-22 rounded-full object-cover ring-4 ring-black"
              />
            </div>
            {!isChannel && peer?.online && (
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-black" />
            )}
          </div>

          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isChannel ? `#${conversation.name}` : peer?.displayName}
            </h3>
            <p className="text-xs text-zinc-400">
              {isChannel ? 'Team Workspace' : `@${peerHandle} · Wire Direct`}
            </p>
            <p className="text-xs text-zinc-500">
              {isChannel
                ? conversation.description
                : peer?.statusText || (peer?.online ? 'Online now' : 'Offline')}
            </p>
          </div>

          {/* View Profile Pill */}
          <button
            onClick={() => setShowProfileDrawer(true)}
            className="px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold transition"
          >
            View profile
          </button>

          <div className="text-[11px] text-zinc-500 font-medium pt-2">
            Messages are synchronized in real-time with Google Cloud Firestore
          </div>
        </div>

        {/* Date separator */}
        <div className="flex justify-center my-3">
          <span className="text-[11px] text-zinc-500 font-medium">TODAY</span>
        </div>

        {/* Message stream */}
        {messages.map((msg, index) => {
          const isMine = msg.senderId === currentUser.uid;
          const isLikedBurst = likedAnimationMessageId === msg.id;
          const isLast = index === messages.length - 1;

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${
                  isMine ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Receiver Avatar on left (theirs) */}
                {!isMine && (
                  <img
                    src={msg.senderAvatar || peer?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-800 shrink-0 mb-1"
                  />
                )}

                {/* Message Bubble + Reactions Container */}
                <div className="relative group/bubble">
                  {/* Double tap heart animation burst */}
                  {isLikedBurst && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-ping">
                      <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    onDoubleClick={() => handleDoubleTapMessage(msg.id)}
                    className={`relative px-4 py-2.5 text-[14px] leading-relaxed cursor-pointer select-text transition shadow-sm ${
                      isMine
                        ? 'bg-gradient-to-r from-[#7857ff] via-[#9c3aff] to-[#e040fb] text-white rounded-[22px] rounded-br-[4px]'
                        : 'bg-[#262626] hover:bg-[#2e2e2e] text-zinc-100 rounded-[22px] rounded-bl-[4px] border border-white/5'
                    }`}
                    title="Double tap to like with ❤️"
                  >
                    {/* Media content */}
                    {msg.mediaUrl && (
                      <div className="mb-2">
                        {msg.mediaType?.startsWith('image/') ? (
                          <img
                            src={msg.mediaUrl}
                            alt="Attachment"
                            className="max-h-72 w-auto rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-black/40 rounded-xl">
                            <FileText className="w-4 h-4 text-cyan-300" />
                            <span className="text-xs font-mono truncate">{msg.fileName || 'Attachment'}</span>
                            <a
                              href={msg.mediaUrl}
                              download={msg.fileName}
                              className="p-1 text-zinc-300 hover:text-white ml-auto"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text content */}
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  </div>

                  {/* Instagram Reaction Badges overlapping bottom of bubble */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div
                      className={`absolute -bottom-2.5 flex items-center gap-1 z-10 ${
                        isMine ? 'right-2' : 'left-2'
                      }`}
                    >
                      {(Object.entries(msg.reactions) as [string, string[]][]).map(([emoji, userIds]) => (
                        <button
                          key={emoji}
                          onClick={() => onAddReaction(msg.id, emoji)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-sans transition border shadow-lg ${
                            userIds.includes(currentUser.uid)
                              ? 'bg-[#1c1c1c] border-rose-500/40 text-rose-300'
                              : 'bg-[#1c1c1c] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <span>{emoji}</span>
                          {userIds.length > 1 && (
                            <span className="text-[10px] text-zinc-400 font-mono">{userIds.length}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Instagram Floating Hover Quick Reactions Dock */}
                  {hoveredMessageId === msg.id && (
                    <div
                      className={`absolute -top-9 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-[#1c1c1c] border border-zinc-700/80 shadow-2xl ${
                        isMine ? 'right-0' : 'left-0'
                      }`}
                    >
                      {INSTA_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onAddReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform text-sm px-1 py-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message timestamp & Seen status */}
              <div
                className={`text-[10px] text-zinc-500 mt-1 px-1 flex items-center gap-1.5 ${
                  isMine ? 'mr-1' : 'ml-9'
                }`}
              >
                <span>{msg.timestamp}</span>
                {isMine && isLast && (
                  <span className="text-zinc-400 font-medium">· Seen</span>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Instagram Message Composer Bar */}
      <footer className="p-3 bg-[#000000] border-t border-[#262626] relative">
        {/* Emoji Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-2 p-2 bg-[#1c1c1c] border border-zinc-700 rounded-2xl shadow-2xl flex items-center gap-2 z-30">
            {INSTA_REACTIONS.concat(['❤️', '✨', '🚀', '💯']).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-lg hover:scale-110 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="relative flex items-center">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.txt"
          />

          {/* Pill Container like Instagram DM */}
          <div className="w-full flex items-center gap-2 bg-[#1c1c1c] border border-zinc-800 rounded-full px-3 py-1.5 focus-within:border-zinc-700 transition">
            {/* Camera / Media Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-full text-[#0095f6] hover:bg-zinc-800 transition shrink-0"
              title="Add photo or media"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Microphone Voice Note */}
            <button
              type="button"
              onClick={handleVoiceNoteSim}
              className={`p-1.5 rounded-full transition shrink-0 ${
                isRecordingAudio ? 'text-rose-500 bg-rose-500/20 animate-pulse' : 'text-zinc-400 hover:text-white'
              }`}
              title="Send audio voice note"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isChannel
                  ? `Message #${conversation.name}...`
                  : `Message ${peer?.displayName}...`
              }
              className="flex-1 bg-transparent border-none text-[14px] text-white placeholder-zinc-500 focus:outline-none py-1"
            />

            {/* Emoji toggle */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white transition shrink-0"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* If input has text: Bold blue Send button. If empty: Quick Heart like Instagram! */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="text-[#0095f6] hover:text-[#1877f2] font-semibold text-sm px-2 py-1 transition shrink-0"
              >
                Send
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendHeart}
                className="p-1.5 text-zinc-400 hover:text-rose-500 transition shrink-0"
                title="Send a heart ❤️"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </footer>

      {/* Instagram Profile Details Drawer / Side Panel */}
      {showProfileDrawer && (
        <aside className="absolute inset-y-0 right-0 w-80 bg-[#121212] border-l border-[#262626] z-40 p-5 flex flex-col justify-between shadow-2xl">
          <div className="space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-sm font-bold text-white">Details</span>
              <button
                onClick={() => setShowProfileDrawer(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                <img
                  src={
                    isChannel
                      ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200'
                      : peer?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                  }
                  alt={isChannel ? conversation.name : peer?.displayName}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-black"
                />
              </div>
              <h4 className="text-base font-bold text-white">
                {isChannel ? `#${conversation.name}` : peer?.displayName}
              </h4>
              <p className="text-xs text-zinc-400 font-mono">
                {isChannel ? 'Public Channel' : peer?.email}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-[11px] text-zinc-300">
                <span className={`w-2 h-2 rounded-full ${peer?.online ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                <span>{peer?.online ? 'Active now' : peer?.lastSeen ? `Active ${peer.lastSeen}` : 'Offline'}</span>
              </div>
            </div>

            {/* Quick Actions */}
            {!isChannel && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowProfileDrawer(false);
                    onStartCall('audio');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Audio</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileDrawer(false);
                    onStartCall('video');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium transition"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
              </div>
            )}

            {/* Cloud & encryption status */}
            <div className="p-3 bg-[#1a1a1a] rounded-xl border border-zinc-800 text-xs space-y-1.5">
              <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                Security & Cloud Sync
              </div>
              <p className="text-zinc-400 text-[11px]">
                End-to-end encrypted messaging powered by Google Cloud Firestore cluster ({firebaseConfig.projectId}).
              </p>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 pt-1 font-mono">
                <span>STATUS: ENCRYPTED</span>
                <span>SYNC: REALTIME</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowProfileDrawer(false)}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
          >
            Close
          </button>
        </aside>
      )}
    </div>
  );
};
