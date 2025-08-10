import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { futuristicTheme, gradients, glowEffects } from '@/theme/futuristicTheme';

interface FuturisticButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const FuturisticButton: React.FC<FuturisticButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled || loading) return;
    onPress(event);
  };

  // Start loading animation
  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [loading, rotateAnim]);

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return gradients.buttonGradient;
      case 'secondary':
        return [futuristicTheme.colors.secondary, futuristicTheme.colors.primary];
      case 'accent':
        return [futuristicTheme.colors.accent, '#FF6B6B'];
      case 'danger':
        return gradients.dangerGradient;
      default:
        return gradients.buttonGradient;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: futuristicTheme.spacing.sm,
          paddingHorizontal: futuristicTheme.spacing.md,
          minHeight: 36,
        };
      case 'medium':
        return {
          paddingVertical: futuristicTheme.spacing.md,
          paddingHorizontal: futuristicTheme.spacing.lg,
          minHeight: 48,
        };
      case 'large':
        return {
          paddingVertical: futuristicTheme.spacing.lg,
          paddingHorizontal: futuristicTheme.spacing.xl,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: futuristicTheme.spacing.md,
          paddingHorizontal: futuristicTheme.spacing.lg,
          minHeight: 48,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const buttonStyles = [
    styles.button,
    getSizeStyles(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    { fontSize: getTextSize() },
    disabled && styles.disabledText,
    variant === 'primary' && glowEffects.neonGlow,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          buttonStyles,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={getVariantColors()}
          style={[styles.gradient, getSizeStyles()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glow effect overlay */}
          <Animated.View
            style={[
              styles.glowOverlay,
              {
                opacity: glowAnim,
              },
            ]}
          />

          {/* Content container */}
          <Animated.View style={styles.content}>
            {loading ? (
              <Animated.View
                style={[
                  styles.loadingContainer,
                  {
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={[textStyles, styles.loadingText]}>⟳</Text>
              </Animated.View>
            ) : (
              <>
                {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
                <Text style={textStyles}>{title}</Text>
              </>
            )}
          </Animated.View>

          {/* Border glow */}
          <Animated.View
            style={[
              styles.borderGlow,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}
          />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: futuristicTheme.borderRadius.md,
    overflow: 'hidden',
    ...futuristicTheme.shadows.medium,
  },
  gradient: {
    borderRadius: futuristicTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  text: {
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  icon: {
    marginRight: futuristicTheme.spacing.sm,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: futuristicTheme.borderRadius.md,
  },
  borderGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: futuristicTheme.borderRadius.md + 2,
    borderWidth: 2,
    borderColor: futuristicTheme.colors.primary,
    zIndex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: futuristicTheme.colors.text,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: futuristicTheme.colors.textSecondary,
  },
});

export default FuturisticButton;