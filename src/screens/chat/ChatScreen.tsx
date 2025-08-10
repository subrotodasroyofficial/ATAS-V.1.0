import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

import { futuristicTheme, gradients, glowEffects } from '@/theme/futuristicTheme';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import FuturisticButton from '@/components/ui/FuturisticButton';
import { ATASUser, ATASChat, ATASMessage } from '@/types';
import { firebaseService, ActivityType } from '@/services/firebaseService';

const { width, height } = Dimensions.get('window');

interface ChatScreenProps {
  navigation: StackNavigationProp<any>;
  route: {
    params: {
      chat: ATASChat;
      user: ATASUser | null;
    };
  };
  user: ATASUser | null;
}

// Mock messages for demonstration
const mockMessages: ATASMessage[] = [
  {
    id: 'msg1',
    chatId: '1',
    senderId: 'ATAS-USA-2025-0002',
    content: 'Hey! How are you doing?',
    messageType: 'text',
    timestamp: new Date(Date.now() - 300000),
    signature: '',
    readReceipts: [],
    isDelivered: true,
    isEncrypted: true,
  },
  {
    id: 'msg2',
    chatId: '1',
    senderId: 'ATAS-IND-2025-0001',
    content: 'I\'m doing great! Just working on the new ATAS features. The encryption is really impressive!',
    messageType: 'text',
    timestamp: new Date(Date.now() - 240000),
    signature: '',
    readReceipts: [],
    isDelivered: true,
    isEncrypted: true,
  },
  {
    id: 'msg3',
    chatId: '1',
    senderId: 'ATAS-USA-2025-0002',
    content: 'That\'s awesome! Can you show me the voice message feature?',
    messageType: 'text',
    timestamp: new Date(Date.now() - 180000),
    signature: '',
    readReceipts: [],
    isDelivered: true,
    isEncrypted: true,
  },
  {
    id: 'msg4',
    chatId: '1',
    senderId: 'ATAS-IND-2025-0001',
    content: 'Voice message: "Sure! Here\'s how the voice messages work in ATAS Messenger..."',
    messageType: 'voice',
    timestamp: new Date(Date.now() - 120000),
    signature: '',
    readReceipts: [],
    isDelivered: true,
    isEncrypted: true,
    metadata: {
      duration: 15,
    },
  },
];

