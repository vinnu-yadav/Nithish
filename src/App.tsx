import React, { useState, useEffect, useRef } from 'react';
import { User, Channel, Conversation, Message, CallSession } from './types';
import {
  INITIAL_CHANNELS,
  INITIAL_CONTACTS,
  getStoredUser,
  setStoredUser,
  getStoredMessages,
  saveStoredMessages,
  getStoredContacts,
  saveStoredContacts,
  firebaseConfig,
  auth,
  db
} from './services/firebase';
import { sounds } from './services/sound';
import { AuthScreen } from './components/AuthScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { InstagramNav } from './components/InstagramNav';
import { InstagramInboxList } from './components/InstagramInboxList';
import { InstagramChatViewport } from './components/InstagramChatViewport';
import { CallModal } from './components/CallModal';
import { DatabaseModal } from './components/DatabaseModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [contacts, setContacts] = useState<User[]>(() => getStoredContacts());
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => getStoredMessages());
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [callSession, setCallSession] = useState<CallSession | null>(null);

  // Active call duration timer
  const callTimerRef = useRef<number | null>(null);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveStoredContacts(contacts);
  }, [contacts]);

  // Handle call duration counter
  useEffect(() => {
    if (callSession && callSession.status === 'connected') {
      callTimerRef.current = window.setInterval(() => {
        setCallSession((prev) =>
          prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null
        );
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [callSession?.status]);

  // Trigger login process with Loading Animation & Database verification
  const handleLoginSuccess = (user: User) => {
    setPendingUser(user);
    setIsLoadingAuth(true);
  };

  // Called when loading screen completes its data fetch sequence
  const handleLoadingFinish = () => {
    if (pendingUser) {
      setCurrentUser(pendingUser);
      setStoredUser(pendingUser);
      // Ensure current user is not duplicated in contacts list
      setContacts((prev) => {
        const filtered = prev.filter((c) => c.email !== pendingUser.email);
        return filtered;
      });
    }
    setIsLoadingAuth(false);
    setPendingUser(null);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setStoredUser(null);
    setActiveConversation(INITIAL_CHANNELS[0]);
    if (callSession) {
      setCallSession(null);
    }
    sounds.stopRingtone();
  };

  // Send message handler with auto-reply simulation
  const handleSendMessage = (
    text: string,
    media?: { url: string; type: string; name: string }
  ) => {
    if (!currentUser || !activeConversation) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      chatId: activeConversation.id,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatarUrl,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaUrl: media?.url,
      mediaType: media?.type,
      fileName: media?.name,
      status: 'sent'
    };

    sounds.playSend();

    setMessages((prev) => {
      const existing = prev[activeConversation.id] || [];
      return {
        ...prev,
        [activeConversation.id]: [...existing, newMsg]
      };
    });

    // Realistic auto-reply simulation for direct chats or channel mentions
    if (!activeConversation.isChannel) {
      const peer = activeConversation.peer;
      const conversationId = activeConversation.id;

      setTimeout(() => {
        const replyPool = [
          `Got your message! Firestore latency is currently running crisp and smooth.`,
          `Sounds great! I'm monitoring the kartify-a4e66 Firestore cluster right now.`,
          `Confirmed. Message stored and indexed in real-time.`,
          `Awesome. Feel free to initiate a voice or video call whenever you want to test!`,
          `Checked and verified. All WebRTC peer connections are operational.`
        ];
        const randomReply = replyPool[Math.floor(Math.random() * replyPool.length)];

        const autoMsg: Message = {
          id: 'msg_reply_' + Date.now().toString(36),
          chatId: conversationId,
          senderId: peer.uid,
          senderName: peer.displayName,
          senderAvatar: peer.avatarUrl,
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        };

        setMessages((curr) => {
          const currentList = curr[conversationId] || [];
          return {
            ...curr,
            [conversationId]: [...currentList, autoMsg]
          };
        });

        sounds.playReceive();
      }, 1600);
    }
  };

  // Emoji reactions
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!currentUser || !activeConversation) return;
    const convoId = activeConversation.id;

    setMessages((prev) => {
      const list = prev[convoId] || [];
      const updated = list.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || {};
        const usersForEmoji = currentReactions[emoji] || [];

        const hasReacted = usersForEmoji.includes(currentUser.uid);
        const newUsers = hasReacted
          ? usersForEmoji.filter((id) => id !== currentUser.uid)
          : [...usersForEmoji, currentUser.uid];

        const nextReactions = { ...currentReactions };
        if (newUsers.length > 0) {
          nextReactions[emoji] = newUsers;
        } else {
          delete nextReactions[emoji];
        }

        return { ...m, reactions: nextReactions };
      });

      return {
        ...prev,
        [convoId]: updated
      };
    });
  };

  // Initiate call
  const handleStartCall = (type: 'audio' | 'video') => {
    if (!activeConversation || activeConversation.isChannel) return;
    const peer = activeConversation.peer;

    setCallSession({
      active: true,
      peer,
      type,
      status: 'calling',
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false
    });

    // Auto-connect after 1.5s simulation
    setTimeout(() => {
      setCallSession((prev) => (prev ? { ...prev, status: 'connected' } : null));
    }, 1500);
  };

  const handleEndCall = () => {
    setCallSession(null);
    sounds.stopRingtone();
  };

  const handleToggleMute = () => {
    setCallSession((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  };

  const handleToggleVideo = () => {
    setCallSession((prev) => (prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null));
  };

  const handleAddContact = (email: string, name: string) => {
    const newContact: User = {
      uid: 'usr_' + Date.now().toString(36),
      email,
      displayName: name,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000000)}?w=150&auto=format&fit=crop&q=80`,
      online: true,
      statusText: 'Added via Firestore search'
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  // 1. Show Loading Screen if in login transition
  if (isLoadingAuth && pendingUser) {
    return (
      <LoadingScreen
        userName={pendingUser.displayName || pendingUser.email}
        onFinish={handleLoadingFinish}
      />
    );
  }

  // 2. Show Auth Screen if not logged in
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Main Chat & Messenger Workspace
  const currentMessages = activeConversation ? messages[activeConversation.id] || [] : [];
  const totalUnread = channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);

  return (
    <div className="h-screen w-screen bg-[#000000] overflow-hidden select-none font-sans text-[#f5f5f5]">
      {activeConversation ? (
        /* Full Screen Chat Viewport */
        <div className="h-full w-full flex flex-col bg-[#000000] overflow-hidden">
          <InstagramChatViewport
            conversation={activeConversation}
            currentUser={currentUser}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onAddReaction={handleAddReaction}
            onStartCall={handleStartCall}
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
            onBackToInbox={() => setActiveConversation(null)}
          />
        </div>
      ) : (
        /* Accounts View: Navigation rail + Accounts inbox list */
        <div className="h-full w-full flex bg-[#000000] overflow-hidden">
          <InstagramNav
            currentUser={currentUser}
            unreadDirectCount={totalUnread}
            onSignOut={handleSignOut}
          />

          <div className="flex-1 h-full flex justify-center bg-[#000000] overflow-hidden">
            <InstagramInboxList
              currentUser={currentUser}
              contacts={contacts}
              channels={channels}
              messages={messages}
              activeConversation={activeConversation}
              onSelectConversation={setActiveConversation}
              onAddContact={handleAddContact}
            />
          </div>
        </div>
      )}

      {/* Active Call Modal Overlay */}
      {callSession && (
        <CallModal
          session={callSession}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
        />
      )}

      {/* Database Telemetry & Diagnostics Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
    </div>
  );
}
