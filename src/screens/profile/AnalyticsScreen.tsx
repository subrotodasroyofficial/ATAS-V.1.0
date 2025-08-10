import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

import { futuristicTheme, gradients, glowEffects } from '@/theme/futuristicTheme';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import { ATASUser } from '@/types';
import { 
  firebaseService, 
  ActivityType, 
  DailyStats, 
  UserActivity 
} from '@/services/firebaseService';

const { width } = Dimensions.get('window');

interface AnalyticsScreenProps {
  navigation: StackNavigationProp<any>;
  user: ATASUser | null;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigation, user }) => {
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load today's stats
      const todayStats = await firebaseService.getDailyStats(user.id);
      setDailyStats(todayStats);

      // Load weekly stats (last 7 days)
      const weekStats: DailyStats[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayStats = await firebaseService.getDailyStats(user.id, dateString);
        if (dayStats) {
          weekStats.push(dayStats);
        }
      }
      setWeeklyStats(weekStats.reverse());

      // Load recent activity
      const activity = await firebaseService.getUserActivityHistory(user.id, 20);
      setRecentActivity(activity);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }> = ({ title, value, subtitle, icon, trend }) => (
    <LinearGradient
      colors={gradients.messageGradient}
      style={styles.statCard}
    >
      <View style={styles.statCardHeader}>
        <View style={styles.statIcon}>{icon}</View>
        <View style={styles.statTrend}>
          {trend === 'up' && (
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M7,14L12,9L17,14H7Z"
                fill={futuristicTheme.colors.success}
              />
            </Svg>
          )}
          {trend === 'down' && (
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M7,10L12,15L17,10H7Z"
                fill={futuristicTheme.colors.error}
              />
            </Svg>
          )}
        </View>
      </View>
      
      <Text style={[styles.statValue, glowEffects.neonGlow]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  );

  const ActivityItem: React.FC<{ activity: UserActivity }> = ({ activity }) => {
    const getActivityIcon = (type: ActivityType) => {
      switch (type) {
        case ActivityType.MESSAGE_SENT:
          return (
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
                fill={futuristicTheme.colors.primary}
              />
            </Svg>
          );
        case ActivityType.CALL_MADE:
          return (
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                fill={futuristicTheme.colors.secondary}
              />
            </Svg>
          );
        case ActivityType.LOGIN:
          return (
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z"
                fill={futuristicTheme.colors.success}
              />
            </Svg>
          );
        case ActivityType.GROUP_CREATED:
          return (
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M16,4C16.88,4 17.67,4.84 17.67,5.84C17.67,6.84 16.88,7.68 16,7.68C15.12,7.68 14.33,6.84 14.33,5.84C14.33,4.84 15.12,4 16,4M16,10.67C18.07,10.67 20.67,11.75 20.67,13.84V15.68H11.33V13.84C11.33,11.75 13.93,10.67 16,10.67M8,4C8.88,4 9.67,4.84 9.67,5.84C9.67,6.84 8.88,7.68 8,7.68C7.12,7.68 6.33,6.84 6.33,5.84C6.33,4.84 7.12,4 8,4M8,10.67C10.07,10.67 12.67,11.75 12.67,13.84V15.68H3.33V13.84C3.33,11.75 5.93,10.67 8,10.67Z"
                fill={futuristicTheme.colors.accent}
              />
            </Svg>
          );
        default:
          return (
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" fill={futuristicTheme.colors.textSecondary} />
            </Svg>
          );
      }
    };

    const getActivityDescription = (activity: UserActivity) => {
      switch (activity.activityType) {
        case ActivityType.MESSAGE_SENT:
          return `Sent a ${activity.metadata?.messageType || 'text'} message`;
        case ActivityType.CALL_MADE:
          return `Made a ${activity.metadata?.callType || 'voice'} call`;
        case ActivityType.LOGIN:
          return 'Signed in';
        case ActivityType.LOGOUT:
          return 'Signed out';
        case ActivityType.GROUP_CREATED:
          return 'Created a group';
        case ActivityType.MEDIA_SHARED:
          return 'Shared media';
        case ActivityType.BIOMETRIC_ENABLED:
          return 'Used biometric authentication';
        default:
          return activity.activityType.replace('_', ' ');
      }
    };

    const formatTimestamp = (timestamp: any) => {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      if (diff < 60000) { // Less than 1 minute
        return 'Just now';
      } else if (diff < 3600000) { // Less than 1 hour
        return `${Math.floor(diff / 60000)}m ago`;
      } else if (diff < 86400000) { // Less than 24 hours
        return `${Math.floor(diff / 3600000)}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          {getActivityIcon(activity.activityType)}
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription}>
            {getActivityDescription(activity)}
          </Text>
          <Text style={styles.activityTime}>
            {formatTimestamp(activity.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const SimpleChart: React.FC<{ data: number[]; height: number }> = ({ data, height }) => {
    const maxValue = Math.max(...data, 1);
    const chartWidth = width - 80;
    const barWidth = chartWidth / data.length - 4;

    return (
      <View style={[styles.chartContainer, { height }]}>
        <Svg width={chartWidth} height={height}>
          {data.map((value, index) => {
            const barHeight = (value / maxValue) * (height - 20);
            const x = index * (barWidth + 4);
            const y = height - barHeight - 10;

            return (
              <Rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={futuristicTheme.colors.primary}
                opacity={0.8}
                rx={2}
              />
            );
          })}
        </Svg>
      </View>
    );
  };

  const PeriodSelector: React.FC = () => (
    <View style={styles.periodSelector}>
      {(['today', 'week', 'month'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <FuturisticBackground />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, glowEffects.neonGlow]}>
            Loading Analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Analytics
        </Text>
        
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PeriodSelector />

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Messages Sent"
              value={dailyStats?.stats.messagesSent || 0}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
                    fill={futuristicTheme.colors.primary}
                  />
                </Svg>
              }
              trend="up"
            />
            
            <StatCard
              title="Calls Made"
              value={dailyStats?.stats.callsMade || 0}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                    fill={futuristicTheme.colors.secondary}
                  />
                </Svg>
              }
            />
            
            <StatCard
              title="Active Time"
              value={`${Math.floor((dailyStats?.stats.activeTime || 0) / 60)}m`}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
                    fill={futuristicTheme.colors.accent}
                  />
                </Svg>
              }
            />
            
            <StatCard
              title="Media Shared"
              value={dailyStats?.stats.mediaShared || 0}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
                    fill={futuristicTheme.colors.warning}
                  />
                </Svg>
              }
            />
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Messages</Text>
          <LinearGradient
            colors={gradients.messageGradient}
            style={styles.chartCard}
          >
            <SimpleChart 
              data={weeklyStats.map(stat => stat.stats.messagesSent)} 
              height={120} 
            />
            <View style={styles.chartLabels}>
              {weeklyStats.map((_, index) => (
                <Text key={index} style={styles.chartLabel}>
                  {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])[index] || ''}
                </Text>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <LinearGradient
            colors={gradients.messageGradient}
            style={styles.activityCard}
          >
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 10).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <Text style={styles.noActivityText}>No recent activity</Text>
            )}
          </LinearGradient>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: futuristicTheme.spacing.lg,
    paddingHorizontal: futuristicTheme.spacing.lg,
  },
  periodButton: {
    paddingHorizontal: futuristicTheme.spacing.lg,
    paddingVertical: futuristicTheme.spacing.sm,
    marginHorizontal: futuristicTheme.spacing.xs,
    borderRadius: futuristicTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
  },
  periodButtonActive: {
    backgroundColor: futuristicTheme.colors.primary + '20',
    borderColor: futuristicTheme.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.textSecondary,
  },
  periodButtonTextActive: {
    color: futuristicTheme.colors.primary,
  },
  section: {
    marginHorizontal: futuristicTheme.spacing.lg,
    marginBottom: futuristicTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.primary,
    marginBottom: futuristicTheme.spacing.md,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - futuristicTheme.spacing.lg * 2 - futuristicTheme.spacing.sm) / 2,
    padding: futuristicTheme.spacing.md,
    borderRadius: futuristicTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
    marginBottom: futuristicTheme.spacing.md,
    alignItems: 'center',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: futuristicTheme.spacing.sm,
  },
  statIcon: {
    padding: futuristicTheme.spacing.xs,
  },
  statTrend: {
    padding: futuristicTheme.spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
    marginBottom: futuristicTheme.spacing.xs,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.textSecondary,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginTop: futuristicTheme.spacing.xs,
  },
  chartCard: {
    borderRadius: futuristicTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
    padding: futuristicTheme.spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: futuristicTheme.spacing.sm,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
  },
  activityCard: {
    borderRadius: futuristicTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
    padding: futuristicTheme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: futuristicTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: futuristicTheme.colors.border + '20',
  },
  activityIcon: {
    marginRight: futuristicTheme.spacing.md,
    padding: futuristicTheme.spacing.xs,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    marginBottom: futuristicTheme.spacing.xs,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
  },
  noActivityText: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: futuristicTheme.spacing.lg,
  },
});

export default AnalyticsScreen;