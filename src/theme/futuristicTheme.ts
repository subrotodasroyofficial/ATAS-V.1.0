import { ATASTheme } from '@/types';

export const futuristicTheme: ATASTheme = {
  colors: {
    primary: '#00E5FF', // Bright cyan - AI neon
    secondary: '#7C4DFF', // Purple - quantum computing
    accent: '#FF1744', // Neon red - alerts and actions
    background: '#0A0A0F', // Deep space black
    surface: '#1A1A2E', // Dark matter gray
    text: '#E0E0E0', // Bright white text
    textSecondary: '#9E9E9E', // Muted gray
    border: '#2A2A3E', // Subtle borders
    success: '#00E676', // Matrix green
    warning: '#FFD600', // Caution yellow
    error: '#FF5252', // Alert red
    gradient: {
      start: '#00E5FF',
      end: '#7C4DFF',
    },
  },
  fonts: {
    regular: 'SpaceGrotesk-Regular',
    medium: 'SpaceGrotesk-Medium',
    bold: 'SpaceGrotesk-Bold',
    light: 'SpaceGrotesk-Light',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadows: {
    small: {
      shadowColor: '#00E5FF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#7C4DFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: '#FF1744',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 12,
    },
  },
};

// Additional theme utilities
export const glowEffects = {
  neonGlow: {
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  purpleGlow: {
    textShadowColor: '#7C4DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  redGlow: {
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
};

export const gradients = {
  primaryGradient: ['#00E5FF', '#7C4DFF'],
  backgroundGradient: ['#0A0A0F', '#1A1A2E'],
  messageGradient: ['#2A2A3E', '#3A3A4E'],
  buttonGradient: ['#00E5FF', '#0099CC'],
  dangerGradient: ['#FF5252', '#D32F2F'],
  successGradient: ['#00E676', '#00C853'],
};

export const animations = {
  fadeIn: {
    duration: 300,
    delay: 0,
  },
  slideUp: {
    duration: 400,
    delay: 100,
  },
  bounce: {
    duration: 600,
    delay: 0,
  },
  pulse: {
    duration: 1000,
    delay: 0,
  },
  shimmer: {
    duration: 1500,
    delay: 0,
  },
};

export const particleConfig = {
  count: 50,
  speed: 1,
  colors: ['#00E5FF', '#7C4DFF', '#FF1744'],
  size: { min: 1, max: 3 },
  opacity: { min: 0.3, max: 0.8 },
};

export default futuristicTheme;