const MessageItem: React.FC<{
  message: ATASMessage;
  isOwn: boolean;
  onLongPress: () => void;
}> = ({ message, isOwn, onLongPress }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'voice':
        return (
          <View style={styles.voiceMessage}>
            <TouchableOpacity style={styles.playButton}>
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M8 5v14l11-7z"
                  fill={futuristicTheme.colors.text}
                />
              </Svg>
            </TouchableOpacity>
            <View style={styles.waveform}>
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { height: Math.random() * 20 + 10 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.voiceDuration}>
              {Math.floor((message.metadata?.duration || 0) / 60)}:
              {((message.metadata?.duration || 0) % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        );
      case 'image':
        return (
          <View style={styles.imageMessage}>
            <Text style={styles.messageText}>📷 Image</Text>
          </View>
        );
      case 'file':
        return (
          <View style={styles.fileMessage}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                fill={futuristicTheme.colors.primary}
              />
            </Svg>
            <Text style={styles.fileName}>
              {message.metadata?.fileName || 'Document'}
            </Text>
          </View>
        );
      default:
        return (
          <Text style={styles.messageText}>
            {message.content}
          </Text>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.messageContainer,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={
          isOwn
            ? gradients.buttonGradient
            : gradients.messageGradient
        }
        style={styles.messageGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {renderMessageContent()}
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {formatTime(message.timestamp)}
          </Text>
          {isOwn && (
            <View style={styles.messageStatus}>
              {message.isDelivered ? (
                <Svg width={16} height={16} viewBox="0 0 24 24">
                  <Path
                    d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                    fill={futuristicTheme.colors.primary}
                  />
                </Svg>
              ) : (
                <Svg width={16} height={16} viewBox="0 0 24 24">
                  <Path
                    d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                    fill={futuristicTheme.colors.textSecondary}
                  />
                </Svg>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route, user }) => {
  const { chat } = route.params;
  const [messages, setMessages] = useState<ATASMessage[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const newMessage: ATASMessage = {
        id: `msg_${Date.now()}`,
        chatId: chat.id,
        senderId: user?.id || 'ATAS-IND-2025-0001',
        content: inputText.trim(),
        messageType: 'text',
        timestamp: new Date(),
        signature: '',
        readReceipts: [],
        isDelivered: true,
        isEncrypted: true,
      };

      // Add message to local state immediately for instant UI update
      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      try {
        // Store message in Firestore
        await firebaseService.storeMessage(newMessage);
        
        // Track message activity
        await firebaseService.trackActivity(ActivityType.MESSAGE_SENT, {
          chatId: chat.id,
          messageType: 'text',
          messageLength: inputText.trim().length,
        });
      } catch (error) {
        console.error('Failed to store message:', error);
        // Could implement retry logic or show error to user
      }
    }
  };

  const handleVoiceMessage = async () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      Alert.alert('Voice Recording', 'Recording started...');
    } else {
      // Stop recording and send
      const voiceMessage: ATASMessage = {
        id: `voice_${Date.now()}`,
        chatId: chat.id,
        senderId: user?.id || 'ATAS-IND-2025-0001',
        content: 'Voice message',
        messageType: 'voice',
        timestamp: new Date(),
        signature: '',
        readReceipts: [],
        isDelivered: true,
        isEncrypted: true,
        metadata: {
          duration: Math.floor(Math.random() * 60) + 10,
        },
      };

      setMessages(prev => [...prev, voiceMessage]);

      try {
        // Store voice message in Firestore
        await firebaseService.storeMessage(voiceMessage);
        
        // Track voice message activity
        await firebaseService.trackActivity(ActivityType.MESSAGE_SENT, {
          chatId: chat.id,
          messageType: 'voice',
          duration: voiceMessage.metadata?.duration,
        });
      } catch (error) {
        console.error('Failed to store voice message:', error);
      }
    }
  };

  const handleAttachment = (type: string) => {
    setShowAttachments(false);
    
    switch (type) {
      case 'camera':
        Alert.alert('Camera', 'Opening camera...');
        break;
      case 'gallery':
        Alert.alert('Gallery', 'Opening gallery...');
        break;
      case 'document':
        Alert.alert('Document', 'Opening document picker...');
        break;
      case 'location':
        Alert.alert('Location', 'Sharing location...');
        break;
    }
  };

  const handleCall = async (type: 'voice' | 'video') => {
    try {
      // Track call initiation
      await firebaseService.trackActivity(ActivityType.CALL_MADE, {
        chatId: chat.id,
        callType: type,
        participantCount: chat.participants.length,
      });

      Alert.alert(
        `${type === 'voice' ? 'Voice' : 'Video'} Call`,
        `Starting ${type} call with ${chat.name}...`
      );
    } catch (error) {
      console.error('Failed to track call activity:', error);
    }
  };

  const handleMessageLongPress = (messageId: string) => {
    Alert.alert(
      'Message Options',
      'What would you like to do?',
      [
        { text: 'Reply', onPress: () => {} },
        { text: 'Forward', onPress: () => {} },
        { text: 'Copy', onPress: () => {} },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleChatInfo = () => {
    navigation.navigate('ChatInfo', { chat });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={gradients.backgroundGradient}
      style={styles.header}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              fill={futuristicTheme.colors.text}
            />
          </Svg>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.chatInfo} onPress={handleChatInfo}>
          <View style={styles.headerAvatar}>
            <LinearGradient colors={gradients.primaryGradient} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {chat.type === 'group' ? '👥' : chat.name?.charAt(0) || '?'}
              </Text>
            </LinearGradient>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{chat.name}</Text>
            <Text style={styles.headerStatus}>
              {chat.type === 'group' 
                ? `${chat.participants.length} participants`
                : 'Online'
              }
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => handleCall('voice')}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill={futuristicTheme.colors.textSecondary}
            />
          </Svg>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => handleCall('video')}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
              fill={futuristicTheme.colors.textSecondary}
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderInput = () => (
    <View style={styles.inputContainer}>
      <LinearGradient
        colors={gradients.messageGradient}
        style={styles.inputGradient}
      >
        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => setShowAttachments(!showAttachments)}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"
              fill={futuristicTheme.colors.textSecondary}
            />
          </Svg>
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={futuristicTheme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />

        {/* Voice/Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            isRecording && styles.recordingButton,
          ]}
          onPress={inputText.trim() ? handleSendMessage : handleVoiceMessage}
          onLongPress={handleVoiceMessage}
        >
          <LinearGradient
            colors={
              isRecording
                ? gradients.dangerGradient
                : inputText.trim()
                ? gradients.buttonGradient
                : gradients.primaryGradient
            }
            style={styles.sendGradient}
          >
            {inputText.trim() ? (
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
                  fill={futuristicTheme.colors.text}
                />
              </Svg>
            ) : (
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"
                  fill={futuristicTheme.colors.text}
                />
              </Svg>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Attachment Options */}
      {showAttachments && (
        <View style={styles.attachmentOptions}>
          <LinearGradient
            colors={gradients.messageGradient}
            style={styles.attachmentGradient}
          >
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('camera')}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"
                  fill={futuristicTheme.colors.primary}
                />
              </Svg>
              <Text style={styles.attachmentText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('gallery')}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
                  fill={futuristicTheme.colors.secondary}
                />
              </Svg>
              <Text style={styles.attachmentText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('document')}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                  fill={futuristicTheme.colors.accent}
                />
              </Svg>
              <Text style={styles.attachmentText}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('location')}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"
                  fill={futuristicTheme.colors.warning}
                />
              </Svg>
              <Text style={styles.attachmentText}>Location</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FuturisticBackground />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {renderHeader()}
        
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageItem
              message={item}
              isOwn={item.senderId === user?.id}
              onLongPress={() => handleMessageLongPress(item.id)}
            />
          )}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {renderInput()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: futuristicTheme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: futuristicTheme.spacing.md,
    paddingVertical: futuristicTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: futuristicTheme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: futuristicTheme.spacing.xs,
    marginRight: futuristicTheme.spacing.sm,
  },
  chatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    marginRight: futuristicTheme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    letterSpacing: 0.5,
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: futuristicTheme.spacing.xs,
    marginLeft: futuristicTheme.spacing.sm,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: futuristicTheme.spacing.md,
    paddingBottom: futuristicTheme.spacing.xl,
  },
  messageContainer: {
    marginHorizontal: futuristicTheme.spacing.md,
    marginVertical: futuristicTheme.spacing.xs,
    maxWidth: width * 0.8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageGradient: {
    borderRadius: futuristicTheme.borderRadius.lg,
    padding: futuristicTheme.spacing.md,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border + '40',
  },
  messageText: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.text,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: futuristicTheme.spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginRight: futuristicTheme.spacing.xs,
  },
  messageStatus: {
    marginLeft: futuristicTheme.spacing.xs,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: futuristicTheme.colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: futuristicTheme.spacing.sm,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 30,
    marginRight: futuristicTheme.spacing.sm,
  },
  waveBar: {
    width: 3,
    backgroundColor: futuristicTheme.colors.primary,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  voiceDuration: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
  },
  imageMessage: {
    minWidth: 200,
    minHeight: 150,
    backgroundColor: futuristicTheme.colors.surface,
    borderRadius: futuristicTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
  },
  fileName: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.text,
    marginLeft: futuristicTheme.spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: futuristicTheme.spacing.md,
    paddingVertical: futuristicTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: futuristicTheme.colors.border,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: futuristicTheme.borderRadius.xl,
    paddingHorizontal: futuristicTheme.spacing.sm,
    paddingVertical: futuristicTheme.spacing.xs,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
    minHeight: 48,
  },
  attachButton: {
    padding: futuristicTheme.spacing.xs,
    marginRight: futuristicTheme.spacing.xs,
  },
  textInput: {
    flex: 1,
    color: futuristicTheme.colors.text,
    fontFamily: futuristicTheme.fonts.regular,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: futuristicTheme.spacing.xs,
    paddingHorizontal: futuristicTheme.spacing.sm,
  },
  sendButton: {
    marginLeft: futuristicTheme.spacing.xs,
  },
  recordingButton: {
    transform: [{ scale: 1.1 }],
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentOptions: {
    marginTop: futuristicTheme.spacing.sm,
  },
  attachmentGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: futuristicTheme.spacing.md,
    borderRadius: futuristicTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
  },
  attachmentOption: {
    alignItems: 'center',
    padding: futuristicTheme.spacing.sm,
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginTop: futuristicTheme.spacing.xs,
  },
});

export default ChatScreen;