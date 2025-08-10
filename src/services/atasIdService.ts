import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { atasCrypto } from '@/crypto/cryptoCore';

// Country codes mapping
const COUNTRY_CODES: { [key: string]: string } = {
  'India': 'IND',
  'United States': 'USA',
  'United Kingdom': 'GBR',
  'Canada': 'CAN',
  'Australia': 'AUS',
  'Germany': 'DEU',
  'France': 'FRA',
  'Japan': 'JPN',
  'Singapore': 'SGP',
  'Brazil': 'BRA',
  'Russia': 'RUS',
  'China': 'CHN',
  'South Korea': 'KOR',
  'Netherlands': 'NLD',
  'Sweden': 'SWE',
  'Norway': 'NOR',
  'Denmark': 'DNK',
  'Finland': 'FIN',
  'Switzerland': 'CHE',
  'UAE': 'UAE',
  'Saudi Arabia': 'SAU',
  'South Africa': 'ZAF',
  'Nigeria': 'NGA',
  'Egypt': 'EGY',
  'Mexico': 'MEX',
  'Argentina': 'ARG',
  'Chile': 'CHL',
  'Israel': 'ISR',
  'Turkey': 'TUR',
  'Thailand': 'THA',
  'Indonesia': 'IDN',
  'Malaysia': 'MYS',
  'Philippines': 'PHL',
  'Vietnam': 'VNM',
  'Pakistan': 'PAK',
  'Bangladesh': 'BGD',
  'Sri Lanka': 'LKA',
  'Default': 'INT', // International fallback
};

export interface ATASIDData {
  id: string;
  accessCode: string;
  countryCode: string;
  year: number;
  userNumber: number;
  createdAt: Date;
  email: string;
  phoneNumber: string;
}

export interface ATASIDValidation {
  isValid: boolean;
  reason?: string;
  data?: Partial<ATASIDData>;
}

export class ATASIDService {
  private static instance: ATASIDService;
  private userCounter: number = 0;
  private readonly STORAGE_KEY = 'ATAS_USER_COUNTER';
  private readonly ID_STORAGE_KEY = 'ATAS_USER_ID_DATA';

  private constructor() {
    this.initializeCounter();
  }

  public static getInstance(): ATASIDService {
    if (!ATASIDService.instance) {
      ATASIDService.instance = new ATASIDService();
    }
    return ATASIDService.instance;
  }

