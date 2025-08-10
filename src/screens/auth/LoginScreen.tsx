import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

import { futuristicTheme, gradients, glowEffects } from '@/theme/futuristicTheme';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import FuturisticButton from '@/components/ui/FuturisticButton';
import { authService } from '@/services/authService';
import { atasIdService } from '@/services/atasIdService';
import { AuthState } from '@/types';

interface LoginScreenProps {
  navigation: StackNavigationProp<any>;
  onAuthStateChange: (authState: AuthState) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onAuthStateChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // For now, we'll show a mock success
      Alert.alert(
        'Login Demo',
        'This is a demonstration of the ATAS Messenger UI. In the full implementation, this would authenticate with your Gmail and ATAS ID.',
        [
          {
            text: 'Continue to Registration Demo',
            onPress: () => navigation.navigate('Register'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Login Failed', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FuturisticBackground />
      
      <LinearGradient
        colors={gradients.backgroundGradient}
        style={styles.overlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, glowEffects.neonGlow]}>
            Welcome to ATAS
          </Text>
          <Text style={styles.subtitle}>
            Secure Quantum Messaging for the Future
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            Sign In to Your Account
          </Text>
          
          <Text style={styles.infoText}>
            ATAS Messenger uses Gmail authentication combined with your unique ATAS ID for maximum security.
          </Text>

          <View style={styles.buttonContainer}>
            <FuturisticButton
              title="Sign In with Gmail"
              onPress={handleLogin}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              icon={<Text style={styles.googleIcon}>G</Text>}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <FuturisticButton
            title="Create New Account"
            onPress={handleRegister}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>
            Why Choose ATAS?
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                Military-grade XChaCha20-Poly1305 encryption
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                Unique ATAS ID system for perfect anonymity
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                Biometric authentication with recovery options
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Quantum Security • ATAS v1.0.0
        </Text>
      </View>
    </SafeAreaView>
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
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: futuristicTheme.spacing.xl,
    paddingTop: futuristicTheme.spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: futuristicTheme.spacing.xl * 2,
  },
  title: {
    fontSize: 36,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
    letterSpacing: 4,
    marginBottom: futuristicTheme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: futuristicTheme.borderRadius.lg,
    padding: futuristicTheme.spacing.xl,
    marginBottom: futuristicTheme.spacing.xl,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
    ...futuristicTheme.shadows.medium,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.text,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: futuristicTheme.spacing.lg,
  },
  infoText: {
    fontSize: 14,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: futuristicTheme.spacing.xl,
  },
  buttonContainer: {
    marginBottom: futuristicTheme.spacing.lg,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: futuristicTheme.colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: futuristicTheme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: futuristicTheme.colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: futuristicTheme.fonts.regular,
    color: futuristicTheme.colors.textSecondary,
    marginHorizontal: futuristicTheme.spacing.md,
    letterSpacing: 1,
  },
  featuresContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderRadius: futuristicTheme.borderRadius.md,
    padding: futuristicTheme.spacing.lg,
    borderWidth: 1,
    borderColor: futuristicTheme.colors.border,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: futuristicTheme.fonts.medium,
    color: futuristicTheme.colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: futuristicTheme.spacing.md,
  },
  featuresList: {
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
    letterSpacing: 0.5,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: futuristicTheme.spacing.xl,
  },
  footerText: {
    fontSize: 10,
    fontFamily: futuristicTheme.fonts.light,
    color: futuristicTheme.colors.textSecondary,
    letterSpacing: 1,
    opacity: 0.7,
  },
});

export default LoginScreen;