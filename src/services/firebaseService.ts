import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

import { ATASUser, ATASMessage, ATASChat, ATASCall, ATASDevice } from '@/types';
import { atasCrypto } from '@/crypto/cryptoCore';

// Firestore collection names
const COLLECTIONS = {
  USERS: 'users',
  MESSAGES: 'messages',
  CHATS: 'chats',
  CALLS: 'calls',
  DEVICES: 'devices',
  ACTIVITY: 'userActivity',
  DAILY_STATS: 'dailyStats',
  USER_SESSIONS: 'userSessions',
  CHAT_MEMBERS: 'chatMembers',
  MEDIA: 'media',
  NOTIFICATIONS: 'notifications',
};

// Activity types for tracking
export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  CALL_MADE = 'call_made',
  CALL_RECEIVED = 'call_received',
  GROUP_CREATED = 'group_created',
  GROUP_JOINED = 'group_joined',
  MEDIA_SHARED = 'media_shared',
  PROFILE_UPDATED = 'profile_updated',
  SETTINGS_CHANGED = 'settings_changed',
  APP_OPENED = 'app_opened',
  APP_BACKGROUNDED = 'app_backgrounded',
  BIOMETRIC_ENABLED = 'biometric_enabled',
  ENCRYPTION_KEY_ROTATED = 'encryption_key_rotated',
}

// User activity record
export interface UserActivity {
  id: string;
  userId: string;
  atasId: string;
  activityType: ActivityType;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  metadata?: {
    chatId?: string;
    messageId?: string;
    callId?: string;
    deviceId?: string;
    ipAddress?: string;
    location?: {
      country: string;
      city?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    sessionDuration?: number;
    messageCount?: number;
    mediaType?: string;
    callDuration?: number;
    errorCode?: string;
    previousValue?: any;
    newValue?: any;
  };
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
    appVersion: string;
  };
}

// Daily statistics
export interface DailyStats {
  id: string;
  userId: string;
  atasId: string;
  date: string; // YYYY-MM-DD format
  stats: {
    messagesSent: number;
    messagesReceived: number;
    callsMade: number;
    callsReceived: number;
    totalCallDuration: number; // in seconds
    mediaShared: number;
    activeTime: number; // in seconds
    sessionCount: number;
    groupsCreated: number;
    groupsJoined: number;
    newContacts: number;
    encryptedMessages: number;
    biometricAuthUses: number;
  };
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

// User session tracking
export interface UserSession {
  id: string;
  userId: string;
  atasId: string;
  startTime: FirebaseFirestoreTypes.Timestamp;
  endTime?: FirebaseFirestoreTypes.Timestamp;
  duration?: number; // in seconds
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
    appVersion: string;
    deviceId: string;
  };
  isActive: boolean;
  lastActivity: FirebaseFirestoreTypes.Timestamp;
  activityCount: number;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private currentUser: ATASUser | null = null;
  private currentSession: UserSession | null = null;

