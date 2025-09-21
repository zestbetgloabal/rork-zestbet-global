import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
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
        message: "Account with this email already exists",
      });
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
    
    // Create user with pending status
    const user = await Database.createUser({
      email,
      password, // In production, hash this password
      name,
      phone,
      status: 'pending_verification',
      emailVerificationCode,
      phoneVerificationCode,
      emailVerified: false,
      phoneVerified: !phone, // If no phone provided, mark as verified
      verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationCode);
      
      // Send verification SMS if phone provided
      if (phone && phoneVerificationCode) {
        await sendVerificationSMS(phone, phoneVerificationCode);
      }
    } catch (error) {
      console.error('Failed to send verification:', error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send verification code. Please try again.",
      });
    }
    
    return {
      success: true,
      message: phone 
        ? "Account created! Please check your email and phone for verification codes."
        : "Account created! Please check your email for verification code.",
      userId: user.id,
      requiresEmailVerification: true,
      requiresPhoneVerification: !!phone,
    };
  });