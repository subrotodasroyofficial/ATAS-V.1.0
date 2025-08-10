import { NativeModules } from 'react-native';
import CryptoJS from 'react-native-crypto-js';
import { EncryptedData, CryptoKeys, KeyExchange } from '@/types';

// Import native crypto modules
const { RNSodium } = NativeModules;
const { RNArgon2 } = NativeModules;

export class ATASCrypto {
  private static instance: ATASCrypto;
  private keys: CryptoKeys | null = null;

  private constructor() {}

  public static getInstance(): ATASCrypto {
    if (!ATASCrypto.instance) {
      ATASCrypto.instance = new ATASCrypto();
    }
    return ATASCrypto.instance;
  }

  /**
   * Derive User Master Key (UMK) using Argon2id
   * @param password User's password
   * @param salt Unique salt for the user
   * @param email User's email for additional entropy
   * @returns Master key for user
   */
  async deriveUMK(password: string, salt: string, email: string): Promise<string> {
    try {
      const combinedInput = `${password}|${email}|${Date.now()}`;
      
      // Argon2id parameters for high security
      const argon2Config = {
        password: combinedInput,
        salt: salt,
        time: 3, // iterations
        mem: 65536, // 64MB memory
        hashLen: 32, // 256-bit output
        parallelism: 4,
        type: 2, // Argon2id
      };

      const masterKey = await RNArgon2.argon2(argon2Config);
      return masterKey;
    } catch (error) {
      console.error('UMK derivation failed:', error);
      throw new Error('Failed to derive master key');
    }
  }

  /**
   * Generate Ed25519 key pair for signing
   * @returns Public and private key pair
   */
  async generateSigningKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      const keyPair = await RNSodium.crypto_sign_keypair();
      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
      };
    } catch (error) {
      console.error('Key pair generation failed:', error);
      throw new Error('Failed to generate signing key pair');
    }
  }

  /**
   * Generate symmetric key for chat encryption
   * @returns 256-bit symmetric key
   */
  async generateChatKey(): Promise<string> {
    try {
      const key = await RNSodium.randombytes_buf(32); // 256-bit key
      return key;
    } catch (error) {
      console.error('Chat key generation failed:', error);
      throw new Error('Failed to generate chat key');
    }
  }

  /**
   * Encrypt data using XChaCha20-Poly1305
   * @param plaintext Data to encrypt
   * @param key Encryption key
   * @param additionalData Optional additional authenticated data
   * @returns Encrypted data with nonce and tag
   */
  async encrypt(plaintext: string, key: string, additionalData?: string): Promise<EncryptedData> {
    try {
      // Generate random nonce for XChaCha20
      const nonce = await RNSodium.randombytes_buf(24); // 192-bit nonce for XChaCha20
      
      const encryptionResult = await RNSodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        plaintext,
        additionalData || '',
        null, // nsec (not used)
        nonce,
        key
      );

      return {
        ciphertext: encryptionResult.ciphertext,
        nonce: nonce,
        tag: encryptionResult.tag,
        algorithm: 'XChaCha20-Poly1305',
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using XChaCha20-Poly1305
   * @param encryptedData Encrypted data object
   * @param key Decryption key
   * @param additionalData Optional additional authenticated data
   * @returns Decrypted plaintext
   */
  async decrypt(encryptedData: EncryptedData, key: string, additionalData?: string): Promise<string> {
    try {
      const plaintext = await RNSodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null, // nsec (not used)
        encryptedData.ciphertext + encryptedData.tag,
        additionalData || '',
        encryptedData.nonce,
        key
      );

      return plaintext;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Sign data using Ed25519
   * @param data Data to sign
   * @param privateKey Ed25519 private key
   * @returns Signature
   */
  async signData(data: string, privateKey: string): Promise<string> {
    try {
      const signature = await RNSodium.crypto_sign_detached(data, privateKey);
      return signature;
    } catch (error) {
      console.error('Signing failed:', error);
      throw new Error('Failed to sign data');
    }
  }

  /**
   * Verify signature using Ed25519
   * @param signature Signature to verify
   * @param data Original data
   * @param publicKey Ed25519 public key
   * @returns True if signature is valid
   */
  async verifySignature(signature: string, data: string, publicKey: string): Promise<boolean> {
    try {
      const isValid = await RNSodium.crypto_sign_verify_detached(signature, data, publicKey);
      return isValid;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Generate shared secret using X25519 key exchange
   * @param ourPrivateKey Our X25519 private key
   * @param theirPublicKey Their X25519 public key
   * @returns Shared secret
   */
  async generateSharedSecret(ourPrivateKey: string, theirPublicKey: string): Promise<string> {
    try {
      const sharedSecret = await RNSodium.crypto_scalarmult(ourPrivateKey, theirPublicKey);
      return sharedSecret;
    } catch (error) {
      console.error('Shared secret generation failed:', error);
      throw new Error('Failed to generate shared secret');
    }
  }

  /**
   * Generate random salt
   * @param length Salt length in bytes
   * @returns Random salt
   */
  async generateSalt(length: number = 32): Promise<string> {
    try {
      const salt = await RNSodium.randombytes_buf(length);
      return salt;
    } catch (error) {
      console.error('Salt generation failed:', error);
      throw new Error('Failed to generate salt');
    }
  }

  /**
   * Secure hash using BLAKE2b
   * @param data Data to hash
   * @param key Optional key for keyed hashing
   * @returns Hash digest
   */
  async secureHash(data: string, key?: string): Promise<string> {
    try {
      const hash = await RNSodium.crypto_generichash(32, data, key);
      return hash;
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Initialize user's crypto keys
   * @param masterKey User's master key
   * @param signingKeys User's signing key pair
   */
  initializeKeys(masterKey: string, signingKeys: { publicKey: string; privateKey: string }): void {
    this.keys = {
      masterKey,
      publicKey: signingKeys.publicKey,
      privateKey: signingKeys.privateKey,
      chatKeys: new Map(),
    };
  }

  /**
   * Add chat key to user's key store
   * @param chatId Chat identifier
   * @param chatKey Symmetric key for the chat
   */
  addChatKey(chatId: string, chatKey: string): void {
    if (!this.keys) {
      throw new Error('User keys not initialized');
    }
    this.keys.chatKeys.set(chatId, chatKey);
  }

  /**
   * Get chat key from user's key store
   * @param chatId Chat identifier
   * @returns Chat key or null if not found
   */
  getChatKey(chatId: string): string | null {
    if (!this.keys) {
      return null;
    }
    return this.keys.chatKeys.get(chatId) || null;
  }

  /**
   * Clear all user keys from memory
   */
  clearKeys(): void {
    if (this.keys) {
      this.keys.chatKeys.clear();
    }
    this.keys = null;
  }

  /**
   * Get user's public key
   * @returns Public key or null if not initialized
   */
  getPublicKey(): string | null {
    return this.keys?.publicKey || null;
  }

  /**
   * Get user's private key
   * @returns Private key or null if not initialized
   */
  getPrivateKey(): string | null {
    return this.keys?.privateKey || null;
  }
}

// Export singleton instance
export const atasCrypto = ATASCrypto.getInstance();