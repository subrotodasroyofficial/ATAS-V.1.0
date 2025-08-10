import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

import { futuristicTheme, gradients, glowEffects } from '@/theme/futuristicTheme';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import FuturisticButton from '@/components/ui/FuturisticButton';
import { ATASUser, ATASChat, ATASCall } from '@/types';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

interface ChatListScreenProps {
  navigation: StackNavigationProp<any>;
  user: ATASUser | null;
  onAuthStateChange: (authState: any) => void;
}

// Mock data for demonstration
const mockChats: ATASChat[] = [
  {
    id: '1',
    type: 'direct',
    participants: ['ATAS-IND-2025-0001', 'ATAS-USA-2025-0002'],
    name: 'Alex Chen',
    lastMessage: {
      id: 'msg1',
      chatId: '1',
      senderId: 'ATAS-USA-2025-0002',
      content: 'Hey! How are you doing?',
      messageType: 'text',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      signature: '',
      readReceipts: [],
      isDelivered: true,
      isEncrypted: true,
    },
    unreadCount: 2,
    isPinned: false,
    isMuted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    type: 'group',
    participants: ['ATAS-IND-2025-0001', 'ATAS-USA-2025-0002', 'ATAS-GBR-2025-0001'],
    name: 'ATAS Dev Team',
    description: 'Development discussion',
    lastMessage: {
      id: 'msg2',
      chatId: '2',
      senderId: 'ATAS-GBR-2025-0001',
      content: 'Great work on the new encryption!',
      messageType: 'text',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      signature: '',
      readReceipts: [],
      isDelivered: true,
      isEncrypted: true,
    },
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCalls: ATASCall[] = [
  {
    id: '1',
    chatId: '1',
    initiatorId: 'ATAS-USA-2025-0002',
    participants: ['ATAS-IND-2025-0001', 'ATAS-USA-2025-0002'],
    type: 'voice',
    status: 'ended',
    startTime: new Date(Date.now() - 7200000), // 2 hours ago
    endTime: new Date(Date.now() - 7020000),
    duration: 180, // 3 minutes
  },
  {
    id: '2',
    chatId: '2',
    initiatorId: 'ATAS-IND-2025-0001',
    participants: ['ATAS-IND-2025-0001', 'ATAS-GBR-2025-0001'],
    type: 'video',
    status: 'missed',
    startTime: new Date(Date.now() - 14400000), // 4 hours ago
    duration: 0,
  },
];

// Chat Item Component
const ChatItem: React.FC<{ chat: ATASChat; onPress: () => void; onLongPress: () => void }> = ({
  chat,
  onPress,
  onLongPress,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={chat.isPinned ? [futuristicTheme.colors.secondary + '20', 'transparent'] : ['transparent', 'transparent']}
        style={styles.chatItemGradient}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={gradients.primaryGradient}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {chat.type === 'group' ? '👥' : chat.name?.charAt(0) || '?'}
            </Text>
          </LinearGradient>
          {chat.type === 'group' && <View style={styles.groupBadge} />}
        </View>

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, chat.isPinned && styles.pinnedChat]}>
              {chat.name || `Chat ${chat.id}`}
            </Text>
            <Text style={styles.timestamp}>
              {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
            </Text>
          </View>
          
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage?.content || 'No messages yet'}
            </Text>
            {chat.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusIndicators}>
          {chat.isMuted && (
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                fill={futuristicTheme.colors.textSecondary}
              />
            </Svg>
          )}
          {chat.isPinned && (
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M14,4V8L16,10V17H13V19.5L12,20.5L11,19.5V17H8V10L10,8V4H14M12,2H12L12,2C11.44,2 11,2.44 11,3V4H9C8.44,4 8,4.44 8,5S8.44,6 9,6V8.5L7.5,10V17C7.5,17.55 7.95,18 8.5,18H11V19.5C11,20.32 11.68,21 12.5,21H11.5C12.32,21 13,20.32 13,19.5V18H15.5C16.05,18 16.5,17.55 16.5,17V10L15,8.5V6C15.56,6 16,5.56 16,5S15.56,4 15,4H13V3C13,2.44 12.56,2 12,2Z"
                fill={futuristicTheme.colors.accent}
              />
            </Svg>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Chats Tab Component
const ChatsTab: React.FC<{ navigation: any; user: ATASUser | null }> = ({ navigation, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(mockChats);

  useEffect(() => {
    if (searchQuery) {
      const filtered = mockChats.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(mockChats);
    }
  }, [searchQuery]);

  const handleChatPress = (chat: ATASChat) => {
    navigation.navigate('Chat', { chat, user });
  };

  const handleChatLongPress = (chat: ATASChat) => {
    Alert.alert(
      'Chat Options',
      `Options for ${chat.name}`,
      [
        { text: chat.isPinned ? 'Unpin' : 'Pin', onPress: () => {} },
        { text: chat.isMuted ? 'Unmute' : 'Mute', onPress: () => {} },
        { text: 'Archive', onPress: () => {} },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleNewChat = () => {
    navigation.navigate('ContactList');
  };

  const handleNewGroup = () => {
    navigation.navigate('GroupCreation');
  };

  return (
    <View style={styles.tabContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <LinearGradient
          colors={gradients.messageGradient}
          style={styles.searchGradient}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.searchIcon}>
            <Path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              fill={futuristicTheme.colors.textSecondary}
            />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor={futuristicTheme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </LinearGradient>
      </View>

      {/* Chats List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem
            chat={item}
            onPress={() => handleChatPress(item)}
            onLongPress={() => handleChatLongPress(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.chatsList}
      />

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleNewGroup}>
          <LinearGradient colors={gradients.buttonGradient} style={styles.fabGradient}>
            <Text style={styles.fabIcon}>👥</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.fab, styles.mainFab]} onPress={handleNewChat}>
          <LinearGradient colors={gradients.buttonGradient} style={styles.fabGradient}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                fill={futuristicTheme.colors.text}
              />
            </Svg>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Calls Tab Component
const CallsTab: React.FC<{ navigation: any }> = ({ navigation }) => {
  const formatCallTime = (call: ATASCall) => {
    if (!call.startTime) return '';
    
    const now = new Date();
    const diff = now.getTime() - call.startTime.getTime();
    
    if (diff < 86400000) { // Less than 24 hours
      return call.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return call.startTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getCallIcon = (call: ATASCall) => {
    const iconColor = call.status === 'missed' ? futuristicTheme.colors.error : futuristicTheme.colors.success;
    
    if (call.type === 'video') {
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path
            d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
            fill={iconColor}
          />
        </Svg>
      );
    } else {
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path
            d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
            fill={iconColor}
          />
        </Svg>
      );
    }
  };

  const CallItem: React.FC<{ call: ATASCall }> = ({ call }) => (
    <TouchableOpacity style={styles.callItem} activeOpacity={0.7}>
      <View style={styles.callAvatar}>
        <LinearGradient colors={gradients.primaryGradient} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {call.initiatorId.includes('USA') ? 'A' : call.initiatorId.includes('GBR') ? 'B' : 'U'}
          </Text>
        </LinearGradient>
      </View>
      
      <View style={styles.callInfo}>
        <Text style={styles.callName}>
          {call.initiatorId.includes('USA') ? 'Alex Chen' : 
           call.initiatorId.includes('GBR') ? 'Sarah Wilson' : 'Unknown'}
        </Text>
        <View style={styles.callDetails}>
          {getCallIcon(call)}
          <Text style={styles.callStatus}>
            {call.status === 'missed' ? 'Missed' : 
             call.status === 'ended' && call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : 
             'Calling...'}
          </Text>
        </View>
      </View>
      
      <View style={styles.callActions}>
        <Text style={styles.callTime}>{formatCallTime(call)}</Text>
        <TouchableOpacity style={styles.callButton}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill={futuristicTheme.colors.primary}
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContainer}>
      <FlatList
        data={mockCalls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CallItem call={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.callsList}
      />
    </View>
  );
};

// Status Tab Component
const StatusTab: React.FC = () => {
  const StatusItem: React.FC<{ title: string; subtitle: string; isOwn?: boolean }> = ({ 
    title, 
    subtitle, 
    isOwn = false 
  }) => (
    <TouchableOpacity style={styles.statusItem} activeOpacity={0.7}>
      <View style={[styles.statusAvatar, isOwn && styles.ownStatusAvatar]}>
        <LinearGradient 
          colors={isOwn ? gradients.successGradient : gradients.primaryGradient} 
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{isOwn ? '+' : title.charAt(0)}</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.statusInfo}>
        <Text style={styles.statusName}>{title}</Text>
        <Text style={styles.statusTime}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContainer}>
      <StatusItem title="My Status" subtitle="Tap to add status update" isOwn />
      <View style={styles.statusDivider} />
      <Text style={styles.statusSectionTitle}>Recent updates</Text>
      <StatusItem title="Alex Chen" subtitle="2 hours ago" />
      <StatusItem title="Sarah Wilson" subtitle="Yesterday" />
    </View>
  );
};

// Main ChatListScreen Component
const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation, user, onAuthStateChange }) => {
  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const TabIcon: React.FC<{ focused: boolean; name: string }> = ({ focused, name }) => {
    const iconColor = focused ? futuristicTheme.colors.primary : futuristicTheme.colors.textSecondary;
    
    switch (name) {
      case 'Chats':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
              fill={iconColor}
            />
          </Svg>
        );
      case 'Calls':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill={iconColor}
            />
          </Svg>
        );
      case 'Status':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill="none" stroke={iconColor} strokeWidth="2" />
            <Path
              d="M8 12l2 2 4-4"
              fill="none"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FuturisticBackground />
      
      {/* Header */}
      <LinearGradient
        colors={gradients.backgroundGradient}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, glowEffects.neonGlow]}>
          ATAS Messenger
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSettings}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
                fill={futuristicTheme.colors.textSecondary}
              />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleProfile}>
            <View style={styles.profileAvatar}>
              <LinearGradient colors={gradients.primaryGradient} style={styles.miniAvatar}>
                <Text style={styles.miniAvatarText}>
                  {user?.displayName?.charAt(0) || 'U'}
                </Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigator */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={route.name} />,
          tabBarStyle: {
            backgroundColor: futuristicTheme.colors.surface,
            borderTopColor: futuristicTheme.colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: futuristicTheme.colors.primary,
          tabBarInactiveTintColor: futuristicTheme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: futuristicTheme.fonts.medium,
            letterSpacing: 1,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Chats">
          {() => <ChatsTab navigation={navigation} user={user} />}
        </Tab.Screen>
        <Tab.Screen name="Status" component={StatusTab} />
        <Tab.Screen name="Calls">
          {() => <CallsTab navigation={navigation} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: futuristicTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: futuristicTheme.spacing.lg,
    paddingVertical: futuristicTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: futuristicTheme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
    letterSpacing: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: futuristicTheme.spacing.md,
    padding: futuristicTheme.spacing.xs,
  },
  profileAvatar: {
    marginLeft: futuristicTheme.spacing.sm,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    paddingHorizontal: futuristicTheme.spacing.lg,
    paddingVertical: futuristicTheme.spacing.md,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: futuristicTheme.borderRadius.lg,
    paddingHorizontal: futuristicTheme.spacing.md,
    paddingVertical: futuristicTheme.spacing.sm,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
  },
  searchIcon: {
    marginRight: futuristicTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: futuristicTheme.colors.text,
    fontFamily: futuristicTheme.fonts.regular,
    fontSize: 16,
  },
  chatsList: {
    paddingBottom: 100,
  },
  chatItem: {
    marginHorizontal: futuristicTheme.spacing.lg,
    marginVertical: futuristicTheme.spacing.xs,
    borderRadius: futuristicTheme.borderRadius.md,
    overflow: 'hidden',
  },
  chatItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: futuristicTheme.spacing.md,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
    borderRadius: futuristicTheme.borderRadius.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: futuristicTheme.spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
  },
  groupBadge: {
    position: 'absolute',
    bottom: -2,
    right: futuristicTheme.spacing.md - 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: futuristicTheme.colors.accent,
    borderWidth: 2,
    borderColor: futuristicTheme.colors.background,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: futuristicTheme.spacing.xs,
  },
  chatName: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    letterSpacing: 0.5,
  },
  pinnedChat: {
    color: futuristicTheme.colors.secondary,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginRight: futuristicTheme.spacing.sm,
  },
  unreadBadge: {
    backgroundColor: futuristicTheme.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: futuristicTheme.spacing.xs,
  },
  unreadText: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: futuristicTheme.spacing.sm,
  },
  fabContainer: {
    position: 'absolute',
    bottom: futuristicTheme.spacing.xl,
    right: futuristicTheme.spacing.lg,
    alignItems: 'flex-end',
  },
  fab: {
    marginBottom: futuristicTheme.spacing.md,
    borderRadius: 28,
    overflow: 'hidden',
    ...futuristicTheme.shadows.large,
  },
  mainFab: {
    width: 56,
    height: 56,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 20,
  },
  callsList: {
    paddingVertical: futuristicTheme.spacing.md,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: futuristicTheme.spacing.lg,
    paddingVertical: futuristicTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: futuristicTheme.colors.border + '20',
  },
  callAvatar: {
    marginRight: futuristicTheme.spacing.md,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    marginBottom: futuristicTheme.spacing.xs,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callStatus: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginLeft: futuristicTheme.spacing.sm,
  },
  callActions: {
    alignItems: 'flex-end',
  },
  callTime: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginBottom: futuristicTheme.spacing.xs,
  },
  callButton: {
    padding: futuristicTheme.spacing.xs,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: futuristicTheme.spacing.lg,
    paddingVertical: futuristicTheme.spacing.md,
  },
  statusAvatar: {
    marginRight: futuristicTheme.spacing.md,
  },
  ownStatusAvatar: {
    position: 'relative',
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    marginBottom: futuristicTheme.spacing.xs,
  },
  statusTime: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
  },
  statusDivider: {
    height: 1,
    backgroundColor: futuristicTheme.colors.border,
    marginVertical: futuristicTheme.spacing.md,
    marginHorizontal: futuristicTheme.spacing.lg,
  },
  statusSectionTitle: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.textSecondary,
    marginHorizontal: futuristicTheme.spacing.lg,
    marginBottom: futuristicTheme.spacing.sm,
    letterSpacing: 1,
  },
});

export default ChatListScreen;