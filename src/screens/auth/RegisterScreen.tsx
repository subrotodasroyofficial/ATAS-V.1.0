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
import { AuthState } from '@/types';

interface RegisterScreenProps {
  navigation: StackNavigationProp<any>;
  onAuthStateChange: (authState: AuthState) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, onAuthStateChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // Demo registration with ATAS ID generation
      const mockAtasId = `ATAS-IND-2025-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
      const mockAccessCode = Math.floor(Math.random() * 900000 + 100000).toString();
      
      Alert.alert(
        'Registration Demo',
        `Your ATAS ID has been generated!\n\nATAS ID: ${mockAtasId}\nAccess Code: ${mockAccessCode}\n\nThis demonstrates the unique ID system. In the full app, this would be securely stored and synced with your Gmail.`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
        <View style={styles.header}>
          <Text style={[styles.title, glowEffects.neonGlow]}>
            Create ATAS Account
          </Text>
          <Text style={styles.subtitle}>
            Get your unique ATAS ID and join the future of messaging
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            ATAS ID Generation
          </Text>
          
          <Text style={styles.infoText}>
            Your ATAS ID will be in the format: ATAS-COUNTRYCODE-YEAR-NUMBER
            {'\n\n'}
            Example: ATAS-IND-2025-0001
            {'\n\n'}
            This ensures complete privacy and uniqueness across the ATAS network.
          </Text>

          <FuturisticButton
            title="Generate My ATAS ID"
            onPress={handleRegister}
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <FuturisticButton
            title="Back to Login"
            onPress={handleBack}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>
            Your ATAS ID Benefits
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                Globally unique identifier
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                No personal info exposure
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                Cross-platform compatibility
              </Text>
            </View>
          </View>
        </View>
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
    fontSize: 32,
    fontFamily: futuristicTheme.fonts.bold,
    color: futuristicTheme.colors.text,
    letterSpacing: 3,
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
    color: futuristicTheme.colors.secondary,
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
    backgroundColor: futuristicTheme.colors.secondary,
    marginRight: futuristicTheme.spacing.sm,
    shadowColor: futuristicTheme.colors.secondary,
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
});

export default RegisterScreen;