import twilio from 'twilio';
import NodeCache from 'node-cache';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.warn('⚠️ Twilio credentials not configured. SMS functionality will be disabled.');
}

const client = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) 
  : null;

// Cache for verification codes (TTL: 10 minutes)
const verificationCache = new NodeCache({ stdTTL: 600 });

// Rate limiting cache (TTL: 1 hour)
const rateLimitCache = new NodeCache({ stdTTL: 3600 });

export interface SMSVerificationResult {
  success: boolean;
  message: string;
  rateLimited?: boolean;
}

export class SMSService {
  private static isConfigured(): boolean {
    return !!client && !!TWILIO_PHONE_NUMBER;
  }

  private static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let normalized = phone.replace(/\D/g, '');
    
    // Add country code if missing (assume Germany +49)
    if (normalized.startsWith('0')) {
      normalized = '49' + normalized.substring(1);
    } else if (!normalized.startsWith('49') && normalized.length <= 11) {
      normalized = '49' + normalized;
    }
    
    return '+' + normalized;
  }

  private static isValidGermanPhoneNumber(phone: string): boolean {
    const normalized = phone.replace(/\D/g, '');
    
    // German mobile numbers: +49 1xx xxxxxxx (11-12 digits total)
    // German landline: +49 xxx xxxxxxx (10-12 digits total)
    if (normalized.startsWith('49')) {
      return normalized.length >= 11 && normalized.length <= 13;
    }
    
    // Without country code: 0xxx xxxxxxx
    if (normalized.startsWith('0')) {
      return normalized.length >= 10 && normalized.length <= 12;
    }
    
    return false;
  }

  private static checkRateLimit(phone: string): boolean {
    const key = `sms_rate_${phone}`;
    const attempts = rateLimitCache.get<number>(key) || 0;
    
    // Max 3 SMS per hour per phone number
    if (attempts >= 3) {
      return false;
    }
    
    rateLimitCache.set(key, attempts + 1);
    return true;
  }

  static async sendVerificationCode(phone: string, userId?: string): Promise<SMSVerificationResult> {
    if (!this.isConfigured()) {
      console.log('📱 SMS verification skipped - Twilio not configured');
      return { success: true, message: 'SMS service not configured (development mode)' };
    }

    try {
      if (!phone?.trim()) {
        return { success: false, message: 'Telefonnummer ist erforderlich' };
      }

      const trimmedPhone = phone.trim();
      
      if (!this.isValidGermanPhoneNumber(trimmedPhone)) {
        return { success: false, message: 'Ungültige deutsche Telefonnummer' };
      }

      const normalizedPhone = this.normalizePhoneNumber(trimmedPhone);

      // Check rate limiting
      if (!this.checkRateLimit(normalizedPhone)) {
        return { 
          success: false, 
          message: 'Zu viele Versuche. Bitte warte eine Stunde.', 
          rateLimited: true 
        };
      }

      const code = this.generateVerificationCode();
      const cacheKey = `verification_${normalizedPhone}`;
      
      // Store verification code with metadata
      verificationCache.set(cacheKey, {
        code,
        userId,
        phone: normalizedPhone,
        attempts: 0,
        createdAt: new Date().toISOString(),
      });

      const message = `Dein MyCaredaddy Verifizierungscode: ${code}\n\nDieser Code ist 10 Minuten gültig.\n\nFalls du diese SMS nicht angefordert hast, ignoriere sie.`;

      await client!.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: normalizedPhone,
      });

      console.log(`📱 SMS verification code sent to ${normalizedPhone}`);
      return { success: true, message: 'Verifizierungscode wurde gesendet' };
    } catch (error) {
      console.error('❌ Failed to send SMS verification:', error);
      
      // Handle specific Twilio errors
      if (error instanceof Error) {
        if (error.message.includes('unverified')) {
          return { success: false, message: 'Telefonnummer nicht verifiziert (Twilio Trial)' };
        }
        if (error.message.includes('invalid')) {
          return { success: false, message: 'Ungültige Telefonnummer' };
        }
      }
      
      return { success: false, message: 'Fehler beim Senden der SMS' };
    }
  }

  static async verifyCode(phone: string, code: string): Promise<SMSVerificationResult & { userId?: string }> {
    if (!this.isConfigured()) {
      console.log('📱 SMS verification skipped - Twilio not configured');
      return { success: true, message: 'SMS service not configured (development mode)' };
    }

    try {
      if (!phone?.trim() || !code?.trim()) {
        return { success: false, message: 'Telefonnummer und Code sind erforderlich' };
      }

      const normalizedPhone = this.normalizePhoneNumber(phone.trim());
      const cacheKey = `verification_${normalizedPhone}`;
      
      const verificationData = verificationCache.get<{
        code: string;
        userId?: string;
        phone: string;
        attempts: number;
        createdAt: string;
      }>(cacheKey);

      if (!verificationData) {
        return { success: false, message: 'Kein gültiger Verifizierungscode gefunden oder abgelaufen' };
      }

      // Check attempts (max 3 attempts)
      if (verificationData.attempts >= 3) {
        verificationCache.del(cacheKey);
        return { success: false, message: 'Zu viele Fehlversuche. Fordere einen neuen Code an.' };
      }

      // Verify code
      if (verificationData.code !== code.trim()) {
        verificationData.attempts += 1;
        verificationCache.set(cacheKey, verificationData);
        
        const remainingAttempts = 3 - verificationData.attempts;
        return { 
          success: false, 
          message: `Falscher Code. Noch ${remainingAttempts} Versuche übrig.` 
        };
      }

      // Success - remove from cache
      verificationCache.del(cacheKey);
      
      console.log(`📱 SMS verification successful for ${normalizedPhone}`);
      return { 
        success: true, 
        message: 'Telefonnummer erfolgreich verifiziert',
        userId: verificationData.userId 
      };
    } catch (error) {
      console.error('❌ Failed to verify SMS code:', error);
      return { success: false, message: 'Fehler bei der Verifizierung' };
    }
  }

  static async sendCareSignalAlert(
    phone: string, 
    signalTitle: string, 
    location?: string
  ): Promise<SMSVerificationResult> {
    if (!this.isConfigured()) {
      console.log('📱 Care signal SMS skipped - Twilio not configured');
      return { success: true, message: 'SMS service not configured' };
    }

    try {
      if (!phone?.trim() || !signalTitle?.trim()) {
        return { success: false, message: 'Telefonnummer und Titel sind erforderlich' };
      }

      const normalizedPhone = this.normalizePhoneNumber(phone.trim());
      const locationText = location ? ` in ${location}` : '';

      const message = `🚨 Neues Care-Signal${locationText}:\n\n"${signalTitle}"\n\nÖffne die MyCaredaddy App, um zu helfen!`;

      await client!.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: normalizedPhone,
      });

      console.log(`📱 Care signal SMS sent to ${normalizedPhone}`);
      return { success: true, message: 'Care-Signal SMS gesendet' };
    } catch (error) {
      console.error('❌ Failed to send care signal SMS:', error);
      return { success: false, message: 'Fehler beim Senden der SMS' };
    }
  }

  static async sendEmergencyAlert(
    phone: string, 
    message: string, 
    location?: string
  ): Promise<SMSVerificationResult> {
    if (!this.isConfigured()) {
      console.log('📱 Emergency SMS skipped - Twilio not configured');
      return { success: true, message: 'SMS service not configured' };
    }

    try {
      if (!phone?.trim() || !message?.trim()) {
        return { success: false, message: 'Telefonnummer und Nachricht sind erforderlich' };
      }

      const normalizedPhone = this.normalizePhoneNumber(phone.trim());
      const locationText = location ? `\nOrt: ${location}` : '';

      const smsMessage = `🚨 NOTFALL - MyCaredaddy\n\n${message}${locationText}\n\nDies ist eine automatische Nachricht.`;

      await client!.messages.create({
        body: smsMessage,
        from: TWILIO_PHONE_NUMBER,
        to: normalizedPhone,
      });

      console.log(`📱 Emergency SMS sent to ${normalizedPhone}`);
      return { success: true, message: 'Notfall-SMS gesendet' };
    } catch (error) {
      console.error('❌ Failed to send emergency SMS:', error);
      return { success: false, message: 'Fehler beim Senden der Notfall-SMS' };
    }
  }

  static getVerificationStatus(phone: string): {
    hasActiveCode: boolean;
    attemptsRemaining: number;
    expiresAt?: string;
  } {
    if (!phone?.trim()) {
      return { hasActiveCode: false, attemptsRemaining: 0 };
    }

    const normalizedPhone = this.normalizePhoneNumber(phone.trim());
    const cacheKey = `verification_${normalizedPhone}`;
    
    const verificationData = verificationCache.get<{
      code: string;
      attempts: number;
      createdAt: string;
    }>(cacheKey);

    if (!verificationData) {
      return { hasActiveCode: false, attemptsRemaining: 0 };
    }

    const attemptsRemaining = Math.max(0, 3 - verificationData.attempts);
    const expiresAt = new Date(
      new Date(verificationData.createdAt).getTime() + 10 * 60 * 1000
    ).toISOString();

    return {
      hasActiveCode: true,
      attemptsRemaining,
      expiresAt,
    };
  }

  static clearVerificationCode(phone: string): boolean {
    if (!phone?.trim()) {
      return false;
    }

    const normalizedPhone = this.normalizePhoneNumber(phone.trim());
    const cacheKey = `verification_${normalizedPhone}`;
    
    return verificationCache.del(cacheKey) > 0;
  }
}