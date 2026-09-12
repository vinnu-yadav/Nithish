export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  statusText?: string;
  online: boolean;
  lastSeen?: string;
  role?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO or formatted
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isChannel: true;
  unreadCount?: number;
  icon?: string;
}

export interface DirectChat {
  id: string;
  peer: User;
  isChannel: false;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export type Conversation = Channel | DirectChat;

export interface DatabaseStatus {
  service: string;
  projectId: string;
  databaseUrl: string;
  storageBucket: string;
  status: 'connected' | 'connecting' | 'fallback-synced' | 'error';
  latencyMs: number;
  collections: {
    name: string;
    count: number;
    description: string;
  }[];
  activeTransport: string;
  lastSyncTime: string;
}

export interface CallSession {
  active: boolean;
  peer: User;
  type: 'audio' | 'video';
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}
