import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient,
  Stop,
  Polygon,
} from 'react-native-svg';

import { futuristicTheme, gradients, glowEffects } from '@/theme/futuristicTheme';
import FuturisticBackground from '@/components/ui/FuturisticBackground';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Logo entrance animation
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous loading rotation
    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const renderLogo = () => {
    return (
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Defs>
          <SvgLinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={futuristicTheme.colors.primary} />
            <Stop offset="100%" stopColor={futuristicTheme.colors.secondary} />
          </SvgLinearGradient>
        </Defs>
        
        {/* Outer ring */}
        <Circle
          cx={60}
          cy={60}
          r={55}
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth={3}
          strokeDasharray="10,5"
        />
        
        {/* Inner hexagon */}
        <Polygon
          points="60,20 85,35 85,65 60,80 35,65 35,35"
          fill="none"
          stroke={futuristicTheme.colors.accent}
          strokeWidth={2}
        />
        
        {/* Central A */}
        <Path
          d="M 45 70 L 52 45 L 68 45 L 75 70 M 50 60 L 70 60"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Corner dots */}
        <Circle cx={60} cy={15} r={3} fill={futuristicTheme.colors.primary} />
        <Circle cx={88} cy={30} r={3} fill={futuristicTheme.colors.secondary} />
        <Circle cx={88} cy={90} r={3} fill={futuristicTheme.colors.accent} />
        <Circle cx={32} cy={90} r={3} fill={futuristicTheme.colors.primary} />
        <Circle cx={32} cy={30} r={3} fill={futuristicTheme.colors.secondary} />
      </Svg>
    );
  };

  const renderLoadingIndicator = () => {
    return (
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            transform: [
              {
                rotate: loadingRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width={60} height={60} viewBox="0 0 60 60">
          <Circle
            cx={30}
            cy={30}
            r={25}
            fill="none"
            stroke={futuristicTheme.colors.primary}
            strokeWidth={2}
            strokeDasharray="20,10"
            strokeLinecap="round"
          />
          <Circle
            cx={30}
            cy={30}
            r={18}
            fill="none"
            stroke={futuristicTheme.colors.secondary}
            strokeWidth={2}
            strokeDasharray="15,8"
            strokeLinecap="round"
            transform="rotate(180 30 30)"
          />
        </Svg>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FuturisticBackground />
      
      <LinearGradient
        colors={gradients.backgroundGradient}
        style={styles.overlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { scale: pulseScale },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity: glowOpacity,
              },
            ]}
          >
            {renderLogo()}
          </Animated.View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
            },
          ]}
        >
          <Text style={[styles.title, glowEffects.neonGlow]}>
            ATAS
          </Text>
          <Text style={[styles.subtitle, glowEffects.purpleGlow]}>
            MESSENGER
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <Text style={styles.tagline}>
            Secure • Private • Futuristic
          </Text>
          <Text style={styles.version}>
            Version 1.0.0 • 2025
          </Text>
        </Animated.View>

        {/* Loading Indicator */}
        <View style={styles.loadingSection}>
          {renderLoadingIndicator()}
          <Text style={styles.loadingText}>
            Initializing Quantum Encryption...
          </Text>
        </View>

        {/* Feature Highlights */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>End-to-End Encryption</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Biometric Authentication</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>AI-Powered Features</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom branding */}
      <View style={styles.bottomContainer}>
        <Text style={styles.copyright}>
          © 2025 ATAS Technologies • Next-Gen Messaging
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: futuristicTheme.colors.background,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: futuristicTheme.spacing.xl,
  },
  logoContainer: {
    marginBottom: futuristicTheme.spacing.xl * 2,
    alignItems: 'center',
  },
  logoGlow: {
    padding: futuristicTheme.spacing.lg,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    shadowColor: futuristicTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: futuristicTheme.spacing.xl,
  },
  title: {
    fontSize: 48,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
    letterSpacing: 8,
    marginBottom: futuristicTheme.spacing.sm,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.secondary,
    letterSpacing: 4,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: futuristicTheme.spacing.xl * 2,
  },
  tagline: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    letterSpacing: 2,
    marginBottom: futuristicTheme.spacing.xs,
  },
  version: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.light,
    color: futuristicTheme.colors.primary,
    letterSpacing: 1,
  },
  loadingSection: {
    alignItems: 'center',
    marginBottom: futuristicTheme.spacing.xl * 2,
  },
  loadingContainer: {
    marginBottom: futuristicTheme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.primary,
    letterSpacing: 1,
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: futuristicTheme.spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: futuristicTheme.colors.primary,
    marginRight: futuristicTheme.spacing.sm,
    shadowColor: futuristicTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  featureText: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    letterSpacing: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: futuristicTheme.spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 10,
    fontFamily: futuristicTheme.fonts.light,
    color: futuristicTheme.colors.textSecondary,
    letterSpacing: 1,
    opacity: 0.7,
  },
});

export default SplashScreen;