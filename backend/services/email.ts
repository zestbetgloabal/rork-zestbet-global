import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import config from '../config/environment';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: config.aws.ses.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId!,
        secretAccessKey: config.aws.secretAccessKey!,
      },
    });
  }

  async sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
      const command = new SendEmailCommand({
        Source: `${config.aws.ses.fromName} <${config.aws.ses.fromEmail}>`,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
            ...(text && {
              Text: {
                Data: text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      });

      const result = await this.sesClient.send(command);
      console.log('Email sent successfully:', result.MessageId);
      
      return {
        success: true,
        messageId: result.MessageId,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, name: string, verificationCode: string) {
    const subject = 'Email-Adresse bestätigen - ZestBet';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email bestätigen</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007AFF;
          }
          .content {
            padding: 30px 0;
          }
          .verification-code {
            background: #f8f9fa;
            border: 2px solid #007AFF;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #007AFF;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #f0f0f0;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #007AFF;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ZestBet</div>
        </div>
        
        <div class="content">
          <h1>Hallo ${name}!</h1>
          
          <p>Willkommen bei ZestBet! Um deine Registrierung abzuschließen, bestätige bitte deine Email-Adresse mit dem folgenden Code:</p>
          
          <div class="verification-code">
            <div class="code">${verificationCode}</div>
          </div>
          
          <p>Gib diesen 4-stelligen Code in der App ein, um deine Email-Adresse zu bestätigen.</p>
          
          <p><strong>Wichtig:</strong> Dieser Code ist nur 15 Minuten gültig.</p>
          
          <p>Falls du dich nicht bei ZestBet registriert hast, kannst du diese Email ignorieren.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 ZestBet. Alle Rechte vorbehalten.</p>
          <p>Diese Email wurde automatisch generiert. Bitte antworte nicht auf diese Email.</p>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      Hallo ${name}!
      
      Willkommen bei ZestBet! Um deine Registrierung abzuschließen, bestätige bitte deine Email-Adresse mit dem folgenden Code:
      
      Verifikationscode: ${verificationCode}
      
      Gib diesen 4-stelligen Code in der App ein, um deine Email-Adresse zu bestätigen.
      
      Wichtig: Dieser Code ist nur 15 Minuten gültig.
      
      Falls du dich nicht bei ZestBet registriert hast, kannst du diese Email ignorieren.
      
      © 2024 ZestBet. Alle Rechte vorbehalten.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    const subject = 'Willkommen bei ZestBet! 🎉';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Willkommen bei ZestBet</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007AFF;
          }
          .content {
            padding: 30px 0;
          }
          .welcome-bonus {
            background: linear-gradient(135deg, #007AFF, #00C7BE);
            color: white;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 20px 0;
          }
          .bonus-amount {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #f0f0f0;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ZestBet</div>
        </div>
        
        <div class="content">
          <h1>Willkommen bei ZestBet, ${name}! 🎉</h1>
          
          <p>Deine Email-Adresse wurde erfolgreich bestätigt! Du bist jetzt Teil der ZestBet Community.</p>
          
          <div class="welcome-bonus">
            <h2>🎁 Willkommensbonus</h2>
            <div class="bonus-amount">1.000 ZEST Coins</div>
            <p>wurden deinem Konto gutgeschrieben!</p>
          </div>
          
          <h3>Was kannst du jetzt tun?</h3>
          <ul>
            <li>🎯 Erstelle deine ersten Wetten</li>
            <li>👥 Lade Freunde ein und erhalte Boni</li>
            <li>🏆 Nimm an Live-Events teil</li>
            <li>💰 Sammle ZEST Coins und tausche sie ein</li>
          </ul>
          
          <p>Viel Spaß beim Wetten und möge das Glück mit dir sein!</p>
          
          <p>Dein ZestBet Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 ZestBet. Alle Rechte vorbehalten.</p>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      Willkommen bei ZestBet, ${name}!
      
      Deine Email-Adresse wurde erfolgreich bestätigt! Du bist jetzt Teil der ZestBet Community.
      
      🎁 Willkommensbonus: 1.000 ZEST Coins wurden deinem Konto gutgeschrieben!
      
      Was kannst du jetzt tun?
      - Erstelle deine ersten Wetten
      - Lade Freunde ein und erhalte Boni
      - Nimm an Live-Events teil
      - Sammle ZEST Coins und tausche sie ein
      
      Viel Spaß beim Wetten und möge das Glück mit dir sein!
      
      Dein ZestBet Team
      
      © 2024 ZestBet. Alle Rechte vorbehalten.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetCode: string) {
    const subject = 'Passwort zurücksetzen - ZestBet';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Passwort zurücksetzen</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007AFF;
          }
          .content {
            padding: 30px 0;
          }
          .reset-code {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #856404;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #f0f0f0;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ZestBet</div>
        </div>
        
        <div class="content">
          <h1>Passwort zurücksetzen</h1>
          
          <p>Hallo ${name},</p>
          
          <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Verwende den folgenden Code:</p>
          
          <div class="reset-code">
            <div class="code">${resetCode}</div>
          </div>
          
          <p>Gib diesen 4-stelligen Code in der App ein, um ein neues Passwort zu erstellen.</p>
          
          <p><strong>Wichtig:</strong> Dieser Code ist nur 15 Minuten gültig.</p>
          
          <p>Falls du diese Anfrage nicht gestellt hast, kannst du diese Email ignorieren. Dein Passwort bleibt unverändert.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 ZestBet. Alle Rechte vorbehalten.</p>
          <p>Diese Email wurde automatisch generiert. Bitte antworte nicht auf diese Email.</p>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      Passwort zurücksetzen
      
      Hallo ${name},
      
      du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Verwende den folgenden Code:
      
      Reset-Code: ${resetCode}
      
      Gib diesen 4-stelligen Code in der App ein, um ein neues Passwort zu erstellen.
      
      Wichtig: Dieser Code ist nur 15 Minuten gültig.
      
      Falls du diese Anfrage nicht gestellt hast, kannst du diese Email ignorieren. Dein Passwort bleibt unverändert.
      
      © 2024 ZestBet. Alle Rechte vorbehalten.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }
}

export default new EmailService();