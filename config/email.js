const nodemailer = require('nodemailer');

let transporter = null;
let testAccount = null;

// Create ethereal test account on the fly
const createEtherealTransporter = async () => {
  try {
    // Create a test account
    testAccount = await nodemailer.createTestAccount();
    
    console.log('📧 Ethereal Test Account Created:');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
    console.log('   Preview URL: https://ethereal.email/login');
    
    // Create transporter
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Email transporter ready');
    return true;
  } catch (error) {
    console.error('❌ Failed to create ethereal account:', error);
    return false;
  }
};

// Send reset email
const sendResetEmail = async (email, resetToken) => {
  try {
    // Create transporter if not exists
    if (!transporter) {
      await createEtherealTransporter();
    }
    
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"HomeWorth Support" <${testAccount?.user || 'noreply@homeworth.com'}>`,
      to: email,
      subject: 'Password Reset Request - HomeWorth',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
            .warning { color: #dc2626; font-size: 12px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏠 HomeWorth</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your HomeWorth account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            <p class="warning">⚠️ This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            <hr />
            <p>Best regards,<br/>HomeWorth Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} HomeWorth. All rights reserved.</p>
            <p>AI Rent Predictor UAE</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return true;
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
};

module.exports = { sendResetEmail };