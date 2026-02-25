import Stripe from 'stripe';
import { supabaseAdmin } from '../config/supabase';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mycaredaddy.com';

if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured. Payment functionality will be disabled.');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
}) : null;

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monatlich',
    description: 'Alle Premium-Features für einen Monat',
    price: 999, // 9.99 EUR
    currency: 'eur',
    interval: 'month',
    features: [
      'Unbegrenzte Care-Signale',
      'Erweiterte Matching-Optionen',
      'Prioritäts-Support',
      'Erweiterte Privatsphäre-Einstellungen',
      'Detaillierte Statistiken',
      'Keine Werbung'
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly'
  },
  {
    id: 'premium_yearly',
    name: 'Premium Jährlich',
    description: 'Alle Premium-Features für ein Jahr (2 Monate gratis)',
    price: 9999, // 99.99 EUR (instead of 119.88)
    currency: 'eur',
    interval: 'year',
    features: [
      'Unbegrenzte Care-Signale',
      'Erweiterte Matching-Optionen',
      'Prioritäts-Support',
      'Erweiterte Privatsphäre-Einstellungen',
      'Detaillierte Statistiken',
      'Keine Werbung',
      '2 Monate gratis!'
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly'
  }
];

export class PaymentService {
  private static isConfigured(): boolean {
    return !!stripe && !!STRIPE_SECRET_KEY;
  }

  static async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{ sessionId: string; url: string } | null> {
    if (!this.isConfigured()) {
      console.log('💳 Payment skipped - Stripe not configured');
      return null;
    }

    try {
      if (!userId?.trim() || !planId?.trim()) {
        throw new Error('UserId and planId are required');
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // Get user data
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      const session = await stripe!.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ['card', 'sepa_debit'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${FRONTEND_URL}/subscription/cancel`,
        metadata: {
          userId,
          planId,
        },
        subscription_data: {
          metadata: {
            userId,
            planId,
          },
        },
        locale: 'de',
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
      });

      console.log(`💳 Checkout session created for user ${userId}, plan ${planId}`);
      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('❌ Failed to create checkout session:', error);
      return null;
    }
  }

  static async createCustomerPortalSession(userId: string): Promise<{ url: string } | null> {
    if (!this.isConfigured()) {
      console.log('💳 Customer portal skipped - Stripe not configured');
      return null;
    }

    try {
      if (!userId?.trim()) {
        throw new Error('UserId is required');
      }

      // Get user's Stripe customer ID
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('subscription_id')
        .eq('id', userId)
        .single();

      if (!user?.subscription_id) {
        throw new Error('No active subscription found');
      }

      // Get subscription to find customer ID
      const subscription = await stripe!.subscriptions.retrieve(user.subscription_id);
      
      const session = await stripe!.billingPortal.sessions.create({
        customer: subscription.customer as string,
        return_url: `${FRONTEND_URL}/subscription`,
      });

      console.log(`💳 Customer portal session created for user ${userId}`);
      return { url: session.url };
    } catch (error) {
      console.error('❌ Failed to create customer portal session:', error);
      return null;
    }
  }

  static async cancelSubscription(userId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('💳 Subscription cancellation skipped - Stripe not configured');
      return false;
    }

    try {
      if (!userId?.trim()) {
        throw new Error('UserId is required');
      }

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('subscription_id')
        .eq('id', userId)
        .single();

      if (!user?.subscription_id) {
        throw new Error('No active subscription found');
      }

      await stripe!.subscriptions.update(user.subscription_id, {
        cancel_at_period_end: true,
      });

      // Update user status
      await supabaseAdmin
        .from('users')
        .update({ subscription_status: 'canceled' })
        .eq('id', userId);

      console.log(`💳 Subscription canceled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to cancel subscription:', error);
      return false;
    }
  }

  static async handleWebhook(body: string, signature: string): Promise<boolean> {
    if (!this.isConfigured() || !STRIPE_WEBHOOK_SECRET) {
      console.log('💳 Webhook skipped - Stripe not configured');
      return false;
    }

    try {
      const event = stripe!.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);

      console.log(`💳 Processing webhook: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`💳 Unhandled webhook event: ${event.type}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Webhook processing failed:', error);
      return false;
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) {
      console.error('❌ Missing metadata in checkout session');
      return;
    }

    try {
      // Update user subscription status
      await supabaseAdmin
        .from('users')
        .update({
          is_premium: true,
          subscription_id: session.subscription as string,
          subscription_status: 'active',
        })
        .eq('id', userId);

      console.log(`💳 Checkout completed for user ${userId}, plan ${planId}`);
    } catch (error) {
      console.error('❌ Failed to handle checkout completion:', error);
    }
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('❌ Missing userId in subscription metadata');
      return;
    }

    try {
      const isActive = subscription.status === 'active';
      
      await supabaseAdmin
        .from('users')
        .update({
          is_premium: isActive,
          subscription_status: subscription.status,
        })
        .eq('id', userId);

      console.log(`💳 Subscription updated for user ${userId}: ${subscription.status}`);
    } catch (error) {
      console.error('❌ Failed to handle subscription update:', error);
    }
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('❌ Missing userId in subscription metadata');
      return;
    }

    try {
      await supabaseAdmin
        .from('users')
        .update({
          is_premium: false,
          subscription_status: 'canceled',
        })
        .eq('id', userId);

      console.log(`💳 Subscription deleted for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to handle subscription deletion:', error);
    }
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    
    if (!subscriptionId) {
      return;
    }

    try {
      const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;

      if (!userId) {
        return;
      }

      await supabaseAdmin
        .from('users')
        .update({
          is_premium: true,
          subscription_status: 'active',
        })
        .eq('id', userId);

      console.log(`💳 Payment succeeded for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to handle payment success:', error);
    }
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    
    if (!subscriptionId) {
      return;
    }

    try {
      const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;

      if (!userId) {
        return;
      }

      // Mark subscription as past due
      await supabaseAdmin
        .from('users')
        .update({
          subscription_status: 'past_due',
        })
        .eq('id', userId);

      console.log(`💳 Payment failed for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to handle payment failure:', error);
    }
  }

  static async getSubscriptionStatus(userId: string): Promise<{
    isPremium: boolean;
    status?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  } | null> {
    if (!this.isConfigured()) {
      return { isPremium: false };
    }

    try {
      if (!userId?.trim()) {
        throw new Error('UserId is required');
      }

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('is_premium, subscription_id, subscription_status')
        .eq('id', userId)
        .single();

      if (!user) {
        return null;
      }

      if (!user.subscription_id) {
        return { isPremium: user.is_premium };
      }

      const subscription = await stripe!.subscriptions.retrieve(user.subscription_id);

      return {
        isPremium: user.is_premium,
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('❌ Failed to get subscription status:', error);
      return null;
    }
  }
}