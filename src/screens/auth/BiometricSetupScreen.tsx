import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { futuristicTheme } from '@/theme/futuristicTheme';

interface BiometricSetupScreenProps {
  navigation: any;
  onAuthStateChange: (authState: any) => void;
}

const BiometricSetupScreen: React.FC<BiometricSetupScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Biometric Setup Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: futuristicTheme.colors.background,
  },
  text: {
    color: futuristicTheme.colors.text,
    fontSize: 18,
    fontFamily: futuristicTheme.fonts.medium,
  },
});

export default BiometricSetupScreen;