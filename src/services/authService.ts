import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import ReactNativeBiometrics from 'react-native-biometrics';
import Keychain from 'react-native-keychain';
import DeviceInfo from 'react-native-device-info';
import auth from '@react-native-firebase/auth';
import { atasCrypto } from '@/crypto/cryptoCore';
import { atasIdService, ATASIDData } from './atasIdService';
import { firebaseService, ActivityType } from './firebaseService';
import { 
  AuthState, 
  LoginCredentials, 
  RegistrationData, 
  ATASUser, 
  ATASDevice,
  APIResponse 
} from '@/types';

const rnBiometrics = new ReactNativeBiometrics();

export interface GoogleUserInfo {
  email: string;
  name: string;
  photo?: string;
  id: string;
}

export interface BiometricSetupData {
  publicKey: string;
  biometricKeyAlias: string;
  biometricType: string;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    device: null,
    accessToken: null,
    refreshToken: null,
    biometricAvailable: false,
    biometricEnabled: false,
  };

  private readonly STORAGE_KEYS = {
    AUTH_STATE: 'ATAS_AUTH_STATE',
    USER_DATA: 'ATAS_USER_DATA',
    DEVICE_DATA: 'ATAS_DEVICE_DATA',
    ENCRYPTED_KEYS: 'ATAS_ENCRYPTED_KEYS',
    BIOMETRIC_SETUP: 'ATAS_BIOMETRIC_SETUP',
  };

  private constructor() {
    this.initializeGoogleSignin();
    this.checkBiometricAvailability();
    this.loadAuthState();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize Google Sign-in configuration
   */
  private async initializeGoogleSignin(): Promise<void> {
    try {
      await GoogleSignin.configure({
        webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // Replace with actual client ID
        offlineAccess: true,
        hostedDomain: '', // Optional
        forceCodeForRefreshToken: true,
      });
    } catch (error) {
      console.error('Google Sign-in initialization failed:', error);
    }
  }

  /**
   * Check if biometric authentication is available
   */
  private async checkBiometricAvailability(): Promise<void> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      this.authState.biometricAvailable = available;
      
      if (available) {
        console.log(`Biometric type available: ${biometryType}`);
      }
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      this.authState.biometricAvailable = false;
    }
  }

  /**
   * Load authentication state from storage
   */
  private async loadAuthState(): Promise<void> {
    try {
      const storedAuthState = await AsyncStorage.getItem(this.STORAGE_KEYS.AUTH_STATE);
      const storedUserData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      const storedDeviceData = await AsyncStorage.getItem(this.STORAGE_KEYS.DEVICE_DATA);

      if (storedAuthState && storedUserData && storedDeviceData) {
        const authState = JSON.parse(storedAuthState);
        const userData = JSON.parse(storedUserData);
        const deviceData = JSON.parse(storedDeviceData);

        this.authState = {
          ...authState,
          user: userData,
          device: deviceData,
        };

        // Load biometric setup status
        const biometricSetup = await AsyncStorage.getItem(this.STORAGE_KEYS.BIOMETRIC_SETUP);
        this.authState.biometricEnabled = !!biometricSetup;
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  /**
   * Register new user with Gmail integration
   * @param registrationData User registration information
   * @returns Registration result
   */
  async registerUser(registrationData: RegistrationData): Promise<APIResponse<ATASUser>> {
    try {
      // Step 1: Authenticate with Google
      const googleUser = await this.signInWithGoogle();
      if (!googleUser) {
        return { success: false, error: 'Google authentication failed' };
      }

      // Step 2: Authenticate with Firebase using Google credentials
      const googleCredential = auth.GoogleAuthProvider.credential(googleUser.idToken);
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);

      // Step 3: Validate Gmail matches registration data
      if (googleUser.email !== registrationData.email) {
        return { 
          success: false, 
          error: 'Gmail does not match provided email address' 
        };
      }

      // Step 4: Generate ATAS ID
      const atasIdData = await atasIdService.generateATASID(
        registrationData.email,
        registrationData.phoneNumber,
        registrationData.countryCode
      );

      // Step 5: Generate cryptographic keys
      const salt = await atasCrypto.generateSalt();
      const masterKey = await atasCrypto.deriveUMK(
        registrationData.password,
        salt,
        registrationData.email
      );
      const signingKeys = await atasCrypto.generateSigningKeyPair();

      // Step 6: Create device record
      const deviceFingerprint = await atasIdService.generateDeviceFingerprint();
      const device: ATASDevice = {
        id: deviceFingerprint,
        name: registrationData.deviceInfo.name,
        type: registrationData.deviceInfo.type as any,
        os: registrationData.deviceInfo.os,
        publicKey: signingKeys.publicKey,
        encryptedPrivateKey: await this.encryptPrivateKey(signingKeys.privateKey, masterKey),
        registeredAt: new Date(),
        lastActive: new Date(),
        isTrusted: true,
      };

      // Step 7: Create user record
      const user: ATASUser = {
        id: atasIdData.id,
        email: registrationData.email,
        phoneNumber: registrationData.phoneNumber,
        displayName: registrationData.displayName,
        profileImage: googleUser.photo,
        publicKey: signingKeys.publicKey,
        deviceId: device.id,
        isOnline: true,
        lastSeen: new Date(),
        biometricEnabled: false,
        recoveryShares: [], // Will be generated later
        firebaseUid: firebaseUserCredential.user.uid,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        encryptedPrivateKey: await this.encryptPrivateKey(signingKeys.privateKey, masterKey),
        devices: [device],
        isEmailVerified: firebaseUserCredential.user.emailVerified,
      };

      // Step 8: Store encrypted data locally
      await this.storeUserData(user, device, masterKey, signingKeys);

      // Step 9: Create user profile in Firestore
      await firebaseService.createUserProfile(user);

      // Step 10: Start user session tracking
      await firebaseService.startUserSession({
        platform: await DeviceInfo.getSystemName(),
        version: await DeviceInfo.getSystemVersion(),
        model: await DeviceInfo.getModel(),
        appVersion: await DeviceInfo.getVersion(),
        deviceId: device.id,
      });

      // Step 11: Initialize crypto keys
      atasCrypto.initializeKeys(masterKey, signingKeys);

      // Step 12: Update auth state
      this.authState = {
        isAuthenticated: true,
        user,
        device,
        accessToken: 'mock_access_token', // In production, get from backend
        refreshToken: 'mock_refresh_token',
        biometricAvailable: this.authState.biometricAvailable,
        biometricEnabled: false,
      };

      await this.saveAuthState();

      console.log('User registered and synced to Firebase:', user.id);
      return { success: true, data: user };
    } catch (error) {
      console.error('User registration failed:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Sign in with Google
   * @returns Google user information
   */
  private async signInWithGoogle(): Promise<GoogleUserInfo | null> {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      return {
        email: userInfo.user.email,
        name: userInfo.user.name || '',
        photo: userInfo.user.photo || undefined,
        id: userInfo.user.id,
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google sign in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else {
        console.error('Google sign in error:', error);
      }
      return null;
    }
  }

  /**
   * Login user with credentials
   * @param credentials Login credentials
   * @returns Login result
   */
  async loginUser(credentials: LoginCredentials): Promise<APIResponse<ATASUser>> {
    try {
      // Step 1: Load user data locally
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (!userData) {
        return { success: false, error: 'User not found' };
      }

      const user: ATASUser = JSON.parse(userData);

      // Step 2: Verify email matches
      if (user.email !== credentials.email) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Step 3: Verify device fingerprint
      const deviceFingerprint = await atasIdService.generateDeviceFingerprint();
      if (deviceFingerprint !== credentials.deviceFingerprint) {
        return { success: false, error: 'Device not recognized' };
      }

      // Step 4: Authenticate based on method
      let authSuccess = false;

      if (credentials.biometricData && this.authState.biometricEnabled) {
        // Biometric authentication
        authSuccess = await this.authenticateWithBiometrics();
        if (authSuccess) {
          await firebaseService.trackActivity(ActivityType.BIOMETRIC_ENABLED);
        }
      } else if (credentials.password) {
        // Password authentication
        authSuccess = await this.verifyPassword(credentials.password, user.email);
      } else {
        return { success: false, error: 'No authentication method provided' };
      }

      if (!authSuccess) {
        return { success: false, error: 'Authentication failed' };
      }

      // Step 5: Authenticate with Firebase (if user has firebaseUid)
      if (user.firebaseUid && credentials.password) {
        try {
          await auth().signInWithEmailAndPassword(user.email, credentials.password);
        } catch (firebaseError) {
          console.log('Firebase auth failed, continuing with local auth');
        }
      }

      // Step 6: Load device data and keys
      await this.loadUserKeys(user.email, credentials.password || '');

      // Step 7: Sync user profile from Firestore
      try {
        const firestoreUser = await firebaseService.getUserProfile(user.id);
        if (firestoreUser) {
          // Merge Firestore data with local data
          Object.assign(user, firestoreUser);
        }
      } catch (error) {
        console.log('Could not sync from Firestore, using local data');
      }

      // Step 8: Start user session tracking
      await firebaseService.startUserSession({
        platform: await DeviceInfo.getSystemName(),
        version: await DeviceInfo.getSystemVersion(),
        model: await DeviceInfo.getModel(),
        appVersion: await DeviceInfo.getVersion(),
        deviceId: deviceFingerprint,
      });

      // Step 9: Update auth state
      const deviceData = await AsyncStorage.getItem(this.STORAGE_KEYS.DEVICE_DATA);
      const device: ATASDevice = deviceData ? JSON.parse(deviceData) : null;

      // Update last login time
      user.lastLoginAt = new Date();

      this.authState = {
        isAuthenticated: true,
        user,
        device,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        biometricAvailable: this.authState.biometricAvailable,
        biometricEnabled: this.authState.biometricEnabled,
      };

      await this.saveAuthState();

      // Step 10: Update user profile in Firestore
      await firebaseService.updateUserProfile(user.id, {
        lastLoginAt: user.lastLoginAt,
        isOnline: true,
      });

      console.log('User logged in and synced with Firebase:', user.id);
      return { success: true, data: user };
    } catch (error) {
      console.error('User login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Setup biometric authentication
   * @returns Setup result
   */
  async setupBiometricAuth(): Promise<APIResponse<BiometricSetupData>> {
    try {
      if (!this.authState.biometricAvailable) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      if (!this.authState.isAuthenticated || !this.authState.user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Generate biometric key pair
      const keyAlias = `ATAS_BIOMETRIC_${this.authState.user.id}`;
      const { publicKey } = await rnBiometrics.createKeys(keyAlias);

      const biometricSetup: BiometricSetupData = {
        publicKey,
        biometricKeyAlias: keyAlias,
        biometricType: 'TouchID/FaceID',
      };

      // Store biometric setup data
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.BIOMETRIC_SETUP,
        JSON.stringify(biometricSetup)
      );

      this.authState.biometricEnabled = true;
      await this.saveAuthState();

      return { success: true, data: biometricSetup };
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return { success: false, error: 'Biometric setup failed' };
    }
  }

  /**
   * Authenticate with biometrics
   * @returns Authentication result
   */
  private async authenticateWithBiometrics(): Promise<boolean> {
    try {
      if (!this.authState.biometricEnabled) {
        return false;
      }

      const biometricSetupData = await AsyncStorage.getItem(this.STORAGE_KEYS.BIOMETRIC_SETUP);
      if (!biometricSetupData) {
        return false;
      }

      const setup: BiometricSetupData = JSON.parse(biometricSetupData);
      
      // Create signature with biometric key
      const payload = `auth_${Date.now()}`;
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: 'Authenticate with ATAS Messenger',
        payload,
        keyAlias: setup.biometricKeyAlias,
      });

      return success && !!signature;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Verify password against stored credentials
   * @param password Password to verify
   * @param email User's email
   * @returns Verification result
   */
  private async verifyPassword(password: string, email: string): Promise<boolean> {
    try {
      const encryptedKeys = await AsyncStorage.getItem(this.STORAGE_KEYS.ENCRYPTED_KEYS);
      if (!encryptedKeys) {
        return false;
      }

      const keyData = JSON.parse(encryptedKeys);
      
      // Derive master key with provided password
      const masterKey = await atasCrypto.deriveUMK(password, keyData.salt, email);
      
      // Try to decrypt test data to verify password
      try {
        await atasCrypto.decrypt(keyData.testData, masterKey);
        return true;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Load user's cryptographic keys
   * @param email User's email
   * @param password User's password
   */
  private async loadUserKeys(email: string, password: string): Promise<void> {
    try {
      const encryptedKeys = await AsyncStorage.getItem(this.STORAGE_KEYS.ENCRYPTED_KEYS);
      if (!encryptedKeys) {
        throw new Error('No encrypted keys found');
      }

      const keyData = JSON.parse(encryptedKeys);
      
      // Derive master key
      const masterKey = await atasCrypto.deriveUMK(password, keyData.salt, email);
      
      // Decrypt private key
      const privateKey = await atasCrypto.decrypt(keyData.encryptedPrivateKey, masterKey);
      
      // Initialize crypto system
      atasCrypto.initializeKeys(masterKey, {
        publicKey: keyData.publicKey,
        privateKey,
      });
    } catch (error) {
      console.error('Failed to load user keys:', error);
      throw new Error('Failed to load encryption keys');
    }
  }

  /**
   * Encrypt private key for storage
   * @param privateKey Private key to encrypt
   * @param masterKey Master key for encryption
   * @returns Encrypted private key
   */
  private async encryptPrivateKey(privateKey: string, masterKey: string): Promise<string> {
    const encryptedData = await atasCrypto.encrypt(privateKey, masterKey);
    return JSON.stringify(encryptedData);
  }

  /**
   * Store user data securely
   * @param user User data
   * @param device Device data
   * @param masterKey Master key
   * @param signingKeys Signing key pair
   */
  private async storeUserData(
    user: ATASUser,
    device: ATASDevice,
    masterKey: string,
    signingKeys: { publicKey: string; privateKey: string }
  ): Promise<void> {
    try {
      // Store user and device data
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.setItem(this.STORAGE_KEYS.DEVICE_DATA, JSON.stringify(device));

      // Store encrypted keys
      const salt = await atasCrypto.generateSalt();
      const encryptedPrivateKey = await atasCrypto.encrypt(signingKeys.privateKey, masterKey);
      const testData = await atasCrypto.encrypt('test_verification_data', masterKey);

      const keyData = {
        publicKey: signingKeys.publicKey,
        encryptedPrivateKey,
        salt,
        testData,
      };

      await AsyncStorage.setItem(this.STORAGE_KEYS.ENCRYPTED_KEYS, JSON.stringify(keyData));

      // Store in secure keychain as backup
      await Keychain.setInternetCredentials(
        'ATAS_BACKUP_KEYS',
        user.id,
        JSON.stringify(keyData)
      );
    } catch (error) {
      console.error('Failed to store user data:', error);
      throw new Error('Failed to store user data securely');
    }
  }

  /**
   * Save authentication state
   */
  private async saveAuthState(): Promise<void> {
    try {
      const stateToSave = {
        isAuthenticated: this.authState.isAuthenticated,
        accessToken: this.authState.accessToken,
        refreshToken: this.authState.refreshToken,
        biometricAvailable: this.authState.biometricAvailable,
        biometricEnabled: this.authState.biometricEnabled,
      };

      await AsyncStorage.setItem(this.STORAGE_KEYS.AUTH_STATE, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  /**
   * Logout user and clear all data
   */
  async logout(): Promise<void> {
    try {
      // End Firebase session tracking
      if (this.authState.user) {
        await firebaseService.updateOnlineStatus(this.authState.user.id, false);
        await firebaseService.endUserSession();
      }

      // Sign out from Firebase Auth
      try {
        await auth().signOut();
      } catch (error) {
        console.log('Firebase signout failed:', error);
      }

      // Clear Google sign-in
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }

      // Clear crypto keys
      atasCrypto.clearKeys();

      // Cleanup Firebase service
      firebaseService.cleanup();

      // Clear auth state
      this.authState = {
        isAuthenticated: false,
        user: null,
        device: null,
        accessToken: null,
        refreshToken: null,
        biometricAvailable: this.authState.biometricAvailable,
        biometricEnabled: false,
      };

      // Clear storage
      await AsyncStorage.removeItem(this.STORAGE_KEYS.AUTH_STATE);
      // Keep user data for potential re-login
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Get current authentication state
   * @returns Current auth state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  /**
   * Get current user
   * @returns Current user or null
   */
  getCurrentUser(): ATASUser | null {
    return this.authState.user;
  }

  /**
   * Get current device
   * @returns Current device or null
   */
  getCurrentDevice(): ATASDevice | null {
    return this.authState.device;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();