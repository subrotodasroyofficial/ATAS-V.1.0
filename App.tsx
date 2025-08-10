import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

// Import services
import { authService } from '@/services/authService';

// Import theme
import { futuristicTheme, gradients } from '@/theme/futuristicTheme';

// Import screens (we'll create these)
import SplashScreen from '@/screens/SplashScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import BiometricSetupScreen from '@/screens/auth/BiometricSetupScreen';
import ChatListScreen from '@/screens/chat/ChatListScreen';
import ChatScreen from '@/screens/chat/ChatScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

// Import components
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

// Import types
import { AuthState } from '@/types';

const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    device: null,
    accessToken: null,
    refreshToken: null,
    biometricAvailable: false,
    biometricEnabled: false,
  });

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initializeApp = async () => {
    try {
      // Load authentication state
      const currentAuthState = authService.getAuthState();
      setAuthState(currentAuthState);

      // Simulate loading time for splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('App initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthStateChange = (newAuthState: AuthState) => {
    setAuthState(newAuthState);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={futuristicTheme.colors.background}
        translucent
      />
      
      <FuturisticBackground />
      
      <Animated.View
        style={[
          styles.mainContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: 'transparent' },
              cardOverlayEnabled: true,
              cardStyleInterpolator: ({ current, next, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                };
              },
            }}
          >
            {!authState.isAuthenticated ? (
              // Authentication Stack
              <>
                <Stack.Screen 
                  name="Login" 
                  options={{ animationEnabled: true }}
                >
                  {(props) => (
                    <LoginScreen 
                      {...props} 
                      onAuthStateChange={handleAuthStateChange}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen 
                  name="Register"
                  options={{ animationEnabled: true }}
                >
                  {(props) => (
                    <RegisterScreen 
                      {...props} 
                      onAuthStateChange={handleAuthStateChange}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen 
                  name="BiometricSetup"
                  options={{ animationEnabled: true }}
                >
                  {(props) => (
                    <BiometricSetupScreen 
                      {...props} 
                      onAuthStateChange={handleAuthStateChange}
                    />
                  )}
                </Stack.Screen>
              </>
            ) : (
              // Main App Stack
              <>
                <Stack.Screen 
                  name="ChatList"
                  options={{ animationEnabled: true }}
                >
                  {(props) => (
                    <ChatListScreen 
                      {...props} 
                      user={authState.user}
                      onAuthStateChange={handleAuthStateChange}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen 
                  name="Chat"
                  options={{ 
                    animationEnabled: true,
                    gestureEnabled: true,
                  }}
                >
                  {(props) => (
                    <ChatScreen 
                      {...props} 
                      user={authState.user}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen 
                  name="Profile"
                  options={{ 
                    animationEnabled: true,
                    presentation: 'modal',
                  }}
                >
                  {(props) => (
                    <ProfileScreen 
                      {...props} 
                      user={authState.user}
                      onAuthStateChange={handleAuthStateChange}
                    />
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: futuristicTheme.colors.background,
  },
  mainContainer: {
    flex: 1,
  },
});

export default App;