  private constructor() {
    this.initializeFirebase();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialize Firebase services
   */
  private async initializeFirebase(): Promise<void> {
    try {
      // Set up crash reporting
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      // Set up analytics
      await analytics().setAnalyticsCollectionEnabled(true);
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      crashlytics().recordError(error as Error);
    }
  }

  /**
   * Create or update user profile in Firestore
   */
  async createUserProfile(user: ATASUser): Promise<void> {
    try {
      const userRef = firestore().collection(COLLECTIONS.USERS).doc(user.id);
      
      const userData = {
        ...user,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        lastSeen: firestore.FieldValue.serverTimestamp(),
        isOnline: true,
      };

      await userRef.set(userData, { merge: true });
      
      // Track user registration activity
      await this.trackActivity(ActivityType.PROFILE_UPDATED, {
        newValue: { profileCreated: true },
      });

      // Set analytics user properties
      await analytics().setUserId(user.id);
      await analytics().setUserProperties({
        atas_id: user.id,
        country: user.id.split('-')[1], // Extract country from ATAS ID
        registration_year: user.id.split('-')[2], // Extract year
      });

      this.currentUser = user;
      console.log('User profile created/updated successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(atasId: string): Promise<ATASUser | null> {
    try {
      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(atasId)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data() as ATASUser;
        this.currentUser = userData;
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(atasId: string, updates: Partial<ATASUser>): Promise<void> {
    try {
      const userRef = firestore().collection(COLLECTIONS.USERS).doc(atasId);
      
      await userRef.update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Track profile update activity
      await this.trackActivity(ActivityType.PROFILE_UPDATED, {
        newValue: updates,
      });

      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Update user online status
   */
  async updateOnlineStatus(atasId: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = firestore().collection(COLLECTIONS.USERS).doc(atasId);
      
      await userRef.update({
        isOnline,
        lastSeen: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  /**
   * Store encrypted message in Firestore
   */
  async storeMessage(message: ATASMessage): Promise<void> {
    try {
      const messageRef = firestore().collection(COLLECTIONS.MESSAGES).doc(message.id);
      
      await messageRef.set({
        ...message,
        timestamp: firestore.FieldValue.serverTimestamp(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update chat's last message
      await this.updateChatLastMessage(message.chatId, message);

      // Track message activity
      await this.trackActivity(ActivityType.MESSAGE_SENT, {
        chatId: message.chatId,
        messageId: message.id,
        messageType: message.messageType,
      });

      // Update daily stats
      await this.updateDailyStats(ActivityType.MESSAGE_SENT);

      console.log('Message stored successfully');
    } catch (error) {
      console.error('Error storing message:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(
    chatId: string, 
    limit: number = 50,
    lastMessage?: ATASMessage
  ): Promise<ATASMessage[]> {
    try {
      let query = firestore()
        .collection(COLLECTIONS.MESSAGES)
        .where('chatId', '==', chatId)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      if (lastMessage) {
        query = query.startAfter(lastMessage.timestamp);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ATASMessage[];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Create or update chat
   */
  async createChat(chat: ATASChat): Promise<void> {
    try {
      const chatRef = firestore().collection(COLLECTIONS.CHATS).doc(chat.id);
      
      await chatRef.set({
        ...chat,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Track group creation if it's a group chat
      if (chat.type === 'group') {
        await this.trackActivity(ActivityType.GROUP_CREATED, {
          chatId: chat.id,
          participantCount: chat.participants.length,
        });
        
        await this.updateDailyStats(ActivityType.GROUP_CREATED);
      }

      console.log('Chat created/updated successfully');
    } catch (error) {
      console.error('Error creating chat:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Get user's chats
   */
  async getUserChats(atasId: string): Promise<ATASChat[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.CHATS)
        .where('participants', 'array-contains', atasId)
        .orderBy('updatedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ATASChat[];
    } catch (error) {
      console.error('Error fetching user chats:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Update chat's last message
   */
  private async updateChatLastMessage(chatId: string, message: ATASMessage): Promise<void> {
    try {
      const chatRef = firestore().collection(COLLECTIONS.CHATS).doc(chatId);
      
      await chatRef.update({
        lastMessage: message,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating chat last message:', error);
    }
  }

  /**
   * Store call record
   */
  async storeCall(call: ATASCall): Promise<void> {
    try {
      const callRef = firestore().collection(COLLECTIONS.CALLS).doc(call.id);
      
      await callRef.set({
        ...call,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Track call activity
      const activityType = call.initiatorId === this.currentUser?.id 
        ? ActivityType.CALL_MADE 
        : ActivityType.CALL_RECEIVED;

      await this.trackActivity(activityType, {
        callId: call.id,
        callType: call.type,
        callDuration: call.duration,
        participantCount: call.participants.length,
      });

      // Update daily stats
      await this.updateDailyStats(activityType, { callDuration: call.duration });

      console.log('Call record stored successfully');
    } catch (error) {
      console.error('Error storing call record:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Track user activity
   */
  async trackActivity(
    activityType: ActivityType, 
    metadata?: any,
    deviceInfo?: any
  ): Promise<void> {
    try {
      if (!this.currentUser) return;

      const activity: Omit<UserActivity, 'id'> = {
        userId: this.currentUser.id,
        atasId: this.currentUser.id,
        activityType,
        timestamp: firestore.Timestamp.now(),
        metadata: metadata || {},
        deviceInfo: deviceInfo || {
          platform: 'android', // Will be dynamic
          version: '1.0.0',
          model: 'Unknown',
          appVersion: '1.0.0',
        },
      };

      const activityRef = firestore().collection(COLLECTIONS.ACTIVITY);
      await activityRef.add(activity);

      // Update session activity
      if (this.currentSession) {
        await this.updateSessionActivity();
      }

      // Log to Firebase Analytics
      await analytics().logEvent(activityType, {
        atas_id: this.currentUser.id,
        ...metadata,
      });

      console.log(`Activity tracked: ${activityType}`);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  /**
   * Start user session
   */
  async startUserSession(deviceInfo: any): Promise<void> {
    try {
      if (!this.currentUser) return;

      const session: Omit<UserSession, 'id'> = {
        userId: this.currentUser.id,
        atasId: this.currentUser.id,
        startTime: firestore.Timestamp.now(),
        deviceInfo,
        isActive: true,
        lastActivity: firestore.Timestamp.now(),
        activityCount: 0,
      };

      const sessionRef = await firestore().collection(COLLECTIONS.USER_SESSIONS).add(session);
      
      this.currentSession = {
        ...session,
        id: sessionRef.id,
      };

      // Track login activity
      await this.trackActivity(ActivityType.LOGIN);
      
      // Update user online status
      await this.updateOnlineStatus(this.currentUser.id, true);

      console.log('User session started');
    } catch (error) {
      console.error('Error starting user session:', error);
    }
  }

  /**
   * End user session
   */
  async endUserSession(): Promise<void> {
    try {
      if (!this.currentSession || !this.currentUser) return;

      const endTime = firestore.Timestamp.now();
      const duration = endTime.seconds - this.currentSession.startTime.seconds;

      await firestore()
        .collection(COLLECTIONS.USER_SESSIONS)
        .doc(this.currentSession.id)
        .update({
          endTime,
          duration,
          isActive: false,
        });

      // Track logout activity
      await this.trackActivity(ActivityType.LOGOUT, {
        sessionDuration: duration,
      });

      // Update daily stats with session duration
      await this.updateDailyStats(ActivityType.LOGOUT, { 
        sessionDuration: duration,
        sessionCount: 1,
      });

      // Update user offline status
      await this.updateOnlineStatus(this.currentUser.id, false);

      this.currentSession = null;
      console.log('User session ended');
    } catch (error) {
      console.error('Error ending user session:', error);
    }
  }

  /**
   * Update session activity
   */
  private async updateSessionActivity(): Promise<void> {
    try {
      if (!this.currentSession) return;

      await firestore()
        .collection(COLLECTIONS.USER_SESSIONS)
        .doc(this.currentSession.id)
        .update({
          lastActivity: firestore.Timestamp.now(),
          activityCount: firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  /**
   * Update daily statistics
   */
  async updateDailyStats(
    activityType: ActivityType, 
    additionalData?: any
  ): Promise<void> {
    try {
      if (!this.currentUser) return;

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const statsRef = firestore()
        .collection(COLLECTIONS.DAILY_STATS)
        .doc(`${this.currentUser.id}_${today}`);

      const updates: any = {
        userId: this.currentUser.id,
        atasId: this.currentUser.id,
        date: today,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Initialize stats if document doesn't exist
      const statsDoc = await statsRef.get();
      if (!statsDoc.exists) {
        updates.createdAt = firestore.FieldValue.serverTimestamp();
        updates.stats = {
          messagesSent: 0,
          messagesReceived: 0,
          callsMade: 0,
          callsReceived: 0,
          totalCallDuration: 0,
          mediaShared: 0,
          activeTime: 0,
          sessionCount: 0,
          groupsCreated: 0,
          groupsJoined: 0,
          newContacts: 0,
          encryptedMessages: 0,
          biometricAuthUses: 0,
        };
      }

      // Update specific stats based on activity type
      switch (activityType) {
        case ActivityType.MESSAGE_SENT:
          updates['stats.messagesSent'] = firestore.FieldValue.increment(1);
          updates['stats.encryptedMessages'] = firestore.FieldValue.increment(1);
          break;
        case ActivityType.MESSAGE_RECEIVED:
          updates['stats.messagesReceived'] = firestore.FieldValue.increment(1);
          break;
        case ActivityType.CALL_MADE:
          updates['stats.callsMade'] = firestore.FieldValue.increment(1);
          if (additionalData?.callDuration) {
            updates['stats.totalCallDuration'] = firestore.FieldValue.increment(additionalData.callDuration);
          }
          break;
        case ActivityType.CALL_RECEIVED:
          updates['stats.callsReceived'] = firestore.FieldValue.increment(1);
          if (additionalData?.callDuration) {
            updates['stats.totalCallDuration'] = firestore.FieldValue.increment(additionalData.callDuration);
          }
          break;
        case ActivityType.GROUP_CREATED:
          updates['stats.groupsCreated'] = firestore.FieldValue.increment(1);
          break;
        case ActivityType.GROUP_JOINED:
          updates['stats.groupsJoined'] = firestore.FieldValue.increment(1);
          break;
        case ActivityType.MEDIA_SHARED:
          updates['stats.mediaShared'] = firestore.FieldValue.increment(1);
          break;
        case ActivityType.LOGOUT:
          if (additionalData?.sessionDuration) {
            updates['stats.activeTime'] = firestore.FieldValue.increment(additionalData.sessionDuration);
          }
          if (additionalData?.sessionCount) {
            updates['stats.sessionCount'] = firestore.FieldValue.increment(additionalData.sessionCount);
          }
          break;
        case ActivityType.BIOMETRIC_ENABLED:
          updates['stats.biometricAuthUses'] = firestore.FieldValue.increment(1);
          break;
      }

      await statsRef.set(updates, { merge: true });
      console.log(`Daily stats updated for ${activityType}`);
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }

  /**
   * Get user's daily statistics
   */
  async getDailyStats(atasId: string, date?: string): Promise<DailyStats | null> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const statsDoc = await firestore()
        .collection(COLLECTIONS.DAILY_STATS)
        .doc(`${atasId}_${targetDate}`)
        .get();

      if (statsDoc.exists) {
        return {
          ...statsDoc.data(),
          id: statsDoc.id,
        } as DailyStats;
      }

      return null;
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      return null;
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivityHistory(
    atasId: string, 
    limit: number = 100,
    activityTypes?: ActivityType[]
  ): Promise<UserActivity[]> {
    try {
      let query = firestore()
        .collection(COLLECTIONS.ACTIVITY)
        .where('atasId', '==', atasId)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      if (activityTypes && activityTypes.length > 0) {
        query = query.where('activityType', 'in', activityTypes);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as UserActivity[];
    } catch (error) {
      console.error('Error fetching user activity history:', error);
      return [];
    }
  }

  /**
   * Upload encrypted media to Firebase Storage
   */
  async uploadEncryptedMedia(
    filePath: string, 
    fileName: string, 
    encryptedData: string
  ): Promise<string> {
    try {
      const reference = storage().ref(`media/${this.currentUser?.id}/${fileName}`);
      
      // Upload encrypted data
      await reference.putString(encryptedData, 'base64');
      
      // Get download URL
      const downloadURL = await reference.getDownloadURL();
      
      // Track media sharing activity
      await this.trackActivity(ActivityType.MEDIA_SHARED, {
        fileName,
        fileSize: encryptedData.length,
      });

      await this.updateDailyStats(ActivityType.MEDIA_SHARED);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading media:', error);
      crashlytics().recordError(error as Error);
      throw error;
    }
  }

  /**
   * Set up real-time listeners for user data
   */
  setupRealtimeListeners(atasId: string): {
    unsubscribeUser: () => void;
    unsubscribeChats: () => void;
  } {
    // Listen to user profile changes
    const unsubscribeUser = firestore()
      .collection(COLLECTIONS.USERS)
      .doc(atasId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            this.currentUser = { ...doc.data(), id: doc.id } as ATASUser;
          }
        },
        (error) => {
          console.error('Error in user listener:', error);
        }
      );

    // Listen to chat updates
    const unsubscribeChats = firestore()
      .collection(COLLECTIONS.CHATS)
      .where('participants', 'array-contains', atasId)
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              // Handle chat updates
              console.log('Chat updated:', change.doc.id);
            }
          });
        },
        (error) => {
          console.error('Error in chats listener:', error);
        }
      );

    return { unsubscribeUser, unsubscribeChats };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.currentUser = null;
    this.currentSession = null;
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();