import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

import { futuristicTheme, gradients, glowEffects } from '@/theme/futuristicTheme';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import FuturisticButton from '@/components/ui/FuturisticButton';
import { ATASUser, AuthState } from '@/types';
import { authService } from '@/services/authService';

interface ProfileScreenProps {
  navigation: StackNavigationProp<any>;
  user: ATASUser | null;
  onAuthStateChange: (authState: AuthState) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, user, onAuthStateChange }) => {
  const [biometricEnabled, setBiometricEnabled] = useState(user?.biometricEnabled || false);
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here.');
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await authService.setupBiometricAuth();
      if (result.success) {
        setBiometricEnabled(true);
        Alert.alert('Success', 'Biometric authentication has been enabled.');
      } else {
        Alert.alert('Error', result.error || 'Failed to enable biometric authentication');
      }
    } else {
      setBiometricEnabled(false);
      Alert.alert('Disabled', 'Biometric authentication has been disabled.');
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality would be implemented here.');
  };

  const handleBackupKeys = () => {
    Alert.alert(
      'Backup Encryption Keys',
      'This will create a secure backup of your encryption keys using Shamir Secret Sharing.'
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality would be implemented here.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your ATAS account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await authService.logout();
            onAuthStateChange(authService.getAuthState());
          },
        },
      ]
    );
  };

  const copyATASID = () => {
    Alert.alert('Copied', `ATAS ID ${user?.id} copied to clipboard`);
  };

  const ProfileSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <LinearGradient
        colors={gradients.messageGradient}
        style={styles.sectionContent}
      >
        {children}
      </LinearGradient>
    </View>
  );

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightElement, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showArrow && !rightElement && (
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
              fill={futuristicTheme.colors.textSecondary}
            />
          </Svg>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FuturisticBackground />
      
      {/* Header */}
      <LinearGradient
        colors={gradients.backgroundGradient}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              fill={futuristicTheme.colors.text}
            />
          </Svg>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, glowEffects.neonGlow]}>
          Profile
        </Text>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
              fill={futuristicTheme.colors.textSecondary}
            />
          </Svg>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info */}
        <ProfileSection title="Account Information">
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={gradients.primaryGradient} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0) || 'U'}
                </Text>
              </LinearGradient>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              <TouchableOpacity style={styles.atasIdContainer} onPress={copyATASID}>
                <Text style={styles.atasIdLabel}>ATAS ID</Text>
                <Text style={[styles.atasId, glowEffects.neonGlow]}>
                  {user?.id || 'ATAS-IND-2025-0001'}
                </Text>
                <Svg width={16} height={16} viewBox="0 0 24 24">
                  <Path
                    d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                    fill={futuristicTheme.colors.primary}
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        </ProfileSection>

        {/* Security Settings */}
        <ProfileSection title="Security & Privacy">
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M17.81,4.47C17.73,4.47 17.65,4.45 17.58,4.41L15.54,3.37C15.22,3.21 14.78,3.21 14.46,3.37L12.42,4.41C12.21,4.54 11.95,4.54 11.74,4.41L9.7,3.37C9.38,3.21 8.94,3.21 8.62,3.37L6.58,4.41C6.5,4.45 6.42,4.47 6.34,4.47C6.26,4.47 6.18,4.45 6.11,4.41L4.07,3.37C3.75,3.21 3.31,3.21 2.99,3.37L0.95,4.41C0.43,4.67 0.25,5.3 0.51,5.82C0.77,6.34 1.4,6.52 1.92,6.26L3.96,5.22L6,6.26C6.32,6.42 6.76,6.42 7.08,6.26L9.12,5.22L11.16,6.26C11.48,6.42 11.92,6.42 12.24,6.26L14.28,5.22L16.32,6.26C16.64,6.42 17.08,6.42 17.4,6.26L19.44,5.22L21.48,6.26C22,6.52 22.63,6.34 22.89,5.82C23.15,5.3 22.97,4.67 22.45,4.41L20.41,3.37C20.09,3.21 19.65,3.21 19.33,3.37L17.29,4.41C17.22,4.45 17.14,4.47 17.06,4.47H17.81M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"
                  fill={futuristicTheme.colors.primary}
                />
              </Svg>
            }
            title="Biometric Authentication"
            subtitle={biometricEnabled ? 'Enabled' : 'Disabled'}
            rightElement={
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{
                  false: futuristicTheme.colors.border,
                  true: futuristicTheme.colors.primary + '80',
                }}
                thumbColor={
                  biometricEnabled
                    ? futuristicTheme.colors.primary
                    : futuristicTheme.colors.textSecondary
                }
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
                  fill={futuristicTheme.colors.secondary}
                />
              </Svg>
            }
            title="Change Password"
            subtitle="Update your account password"
            onPress={handleChangePassword}
          />
          
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.3C16,16.9 15.4,17.5 14.8,17.5H9.2C8.6,17.5 8,16.9 8,16.3V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"
                  fill={futuristicTheme.colors.accent}
                />
              </Svg>
            }
            title="Backup Keys"
            subtitle="Secure your encryption keys"
            onPress={handleBackupKeys}
          />
        </ProfileSection>

        {/* Privacy Settings */}
        <ProfileSection title="Privacy Controls">
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M10,21H14A2,2 0 0,0 16,19V7A2,2 0 0,0 14,5H10A2,2 0 0,0 8,7V19A2,2 0 0,0 10,21M12,18A1,1 0 0,1 11,17A1,1 0 0,1 12,16A1,1 0 0,1 13,17A1,1 0 0,1 12,18M12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8Z"
                  fill={futuristicTheme.colors.warning}
                />
              </Svg>
            }
            title="Notifications"
            subtitle={notifications ? 'Enabled' : 'Disabled'}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: futuristicTheme.colors.border,
                  true: futuristicTheme.colors.primary + '80',
                }}
                thumbColor={
                  notifications
                    ? futuristicTheme.colors.primary
                    : futuristicTheme.colors.textSecondary
                }
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                  fill={futuristicTheme.colors.success}
                />
              </Svg>
            }
            title="Read Receipts"
            subtitle={readReceipts ? 'Show when messages are read' : 'Hidden'}
            rightElement={
              <Switch
                value={readReceipts}
                onValueChange={setReadReceipts}
                trackColor={{
                  false: futuristicTheme.colors.border,
                  true: futuristicTheme.colors.primary + '80',
                }}
                thumbColor={
                  readReceipts
                    ? futuristicTheme.colors.primary
                    : futuristicTheme.colors.textSecondary
                }
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
                  fill={futuristicTheme.colors.primary}
                />
              </Svg>
            }
            title="Last Seen"
            subtitle={lastSeen ? 'Visible to contacts' : 'Hidden'}
            rightElement={
              <Switch
                value={lastSeen}
                onValueChange={setLastSeen}
                trackColor={{
                  false: futuristicTheme.colors.border,
                  true: futuristicTheme.colors.primary + '80',
                }}
                thumbColor={
                  lastSeen
                    ? futuristicTheme.colors.primary
                    : futuristicTheme.colors.textSecondary
                }
              />
            }
            showArrow={false}
          />
        </ProfileSection>

        {/* Data & Storage */}
        <ProfileSection title="Data & Storage">
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                  fill={futuristicTheme.colors.secondary}
                />
              </Svg>
            }
            title="Export Data"
            subtitle="Download your ATAS data"
            onPress={handleExportData}
          />
          
          <SettingItem
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
                  fill={futuristicTheme.colors.accent}
                />
              </Svg>
            }
            title="Storage Usage"
            subtitle="Manage app storage"
            onPress={() => Alert.alert('Storage', 'Storage management coming soon')}
          />
        </ProfileSection>

        {/* Actions */}
        <View style={styles.actions}>
          <FuturisticButton
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            size="large"
            fullWidth
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
                  fill={futuristicTheme.colors.text}
                />
              </Svg>
            }
          />
          
          <FuturisticButton
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
            size="large"
            fullWidth
            style={styles.deleteButton}
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                  fill={futuristicTheme.colors.text}
                />
              </Svg>
            }
          />
        </View>
      </ScrollView>
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
  backButton: {
    padding: futuristicTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
    letterSpacing: 2,
  },
  editButton: {
    padding: futuristicTheme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: futuristicTheme.spacing.lg,
    paddingBottom: futuristicTheme.spacing.xl * 2,
  },
  section: {
    marginHorizontal: futuristicTheme.spacing.lg,
    marginBottom: futuristicTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.primary,
    letterSpacing: 1,
    marginBottom: futuristicTheme.spacing.sm,
  },
  sectionContent: {
    borderRadius: futuristicTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
    overflow: 'hidden',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: futuristicTheme.spacing.lg,
  },
  avatarContainer: {
    marginRight: futuristicTheme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...futuristicTheme.shadows.medium,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
    letterSpacing: 1,
    marginBottom: futuristicTheme.spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginBottom: futuristicTheme.spacing.md,
  },
  atasIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: futuristicTheme.colors.surface + '40',
    borderRadius: futuristicTheme.borderRadius.md,
    padding: futuristicTheme.spacing.sm,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.primary + '40',
  },
  atasIdLabel: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.textSecondary,
    marginRight: futuristicTheme.spacing.sm,
  },
  atasId: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.primary,
    letterSpacing: 1,
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: futuristicTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: futuristicTheme.colors.border + '40',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: futuristicTheme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    marginBottom: futuristicTheme.spacing.xs,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    paddingHorizontal: futuristicTheme.spacing.lg,
    gap: futuristicTheme.spacing.md,
  },
  deleteButton: {
    marginTop: futuristicTheme.spacing.lg,
  },
});

export default ProfileScreen;