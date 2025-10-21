import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendOtpMail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

  const mailOptions = {
    from: `"Notes App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Notes App - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f7f8fa; padding: 40px 0; text-align: center;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #365CCE; color: white; padding: 30px 20px;">
            <h1 style="margin: 0; font-size: 20px;">Notes App - Password Reset Request</h1>
            <p style="margin: 10px 0 0; font-size: 16px;">Welcome to <strong>Notes App</strong> — your personal space for ideas, lists, and thoughts!</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px 20px; color: #333;">
            <h2 style="margin-top: 0;">Hello 👋,</h2>
            <p style="font-size: 15px; line-height: 1.6;">
              We’ve received a request to reset your password for your <b>Notes App</b> account. 
              Use the verification code below to proceed:
            </p>

            <!-- OTP Box -->
            <div style="margin: 30px 0;">
              <p style="display: inline-block; background: #e8f0ff; border: 1px solid #365CCE; color: #365CCE; padding: 12px 25px; border-radius: 8px; font-size: 24px; letter-spacing: 6px; font-weight: bold;">
                ${otp}
              </p>
            </div>

            <p style="font-size: 15px; line-height: 1.6;">
              This code is valid for the next <b>10 minutes</b>. If you didn’t request a password reset, please ignore this email.
            </p>

            <p style="font-size: 15px; line-height: 1.6;">
            Once verified, you’ll have full access to your Notes App account — where your thoughts stay safe, organized, and accessible from anywhere.
          </p>
          
            <p style="margin-top: 25px; color: #555; font-size: 14px;">Thank you,<br><b>The Notes App Team 📝</b></p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f0f0f0; color: #666; padding: 15px; font-size: 12px;">
            <p style="margin: 0;">
              Need help? Contact us at 
              <a href="mailto:support@notesapp.com" style="color: #365CCE; text-decoration: none;">support@notesapp.com</a>
            </p>
            <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Notes App. All rights reserved.</p>
          </div>

        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
