import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MonitoringService } from '../backend/services/monitoring';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Disable monitoring in tests
MonitoringService.initialize({ enabled: false });

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting test suite...');
});

afterAll(async () => {
  console.log('✅ Test suite completed');
});

beforeEach(() => {
  // Reset any mocks or state before each test
  jest.clearAllMocks();
});

// Mock Supabase client
jest.mock('../backend/config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  initializeDatabase: jest.fn().mockResolvedValue(true),
}));

// Mock external services
jest.mock('../backend/services/email', () => ({
  EmailService: {
    sendEmailVerification: jest.fn().mockResolvedValue(true),
    sendPasswordReset: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../backend/services/sms', () => ({
  SMSService: {
    sendVerificationCode: jest.fn().mockResolvedValue({ success: true }),
    verifyCode: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('../backend/services/payment', () => ({
  PaymentService: {
    createCheckoutSession: jest.fn().mockResolvedValue({ sessionId: 'test', url: 'test' }),
    handleWebhook: jest.fn().mockResolvedValue(true),
  },
}));