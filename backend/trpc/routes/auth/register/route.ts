import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  phone: z.string().optional(),
});

// Email domains that are allowed for registration
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'web.de',
  'gmx.de',
  't-online.de',
  'freenet.de'
];

// Function to validate email domain
function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

// Function to generate verification code
function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to send verification email (mock implementation)
async function sendVerificationEmail(email: string, code: string): Promise<void> {
  console.log(`Sending verification code ${code} to ${email}`);
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
}

// Function to send verification SMS (mock implementation)
async function sendVerificationSMS(phone: string, code: string): Promise<void> {
  console.log(`Sending verification code ${code} to ${phone}`);
  // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
}

export default publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }) => {
    const { email, password, name, phone } = input;
    
    // Check if user already exists
    const existingUser = await Database.getUserByEmail(email);
    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account with this email already exists. Please use a different email or try logging in.",
      });
    }
    
    // Check if phone number is already used (if provided)
    if (phone) {
      const existingPhoneUser = await Database.getUserByPhone(phone);
      if (existingPhoneUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this phone number already exists. Please use a different phone number.",
        });
      }
    }
    
    // Validate email domain to ensure it's from a real provider
    if (!isValidEmailDomain(email)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Please use a valid email address from a recognized provider (Gmail, Yahoo, Outlook, etc.)",
      });
    }
    
    // Generate verification codes
    const emailVerificationCode = generateVerificationCode();
    const phoneVerificationCode = phone ? generateVerificationCode() : null;
    
    // Temporarily create user as active for development
    // TODO: Change back to 'pending_verification' after implementing proper email validation
    const user = await Database.createUser({
      email,
      password, // In production, hash this password
      name,
      phone,
      status: 'active', // Temporarily active instead of pending_verification
      emailVerificationCode,
      phoneVerificationCode,
      emailVerified: false, // Keep track for future implementation
      phoneVerified: !phone, // If no phone provided, mark as verified
      verificationCodeExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      provider: 'email',
      zestCoins: 1000, // Starting bonus
    });
    
    console.log(`New user registered: ${email} with ID: ${user.id}`);
    
    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationCode);
      console.log(`Verification email sent to ${email} with code: ${emailVerificationCode}`);
      
      // Send verification SMS if phone provided
      if (phone && phoneVerificationCode) {
        await sendVerificationSMS(phone, phoneVerificationCode);
        console.log(`Verification SMS sent to ${phone} with code: ${phoneVerificationCode}`);
      }
    } catch (error) {
      console.error('Failed to send verification:', error);
      // Don't fail registration if email/SMS sending fails
      console.warn('Continuing with registration despite verification sending failure');
    }
    
    return {
      success: true,
      message: "Account created successfully! You can now log in.",
      userId: user.id,
      requiresEmailVerification: false, // Temporarily disabled
      requiresPhoneVerification: false, // Temporarily disabled
    };
  });