  /**
   * Initialize user counter from storage or API
   */
  private async initializeCounter(): Promise<void> {
    try {
      const storedCounter = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedCounter) {
        this.userCounter = parseInt(storedCounter, 10);
      } else {
        // In production, this would fetch from the backend
        this.userCounter = await this.fetchCounterFromAPI();
      }
    } catch (error) {
      console.error('Failed to initialize counter:', error);
      this.userCounter = 1; // Fallback to 1
    }
  }

  /**
   * Fetch current user counter from API (mock implementation)
   */
  private async fetchCounterFromAPI(): Promise<number> {
    // In production, this would make an API call to get the current counter
    // For now, return a default value
    return 1;
  }

  /**
   * Generate ATAS ID in format: ATAS-COUNTRYCODE-YEAR-NUMBER
   * @param email User's email
   * @param phoneNumber User's phone number
   * @param countryName User's country name
   * @returns Complete ATAS ID data with access code
   */
  async generateATASID(
    email: string,
    phoneNumber: string,
    countryName: string = 'Default'
  ): Promise<ATASIDData> {
    try {
      // Get country code
      const countryCode = this.getCountryCode(countryName);
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Increment and get user number
      await this.incrementCounter();
      const userNumber = this.userCounter;
      
      // Format user number with leading zeros (4 digits)
      const formattedUserNumber = userNumber.toString().padStart(4, '0');
      
      // Create ATAS ID
      const atasId = `ATAS-${countryCode}-${currentYear}-${formattedUserNumber}`;
      
      // Generate access code (6-digit random code)
      const accessCode = await this.generateAccessCode();
      
      const atasIdData: ATASIDData = {
        id: atasId,
        accessCode,
        countryCode,
        year: currentYear,
        userNumber,
        createdAt: new Date(),
        email,
        phoneNumber,
      };

      // Store the ID data locally
      await this.storeATASIDData(atasIdData);
      
      return atasIdData;
    } catch (error) {
      console.error('ATAS ID generation failed:', error);
      throw new Error('Failed to generate ATAS ID');
    }
  }

  /**
   * Get country code from country name
   * @param countryName Full country name
   * @returns 3-letter country code
   */
  private getCountryCode(countryName: string): string {
    const normalizedCountry = countryName.trim();
    return COUNTRY_CODES[normalizedCountry] || COUNTRY_CODES['Default'];
  }

  /**
   * Generate secure 6-digit access code
   * @returns 6-digit access code
   */
  private async generateAccessCode(): Promise<string> {
    try {
      // Generate cryptographically secure random number
      const randomBytes = await atasCrypto.generateSalt(3); // 3 bytes = 24 bits
      
      // Convert to number and ensure it's 6 digits
      const randomBuffer = Buffer.from(randomBytes, 'hex');
      const randomNumber = randomBuffer.readUIntBE(0, 3);
      const accessCode = (randomNumber % 900000 + 100000).toString(); // Ensures 6 digits
      
      return accessCode;
    } catch (error) {
      console.error('Access code generation failed:', error);
      // Fallback to timestamp-based code
      return (Date.now() % 900000 + 100000).toString();
    }
  }

  /**
   * Increment user counter and store it
   */
  private async incrementCounter(): Promise<void> {
    try {
      this.userCounter += 1;
      await AsyncStorage.setItem(this.STORAGE_KEY, this.userCounter.toString());
      
      // In production, also update the counter on the backend
      await this.updateCounterOnAPI(this.userCounter);
    } catch (error) {
      console.error('Failed to increment counter:', error);
      throw new Error('Failed to update user counter');
    }
  }

  /**
   * Update counter on API (mock implementation)
   */
  private async updateCounterOnAPI(counter: number): Promise<void> {
    // In production, this would make an API call to update the counter
    // For now, just log it
    console.log(`Updated counter to: ${counter}`);
  }

  /**
   * Store ATAS ID data locally
   * @param atasIdData ATAS ID data to store
   */
  private async storeATASIDData(atasIdData: ATASIDData): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(this.ID_STORAGE_KEY);
      const allIds = existingData ? JSON.parse(existingData) : [];
      
      allIds.push(atasIdData);
      
      await AsyncStorage.setItem(this.ID_STORAGE_KEY, JSON.stringify(allIds));
    } catch (error) {
      console.error('Failed to store ATAS ID data:', error);
    }
  }

  /**
   * Validate ATAS ID format and authenticity
   * @param atasId ATAS ID to validate
   * @returns Validation result
   */
  validateATASID(atasId: string): ATASIDValidation {
    try {
      // Check basic format: ATAS-XXX-YYYY-NNNN
      const regex = /^ATAS-([A-Z]{3})-(\d{4})-(\d{4})$/;
      const match = atasId.match(regex);
      
      if (!match) {
        return {
          isValid: false,
          reason: 'Invalid ATAS ID format. Expected: ATAS-COUNTRYCODE-YEAR-NUMBER',
        };
      }
      
      const [, countryCode, yearStr, userNumberStr] = match;
      const year = parseInt(yearStr, 10);
      const userNumber = parseInt(userNumberStr, 10);
      const currentYear = new Date().getFullYear();
      
      // Validate year (should be between 2025 and current year + 1)
      if (year < 2025 || year > currentYear + 1) {
        return {
          isValid: false,
          reason: `Invalid year: ${year}. ATAS IDs started in 2025.`,
        };
      }
      
      // Validate country code
      const validCountryCodes = Object.values(COUNTRY_CODES);
      if (!validCountryCodes.includes(countryCode)) {
        return {
          isValid: false,
          reason: `Invalid country code: ${countryCode}`,
        };
      }
      
      // Validate user number (should be positive)
      if (userNumber <= 0) {
        return {
          isValid: false,
          reason: `Invalid user number: ${userNumber}`,
        };
      }
      
      return {
        isValid: true,
        data: {
          countryCode,
          year,
          userNumber,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        reason: 'Failed to validate ATAS ID',
      };
    }
  }

  /**
   * Get ATAS ID data by ID
   * @param atasId ATAS ID to lookup
   * @returns ATAS ID data if found
   */
  async getATASIDData(atasId: string): Promise<ATASIDData | null> {
    try {
      const storedData = await AsyncStorage.getItem(this.ID_STORAGE_KEY);
      if (!storedData) return null;
      
      const allIds: ATASIDData[] = JSON.parse(storedData);
      return allIds.find(data => data.id === atasId) || null;
    } catch (error) {
      console.error('Failed to get ATAS ID data:', error);
      return null;
    }
  }

  /**
   * Generate device fingerprint for authentication
   * @returns Unique device fingerprint
   */
  async generateDeviceFingerprint(): Promise<string> {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceName = await DeviceInfo.getDeviceName();
      const systemVersion = DeviceInfo.getSystemVersion();
      const appVersion = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();
      
      const deviceInfo = {
        deviceId,
        deviceName,
        systemVersion,
        appVersion,
        buildNumber,
        timestamp: Date.now(),
      };
      
      const deviceString = JSON.stringify(deviceInfo);
      const fingerprint = await atasCrypto.secureHash(deviceString);
      
      return fingerprint;
    } catch (error) {
      console.error('Device fingerprint generation failed:', error);
      throw new Error('Failed to generate device fingerprint');
    }
  }

  /**
   * Check if ATAS ID is available (not already registered)
   * @param atasId ATAS ID to check
   * @returns True if available
   */
  async isATASIDAvailable(atasId: string): Promise<boolean> {
    // In production, this would check with the backend
    const localData = await this.getATASIDData(atasId);
    return localData === null;
  }

  /**
   * Get all registered ATAS IDs (for debugging/admin)
   * @returns Array of all ATAS ID data
   */
  async getAllATASIDs(): Promise<ATASIDData[]> {
    try {
      const storedData = await AsyncStorage.getItem(this.ID_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Failed to get all ATAS IDs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const atasIdService = ATASIDService.getInstance();