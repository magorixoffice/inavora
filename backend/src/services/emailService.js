const { Resend } = require('resend');
const Logger = require('../utils/logger');

let resendClient = null;

/**
 * Initialize Resend client
 */
const initializeResend = () => {
  if (!process.env.RESEND_API_KEY) {
    Logger.warn('RESEND_API_KEY not configured. Email service will be disabled.');
    console.warn('⚠️  RESEND_API_KEY not found in environment variables');
    return null;
  }

  // Validate API key format (should start with 're_')
  if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    Logger.error('Invalid RESEND_API_KEY format. API key should start with "re_"');
    console.error('❌ Invalid RESEND_API_KEY format. Should start with "re_"');
    return null;
  }

  if (!resendClient) {
    try {
      resendClient = new Resend(process.env.RESEND_API_KEY);
      // Email service initialized silently
    } catch (error) {
      Logger.error('Failed to initialize Resend client', error);
      console.error('❌ Failed to initialize Resend:', error);
      return null;
    }
  }

  return resendClient;
};

/**
 * Get Resend client instance
 */
const getResendClient = () => {
  if (!resendClient) {
    return initializeResend();
  }
  return resendClient;
};

/**
 * Send password reset OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordResetOTPEmail = async (to, otp, userName = null) => {
  console.log('📧 sendPasswordResetOTPEmail called');
  console.log('📧 To:', to);
  console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('📧 RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
  
  const client = getResendClient();
  
  if (!client) {
    console.error('❌ Resend client is null!');
    throw new Error('Email service is not configured. Please set RESEND_API_KEY in environment variables.');
  }
  
  console.log('📧 Resend client obtained:', !!client);

  const appName = process.env.APP_NAME || 'Inavora';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@inavora.com';

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        h1 {
          color: #1e293b;
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        .content {
          color: #64748b;
          font-size: 16px;
          margin-bottom: 30px;
        }
        .reset-button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .token-info {
          background-color: #f1f5f9;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .token-info p {
          margin: 5px 0;
          font-size: 14px;
          color: #475569;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning p {
          margin: 5px 0;
          font-size: 14px;
          color: #92400e;
        }
        .link-fallback {
          word-break: break-all;
          color: #3b82f6;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${appName}</div>
          <h1>Reset Your Password</h1>
        </div>
        
        <div class="content">
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          
          <p>We received a request to reset your password for your ${appName} account. Use the OTP code below to verify your identity:</p>
        </div>

        <div class="token-info">
          <p><strong>Your OTP Code:</strong></p>
          <p style="font-size: 24px; font-weight: bold; color: #1e293b; text-align: center; letter-spacing: 4px;">${otp}</p>
          <p style="text-align: center; margin-top: 10px;">Enter this code on the password reset page to continue.</p>
        </div>

        <div class="warning">
          <p><strong>⚠️ Important:</strong></p>
          <p>This OTP will expire in <strong>10 minutes</strong> for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p><strong>Never share this OTP with anyone.</strong></p>
        </div>

        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Reset Your Password - ${appName}

Hello${userName ? ` ${userName}` : ''},

We received a request to reset your password for your ${appName} account.

Your OTP Code: ${otp}

Enter this code on the password reset page to continue.

This OTP will expire in 10 minutes for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Never share this OTP with anyone.

This is an automated message. Please do not reply to this email.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;

  try {
    Logger.info(`Attempting to send password reset email to ${to}`, {
      from: fromEmail,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 5) + '...' : 'none'
    });

    console.log('📧 Sending email via Resend API...');
    console.log('📧 From:', fromEmail);
    console.log('📧 To:', to);
    console.log('📧 Client initialized:', !!client);

    const emailData = {
      from: fromEmail,
      to: [to],
      subject: `Your ${appName} Password Reset OTP`,
      html: emailHtml,
      text: emailText
    };

    console.log('📧 Email payload prepared, calling Resend API...');
    
    const result = await client.emails.send(emailData);

    console.log('📧 Resend API Response:', JSON.stringify(result, null, 2));

    // Check for Resend API errors
    if (result && result.error) {
      const errorMessage = result.error.message || 'Unknown Resend API error';
      const statusCode = result.error.statusCode || 'unknown';
      console.error('❌ Resend API Error:', errorMessage);
      console.error('❌ Status Code:', statusCode);
      throw new Error(`Resend API Error (${statusCode}): ${errorMessage}`);
    }

    if (!result || !result.data || !result.data.id) {
      console.error('❌ Resend API returned invalid response:', result);
      throw new Error('Resend API returned invalid response - no email ID in response.data');
    }

    const emailId = result.data.id;
    Logger.info(`Password reset email sent successfully to ${to}`, { 
      emailId: emailId,
      from: fromEmail,
      subject: `Reset Your ${appName} Password`
    });
    console.log(`✅ Email sent successfully! ID: ${emailId}`);
    console.log(`📧 Check Resend dashboard: https://resend.com/emails`);
    return result.data;
  } catch (error) {
    console.error('❌ Resend API Error Details:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    console.error('Full error:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    }

    Logger.error('Failed to send password reset email', {
      error: error.message,
      errorCode: error.code,
      errorName: error.name,
      errorResponse: error.response?.data || null,
      errorStatus: error.response?.status || null,
      to: to,
      from: fromEmail
    });
    
    throw error;
  }
};

/**
 * Send password reset success confirmation email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name (optional)
 * @param {string} ipAddress - IP address where password was reset
 * @param {Date} resetTime - Time when password was reset
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordResetSuccessEmail = async (to, userName = null, ipAddress = null, resetTime = new Date()) => {
  const client = getResendClient();
  
  if (!client) {
    // Don't throw error for success email, just log
    Logger.warn('Email service not configured. Skipping password reset success email.');
    return null;
  }

  const appName = process.env.APP_NAME || 'Inavora';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@inavora.com';

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 10px;
        }
        h1 {
          color: #1e293b;
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        .content {
          color: #64748b;
          font-size: 16px;
          margin-bottom: 30px;
        }
        .success-box {
          background-color: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .success-box p {
          margin: 5px 0;
          font-size: 14px;
          color: #065f46;
        }
        .info-box {
          background-color: #f1f5f9;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-box p {
          margin: 5px 0;
          font-size: 14px;
          color: #475569;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning p {
          margin: 5px 0;
          font-size: 14px;
          color: #92400e;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✓ Password Reset Successful</div>
          <h1>Your Password Has Been Changed</h1>
        </div>
        
        <div class="content">
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          
          <div class="success-box">
            <p><strong>✓ Success!</strong></p>
            <p>Your password has been successfully reset.</p>
          </div>

          <div class="info-box">
            <p><strong>Reset Details:</strong></p>
            <p>Time: ${resetTime.toLocaleString()}</p>
            ${ipAddress ? `<p>IP Address: ${ipAddress}</p>` : ''}
          </div>

          <p>If you did not make this change, please contact our support team immediately.</p>
        </div>

        <div class="warning">
          <p><strong>⚠️ Security Tip:</strong></p>
          <p>If you didn't reset your password, someone may have unauthorized access to your account. Please change your password again and review your account security settings.</p>
        </div>

        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Password Reset Successful - ${appName}

Hello${userName ? ` ${userName}` : ''},

Your password has been successfully reset.

Reset Details:
Time: ${resetTime.toLocaleString()}
${ipAddress ? `IP Address: ${ipAddress}` : ''}

If you did not make this change, please contact our support team immediately.

This is an automated message. Please do not reply to this email.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Your ${appName} Password Has Been Reset`,
      html: emailHtml,
      text: emailText
    });

    Logger.info(`Password reset success email sent to ${to}`, { emailId: result.id });
    return result;
  } catch (error) {
    Logger.error('Failed to send password reset success email', error);
    // Don't throw error for success email
    return null;
  }
};

// Initialize on module load
// Note: This will be called when the module is first loaded
// Make sure environment variables are loaded before this
if (process.env.RESEND_API_KEY) {
  initializeResend();
} else {
  console.warn('⚠️  RESEND_API_KEY not found. Email service will not be available.');
}

module.exports = {
  sendPasswordResetOTPEmail,
  sendPasswordResetSuccessEmail,
  initializeResend,
  getResendClient
};

