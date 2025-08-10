// Core ATAS Types
export interface ATASUser {
  id: string; // ATAS-COUNTRYCODE-YEAR-NUMBER format
  email: string;
  phoneNumber: string;
  displayName: string;
  profileImage?: string;
  publicKey: string;
  deviceId: string;
  isOnline: boolean;
  lastSeen: Date;
  biometricEnabled: boolean;
  recoveryShares?: string[];
}

export interface ATASDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'web';
  os: string;
  publicKey: string;
  encryptedPrivateKey: string;
  registeredAt: Date;
  lastActive: Date;
  isTrusted: boolean;
}

export interface ATASMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string; // Encrypted content
  messageType: 'text' | 'image' | 'voice' | 'file' | 'system';
  timestamp: Date;
  signature: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number; // For voice messages
    mimeType?: string;
  };
  readReceipts: ATASReadReceipt[];
  isDelivered: boolean;
  isEncrypted: boolean;
}

export interface ATASChat {
  id: string;
  type: 'direct' | 'group';
  participants: string[]; // User IDs
  name?: string; // For group chats
  description?: string;
  groupKey?: string; // Encrypted group key
  lastMessage?: ATASMessage;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ATASReadReceipt {
  userId: string;
  messageId: string;
  readAt: Date;
}

export interface ATASCall {
  id: string;
  chatId: string;
  initiatorId: string;
  participants: string[];
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'missed';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
}

// Cryptography Types
export interface CryptoKeys {
  masterKey: string; // UMK derived via Argon2id
  publicKey: string; // Ed25519 public key
  privateKey: string; // Ed25519 private key (encrypted)
  chatKeys: Map<string, string>; // Per-chat symmetric keys
}

export interface EncryptedData {
  ciphertext: string;
  nonce: string;
  tag: string;
  algorithm: 'XChaCha20-Poly1305';
}

export interface KeyExchange {
  initiatorPublicKey: string;
  responderPublicKey: string;
  sharedSecret: string;
  timestamp: Date;
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  user: ATASUser | null;
  device: ATASDevice | null;
  accessToken: string | null;
  refreshToken: string | null;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  biometricData?: string;
  deviceFingerprint: string;
}

export interface RegistrationData {
  email: string;
  phoneNumber: string;
  displayName: string;
  countryCode: string;
  password: string;
  deviceInfo: {
    name: string;
    type: string;
    os: string;
  };
}

// Recovery Types
export interface RecoveryShare {
  shareIndex: number;
  encryptedShare: string;
  method: 'email' | 'device' | 'biometric';
  createdAt: Date;
}

export interface RecoveryOptions {
  emailShares: RecoveryShare[];
  deviceShares: RecoveryShare[];
  biometricBackup?: string;
  totalShares: number;
  threshold: number;
}

// UI Theme Types
export interface ATASTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    gradient: {
      start: string;
      end: string;
    };
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
}

// API Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WebSocketMessage {
  type: 'message' | 'call' | 'presence' | 'typing' | 'receipt';
  data: any;
  timestamp: Date;
}

// Media Types
export interface MediaUpload {
  id: string;
  file: {
    uri: string;
    type: string;
    name: string;
    size: number;
  };
  encryptedBlob: string;
  decryptionKey: string;
  uploadUrl: string;
}

export interface VoiceMemo {
  id: string;
  duration: number;
  encryptedData: string;
  codec: 'opus' | 'aac';
  sampleRate: number;
  channels: number;
}

// AI Integration Types
export interface AIFeatures {
  smartReplies: boolean;
  translation: boolean;
  summarization: boolean;
  ocr: boolean;
  speechToText: boolean;
  textToSpeech: boolean;
}

export interface AIResponse {
  type: 'smartReply' | 'translation' | 'summary' | 'transcription';
  content: string;
  confidence: number;
  processed: boolean;
}