import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Info,
  Heart,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Send,
  Download,
  FileText,
  Check,
  CheckCheck,
  Hash,
  Sparkles,
  Database,
  ArrowLeft,
  CircleDot
} from 'lucide-react';
import { Conversation, Message, User } from '../types';
import { firebaseConfig } from '../services/firebase';

interface InstagramChatViewportProps {
  conversation: Conversation | null;
  currentUser: User;
  messages: Message[];
  onSendMessage: (text: string, media?: { url: string; type: string; name: string }) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenDatabaseModal: () => void;
  onBackToInbox?: () => void; // Mobile back button
}

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

export const InstagramChatViewport: React.FC<InstagramChatViewportProps> = ({
  conversation,
  currentUser,
  messages,
  onSendMessage,
  onAddReaction,
  onStartCall,
  onOpenDatabaseModal,
  onBackToInbox
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [heartAnimKey, setHeartAnimKey] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, conversation?.id]);

  if (!conversation) {
    return (
      <div
        id="instagram-empty-state"
        className="flex-1 h-full bg-[#000000] flex flex-col items-center justify-center p-8 text-center select-none"
      >
        <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-5 text-white">
          <Send className="w-10 h-10 -rotate-45 translate-x-1 -translate-y-1" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Your Direct Messages
        </h2>
        <p className="text-sm text-[#a8a8a8] max-w-sm leading-relaxed">
          Send private photos, videos and messages to friends or teammates.
        </p>
      </div>
    );
  }

  const isChannel = conversation.isChannel;
  const peer = !isChannel ? conversation.peer : null;

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
    setHeartAnimKey(Date.now());
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

  return (
    <div
      id="instagram-chat-viewport"
      className="flex-1 h-full flex flex-col bg-[#000000] text-[#f5f5f5] overflow-hidden select-none relative"
    >
      {/* Top Header - Authentic Instagram Direct bar */}
      <div className="h-16 px-4 md:px-6 border-b border-[#262626] flex items-center justify-between shrink-0 bg-[#000000]/95 backdrop-blur z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button to return to accounts */}
          {onBackToInbox && (
            <button
              type="button"
              id="chat-back-to-accounts-btn"
              onClick={onBackToInbox}
              className="p-2 -ml-2 rounded-full hover:bg-[#1a1a1a] text-white hover:text-[#0095f6] transition flex items-center gap-1.5 group shrink-0"
              title="Back to accounts"
            >
              <ArrowLeft className="w-5 h-5 transition group-hover:-translate-x-0.5" />
              <span className="text-xs font-semibold text-[#a8a8a8] group-hover:text-white">
                Back
              </span>
            </button>
          )}

          {isChannel ? (
            <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#333333] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {conversation.icon || <Hash className="w-5 h-5" />}
            </div>
          ) : (
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 rounded-full p-[2px] ${
                  peer?.online
                    ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
                    : 'bg-[#262626]'
                }`}
              >
                <img
                  src={
                    peer?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={peer?.displayName}
                  className="w-full h-full rounded-full object-cover border-2 border-black"
                />
              </div>
              {peer?.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
              )}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white truncate">
                {isChannel ? `#${conversation.name}` : peer?.displayName}
              </h2>
            </div>
            <p className="text-xs text-[#a8a8a8] truncate">
              {isChannel
                ? conversation.description
                : peer?.online
                ? 'Active now'
                : peer?.lastSeen
                ? `Active ${peer.lastSeen}`
                : peer?.email}
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-white">
          {!isChannel && (
            <>
              <button
                type="button"
                onClick={() => onStartCall('audio')}
                className="p-2 rounded-full hover:bg-[#1a1a1a] text-white hover:text-[#0095f6] transition"
                title="Voice Call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onStartCall('video')}
                className="p-2 rounded-full hover:bg-[#1a1a1a] text-white hover:text-[#0095f6] transition"
                title="Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onOpenDatabaseModal}
            className="p-2 rounded-full hover:bg-[#1a1a1a] text-[#a8a8a8] hover:text-emerald-400 transition"
            title="Inspect Database Connection"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 no-scrollbar">
        {/* Profile Card Intro inside the chat viewport */}
        {!isChannel && peer && (
          <div className="flex flex-col items-center justify-center pt-6 pb-8 text-center border-b border-[#262626]/50 mb-6">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] mb-3 shadow-lg">
              <img
                src={
                  peer.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                }
                alt={peer.displayName}
                className="w-full h-full rounded-full object-cover border-4 border-black"
              />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">{peer.displayName}</h3>
            <p className="text-xs text-[#a8a8a8] font-mono mb-2">{peer.email}</p>
            {peer.statusText && (
              <p className="text-xs text-[#a8a8a8] max-w-sm mb-3">"{peer.statusText}"</p>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a1a] text-[11px] font-medium text-[#a8a8a8] border border-[#262626]">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time sync on Firestore</span>
            </div>
          </div>
        )}

        {/* Message items */}
        {messages.map((msg, index) => {
          const isMine = msg.senderId === currentUser.uid;
          const isHeartOnly = msg.text === '❤️';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group mb-2`}
            >
              <div
                className={`flex gap-2 max-w-[80%] sm:max-w-[65%] ${
                  isMine ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Small circular avatar for sender */}
                {!isMine && (
                  <img
                    src={
                      msg.senderAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                    }
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover self-end mb-1 shrink-0 ring-1 ring-slate-800"
                  />
                )}

                <div className={`space-y-1 ${isMine ? 'items-end' : 'items-start'}`}>
                  {/* Bubble styling: Instagram gradient for mine, dark grey rounded pill for receiver */}
                  {isHeartOnly ? (
                    <div className="text-5xl py-1 transform active:scale-125 transition select-none cursor-pointer">
                      ❤️
                    </div>
                  ) : (
                    <div
                      className={`relative px-4 py-2.5 text-[14.5px] leading-snug break-words transition select-text ${
                        isMine
                          ? 'bg-gradient-to-r from-[#8a3ab9] via-[#e95950] to-[#bc1888] text-white rounded-[22px] rounded-br-[4px] shadow-sm'
                          : 'bg-[#262626] text-white rounded-[22px] rounded-bl-[4px]'
                      }`}
                    >
                      {/* Media Image / File */}
                      {msg.mediaUrl && (
                        <div className="mb-2">
                          {msg.mediaType?.startsWith('image/') ? (
                            <img
                              src={msg.mediaUrl}
                              alt="Attachment"
                              className="max-h-72 w-auto rounded-2xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2.5 bg-black/40 rounded-xl">
                              <FileText className="w-5 h-5 text-[#0095f6]" />
                              <span className="text-xs font-mono truncate max-w-[160px]">
                                {msg.fileName || 'Document'}
                              </span>
                              <a
                                href={msg.mediaUrl}
                                download={msg.fileName}
                                className="p-1 text-slate-300 hover:text-white ml-auto"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text */}
                      {msg.text && <span className="whitespace-pre-wrap">{msg.text}</span>}
                    </div>
                  )}

                  {/* Message timestamp & status (Instagram style subtext) */}
                  <div
                    className={`flex items-center gap-1 text-[10px] text-[#737373] px-1.5 ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMine && (
                      <span className="text-[#a8a8a8]">
                        {msg.status === 'read' ? 'Seen' : 'Sent'}
                      </span>
                    )}
                  </div>

                  {/* Reaction chips below bubble */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div
                      className={`flex flex-wrap gap-1 ${
                        isMine ? 'justify-end' : 'justify-start'
                      } -mt-0.5`}
                    >
                      {(Object.entries(msg.reactions) as [string, string[]][]).map(
                        ([emoji, userIds]) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onAddReaction(msg.id, emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition border ${
                              userIds.includes(currentUser.uid)
                                ? 'bg-[#1a1a1a] border-[#0095f6] text-white'
                                : 'bg-[#1a1a1a] border-[#262626] text-[#a8a8a8]'
                            }`}
                          >
                            <span>{emoji}</span>
                            {userIds.length > 1 && (
                              <span className="text-[10px] font-medium">{userIds.length}</span>
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Hover Instagram Quick Reactions pill */}
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-full bg-[#1a1a1a] border border-[#333333] shadow-md w-fit ${
                      isMine ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {QUICK_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => onAddReaction(msg.id, em)}
                        className="text-xs hover:scale-130 transition-transform p-0.5"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Instagram double-tap heart animation if triggered */}
      {heartAnimKey && (
        <div
          key={heartAnimKey}
          className="pointer-events-none absolute inset-0 flex items-center justify-center animate-ping duration-700"
        >
          <span className="text-8xl">❤️</span>
        </div>
      )}

      {/* Message Input Container (Instagram Direct pill capsule) */}
      <div className="p-3 sm:p-4 bg-[#000000] border-t border-[#262626] relative shrink-0">
        {/* Emoji picker popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-3 p-2.5 bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-2xl flex items-center gap-2 z-20">
            {['❤️', '🙌', '🔥', '😂', '😍', '🎉', '🚀', '💯'].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + em);
                  setShowEmojiPicker(false);
                }}
                className="w-8 h-8 rounded-lg hover:bg-[#262626] flex items-center justify-center text-lg hover:scale-115 transition"
              >
                {em}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-[#121212] border border-[#262626] rounded-full px-3 py-1.5 focus-within:border-[#555555] transition"
        >
          {/* Emoji button inside input capsule */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-white hover:text-amber-400 rounded-full transition shrink-0"
            title="Choose emoji"
          >
            <Smile className="w-6 h-6" />
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.txt"
          />

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isChannel
                ? `Message #${conversation.name}...`
                : `Message ${peer?.displayName}...`
            }
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-[#737373] focus:outline-none px-2 py-1"
          />

          {/* If text is typed, show blue "Send" button; otherwise show Attachment + Heart button like Instagram */}
          {inputText.trim().length > 0 ? (
            <button
              type="submit"
              className="text-sm font-semibold text-[#0095f6] hover:text-white px-2 py-1 transition shrink-0"
            >
              Send
            </button>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-white hover:text-[#0095f6] rounded-full transition"
                title="Send photo or document"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleSendHeart}
                className="p-1.5 text-white hover:text-[#ff3040] hover:scale-110 rounded-full transition"
                title="Send Heart"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
