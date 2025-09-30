import * as sgMail from '@sendgrid/mail';

import jwt from 'jsonwebtoken';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mycaredaddy.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mycaredaddy.com';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Configure email providers
if (!SENDGRID_API_KEY) {
  console.warn('⚠️ SENDGRID_API_KEY not configured. Email functionality will use mock mode.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Mock email function for development
const mockSendEmail = async (msg: any): Promise<void> => {
  console.log('📧 Mock email sent:');
  console.log(`  To: ${msg.to}`);
  console.log(`  Subject: ${msg.subject}`);
  console.log(`  Content: ${msg.text?.substring(0, 100)}...`);
  return Promise.resolve();
};

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return !!SENDGRID_API_KEY;
  }

  private static generateVerificationToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  private static generatePasswordResetToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  static verifyToken(token: string): { userId: string; email: string; type: string } {
    try {
      if (!token?.trim()) {
        throw new Error('Token is required');
      }
      return jwt.verify(token.trim(), JWT_SECRET) as { userId: string; email: string; type: string };
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  private static getEmailVerificationTemplate(verificationUrl: string, firstName?: string): EmailTemplate {
    const name = firstName ? ` ${firstName}` : '';
    
    return {
      subject: 'Bestätige deine E-Mail-Adresse - MyCaredaddy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>E-Mail bestätigen</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff; }
            .logo { font-size: 24px; font-weight: bold; color: #007bff; }
            .content { padding: 30px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MyCaredaddy</div>
            </div>
            <div class="content">
              <h2>Hallo${name}!</h2>
              <p>Willkommen bei MyCaredaddy! Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.</p>
              <p>Klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen:</p>
              <a href="${verificationUrl}" class="button">E-Mail bestätigen</a>
              <p>Oder kopiere diesen Link in deinen Browser:</p>
              <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
              <p><strong>Dieser Link ist 24 Stunden gültig.</strong></p>
              <p>Falls du dich nicht bei MyCaredaddy registriert hast, ignoriere diese E-Mail.</p>
            </div>
            <div class="footer">
              <p>© 2024 MyCaredaddy. Alle Rechte vorbehalten.</p>
              <p>Diese E-Mail wurde automatisch generiert. Bitte antworte nicht auf diese E-Mail.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hallo${name}!
        
        Willkommen bei MyCaredaddy! Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.
        
        Besuche diesen Link, um deine E-Mail-Adresse zu bestätigen:
        ${verificationUrl}
        
        Dieser Link ist 24 Stunden gültig.
        
        Falls du dich nicht bei MyCaredaddy registriert hast, ignoriere diese E-Mail.
        
        © 2024 MyCaredaddy. Alle Rechte vorbehalten.
      `
    };
  }

  private static getPasswordResetTemplate(resetUrl: string, firstName?: string): EmailTemplate {
    const name = firstName ? ` ${firstName}` : '';
    
    return {
      subject: 'Passwort zurücksetzen - MyCaredaddy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Passwort zurücksetzen</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff; }
            .logo { font-size: 24px; font-weight: bold; color: #007bff; }
            .content { padding: 30px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MyCaredaddy</div>
            </div>
            <div class="content">
              <h2>Hallo${name}!</h2>
              <p>Du hast eine Passwort-Zurücksetzung für dein MyCaredaddy-Konto angefordert.</p>
              <p>Klicke auf den Button unten, um ein neues Passwort zu erstellen:</p>
              <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
              <p>Oder kopiere diesen Link in deinen Browser:</p>
              <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
              <p><strong>Dieser Link ist 1 Stunde gültig.</strong></p>
              <p>Falls du keine Passwort-Zurücksetzung angefordert hast, ignoriere diese E-Mail. Dein Passwort bleibt unverändert.</p>
            </div>
            <div class="footer">
              <p>© 2024 MyCaredaddy. Alle Rechte vorbehalten.</p>
              <p>Diese E-Mail wurde automatisch generiert. Bitte antworte nicht auf diese E-Mail.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hallo${name}!
        
        Du hast eine Passwort-Zurücksetzung für dein MyCaredaddy-Konto angefordert.
        
        Besuche diesen Link, um ein neues Passwort zu erstellen:
        ${resetUrl}
        
        Dieser Link ist 1 Stunde gültig.
        
        Falls du keine Passwort-Zurücksetzung angefordert hast, ignoriere diese E-Mail. Dein Passwort bleibt unverändert.
        
        © 2024 MyCaredaddy. Alle Rechte vorbehalten.
      `
    };
  }

  private static getWelcomeTemplate(firstName?: string): EmailTemplate {
    const name = firstName ? ` ${firstName}` : '';
    
    return {
      subject: 'Willkommen bei MyCaredaddy! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Willkommen bei MyCaredaddy</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff; }
            .logo { font-size: 24px; font-weight: bold; color: #007bff; }
            .content { padding: 30px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .feature { padding: 15px; margin: 10px 0; background: #f8f9fa; border-radius: 5px; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MyCaredaddy</div>
            </div>
            <div class="content">
              <h2>Willkommen${name}! 🎉</h2>
              <p>Schön, dass du Teil der MyCaredaddy-Community geworden bist!</p>
              
              <h3>Was du jetzt tun kannst:</h3>
              
              <div class="feature">
                <h4>👤 Profil vervollständigen</h4>
                <p>Füge ein Foto hinzu und erzähle etwas über dich, um bessere Matches zu finden.</p>
              </div>
              
              <div class="feature">
                <h4>🚨 Care-Signale senden</h4>
                <p>Teile mit, wenn du Hilfe brauchst - unsere Community ist für dich da.</p>
              </div>
              
              <div class="feature">
                <h4>🤝 Anderen helfen</h4>
                <p>Reagiere auf Care-Signale in deiner Nähe und baue echte Verbindungen auf.</p>
              </div>
              
              <a href="${FRONTEND_URL}/profile" class="button">Profil vervollständigen</a>
              
              <p>Bei Fragen sind wir jederzeit für dich da. Schreib uns einfach!</p>
            </div>
            <div class="footer">
              <p>© 2024 MyCaredaddy. Alle Rechte vorbehalten.</p>
              <p>Du erhältst diese E-Mail, weil du dich bei MyCaredaddy registriert hast.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Willkommen${name}! 🎉
        
        Schön, dass du Teil der MyCaredaddy-Community geworden bist!
        
        Was du jetzt tun kannst:
        
        👤 Profil vervollständigen
        Füge ein Foto hinzu und erzähle etwas über dich, um bessere Matches zu finden.
        
        🚨 Care-Signale senden
        Teile mit, wenn du Hilfe brauchst - unsere Community ist für dich da.
        
        🤝 Anderen helfen
        Reagiere auf Care-Signale in deiner Nähe und baue echte Verbindungen auf.
        
        Vervollständige dein Profil: ${FRONTEND_URL}/profile
        
        Bei Fragen sind wir jederzeit für dich da. Schreib uns einfach!
        
        © 2024 MyCaredaddy. Alle Rechte vorbehalten.
      `
    };
  }

  static async sendEmailVerification(
    email: string, 
    userId: string, 
    firstName?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('📧 Email verification skipped - SendGrid not configured');
      return true; // Return true in development to not block the flow
    }

    try {
      if (!email?.trim() || !userId?.trim()) {
        throw new Error('Email and userId are required');
      }

      const token = this.generateVerificationToken(userId, email);
      const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
      const template = this.getEmailVerificationTemplate(verificationUrl, firstName);

      const msg = {
        to: email.trim(),
        from: FROM_EMAIL,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      if (this.isConfigured()) {
        await sgMail.send(msg);
      } else {
        await mockSendEmail(msg);
      }
      console.log(`📧 Email verification sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email verification:', error);
      return false;
    }
  }

  static async sendPasswordReset(
    email: string, 
    userId: string, 
    firstName?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('📧 Password reset email skipped - SendGrid not configured');
      return true;
    }

    try {
      if (!email?.trim() || !userId?.trim()) {
        throw new Error('Email and userId are required');
      }

      const token = this.generatePasswordResetToken(userId, email);
      const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
      const template = this.getPasswordResetTemplate(resetUrl, firstName);

      const msg = {
        to: email.trim(),
        from: FROM_EMAIL,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      if (this.isConfigured()) {
        await sgMail.send(msg);
      } else {
        await mockSendEmail(msg);
      }
      console.log(`📧 Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('📧 Welcome email skipped - SendGrid not configured');
      return true;
    }

    try {
      if (!email?.trim()) {
        throw new Error('Email is required');
      }

      const template = this.getWelcomeTemplate(firstName);

      const msg = {
        to: email.trim(),
        from: FROM_EMAIL,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      if (this.isConfigured()) {
        await sgMail.send(msg);
      } else {
        await mockSendEmail(msg);
      }
      console.log(`📧 Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  static async sendCareSignalNotification(
    email: string,
    signalTitle: string,
    signalCategory: string,
    location?: string,
    firstName?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('📧 Care signal notification skipped - SendGrid not configured');
      return true;
    }

    try {
      if (!email?.trim() || !signalTitle?.trim()) {
        throw new Error('Email and signal title are required');
      }

      const name = firstName ? ` ${firstName}` : '';
      const locationText = location ? ` in ${location}` : '';

      const msg = {
        to: email.trim(),
        from: FROM_EMAIL,
        subject: `Neues Care-Signal: ${signalTitle}`,
        html: `
          <h2>Hallo${name}!</h2>
          <p>Ein neues Care-Signal wurde in deiner Nähe gesendet:</p>
          <h3>${signalTitle}</h3>
          <p><strong>Kategorie:</strong> ${signalCategory}</p>
          ${location ? `<p><strong>Ort:</strong> ${location}</p>` : ''}
          <p>Öffne die App, um zu helfen!</p>
          <a href="${FRONTEND_URL}/care-signals" style="display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Care-Signale ansehen</a>
        `,
        text: `
          Hallo${name}!
          
          Ein neues Care-Signal wurde${locationText} gesendet:
          
          ${signalTitle}
          Kategorie: ${signalCategory}
          ${location ? `Ort: ${location}` : ''}
          
          Öffne die App, um zu helfen: ${FRONTEND_URL}/care-signals
        `,
      };

      if (this.isConfigured()) {
        await sgMail.send(msg);
      } else {
        await mockSendEmail(msg);
      }
      console.log(`📧 Care signal notification sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send care signal notification:', error);
      return false;
    }
  }
}