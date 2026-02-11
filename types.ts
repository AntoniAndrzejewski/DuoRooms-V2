
export enum Language {
  EN = 'en',
  PL = 'pl',
  RU = 'ru',
  FR = 'fr',
  ES = 'es'
}

export enum RoomTheme {
  ROMANTIC = 'romantic',
  BUSINESS = 'business',
  FRIENDLY = 'friendly'
}

export enum ActivityType {
  CHESS = 'chess',
  TIC_TAC_TOE = 'tictactoe',
  YOUTUBE = 'youtube',
  LOBBY = 'lobby'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female' | 'other';
  isOwner?: boolean;
  isGuest?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
}

export interface RoomState {
  id: string;
  theme: RoomTheme;
  ownerId: string;
  participants: User[];
  waitingRoom: User[];
  currentActivity: ActivityType;
  messages: Message[];
}
