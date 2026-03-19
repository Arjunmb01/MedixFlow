import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST?.trim(),
  port: Number(process.env.SMTP_PORT?.trim()) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS?.trim(),
  },
})

import { IEmailService } from "../../core/interfaces/IEmailService";

class EmailService implements IEmailService {
  async sendOtpEmail(to: string, otp: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM?.trim() || `"MedixFlow" <${process.env.SMTP_USER?.trim()}>`,
      to,
      subject: "Your MedixFlow Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color:#0066cc;padding:28px 40px;text-align:center;">
                        <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:1px;">M</span>
                        <span style="color:#ffffff;font-size:20px;font-weight:600;margin-left:6px;">MedixFlow</span>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 20px;">
                        <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Verify your email address</h2>
                        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                          Thanks for signing up with MedixFlow. Use the verification code below to complete your registration.
                        </p>
                        <!-- OTP Box -->
                        <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
                          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
                          <p style="margin:0;font-size:40px;font-weight:bold;color:#0066cc;letter-spacing:12px;">${otp}</p>
                        </div>
                        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                          This code expires in <strong>2 minutes</strong>. Do not share it with anyone.
                        </p>
                        <p style="margin:0;font-size:13px;color:#6b7280;">
                          If you didn't request this code, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px 32px;border-top:1px solid #f3f4f6;margin-top:16px;">
                        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                          &copy; 2026 MedixFlow. Your health, managed better.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[EmailService] OTP email sent to ${to}`)
  }

  async sendSetPasswordEmail(to: string, token: string, doctorName: string) {

    const link = `${process.env.FRONTEND_URL}/setup-password?token=${token}`

    const mailOptions = {
      from: process.env.SMTP_FROM?.trim() || `"MedixFlow" <${process.env.SMTP_USER?.trim()}>`,
      to,
      subject: "Set your MedixFlow password",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                
                <tr>
                  <td style="background:#0066cc;padding:24px;text-align:center;color:#fff;font-size:22px;font-weight:bold;">
                    MedixFlow
                  </td>
                </tr>

                <tr>
                  <td style="padding:40px">
                    <h2 style="margin-top:0">Welcome Dr. ${doctorName}</h2>

                    <p style="color:#6b7280;font-size:14px">
                      Your staff account has been created by the administrator.
                      Please click the button below to set your password.
                    </p>

                    <div style="text-align:center;margin:30px 0">
                      <a href="${link}"
                        style="background:#0066cc;color:white;padding:12px 24px;
                        text-decoration:none;border-radius:6px;font-weight:bold">
                        Set Password
                      </a>
                    </div>

                    <p style="font-size:12px;color:#9ca3af">
                      This link expires in 24 hours.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px;text-align:center;font-size:12px;color:#9ca3af">
                    © 2026 MedixFlow
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
    }

    await transporter.sendMail(mailOptions)

    console.log(`[EmailService] Password setup email sent to ${to}`)
  }

  async sendDoctorCredentialsEmail(to: string, doctorName: string, tempPassword: string) {
    const loginLink = `${process.env.FRONTEND_URL}/doctor/login`

    const mailOptions = {
      from: process.env.SMTP_FROM?.trim() || `"MedixFlow" <${process.env.SMTP_USER?.trim()}>`,
      to,
      subject: "Welcome to MedixFlow - Your Account Credentials",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#0066cc;padding:24px;text-align:center;color:#fff;font-size:22px;font-weight:bold;">
                    MedixFlow
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px">
                    <h2 style="margin-top:0;color:#111827;">Welcome Dr. ${doctorName}</h2>
                    <p style="color:#6b7280;font-size:14px;line-height:1.6;">
                      Your staff account has been created by the administrator. 
                      You can now login using the credentials below:
                    </p>
                    <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:24px 0;border:1px solid #e5e7eb;">
                      <p style="margin:0 0 12px;font-size:14px;color:#374151;">
                        <strong style="color:#111827;">Email:</strong> ${to}
                      </p>
                      <p style="margin:0;font-size:14px;color:#374151;">
                        <strong style="color:#111827;">Temporary Password:</strong> 
                        <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-family:monospace;font-weight:bold;color:#0066cc;font-size:15px;">${tempPassword}</code>
                      </p>
                    </div>
                    <div style="text-align:center;margin:32px 0">
                      <a href="${loginLink}"
                        style="background:#0066cc;color:white;padding:12px 32px;
                        text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;">
                        Login to Portal
                      </a>
                    </div>
                    <p style="font-size:12px;color:#ef4444;text-align:center;background:#fff1f2;padding:8px;border-radius:4px;margin:0;">
                      Important: For security reasons, please change your password after your first login.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;">
                    © 2026 MedixFlow • All rights reserved
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`[EmailService] Welcome email with password sent to ${to}`)
  }

  async sendForgotPasswordEmail(to: string, token: string, userName: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    const mailOptions = {
      from: process.env.SMTP_FROM?.trim() || `"MedixFlow" <${process.env.SMTP_USER?.trim()}>`,
      to,
      subject: "Reset your MedixFlow password",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#0066cc;padding:24px;text-align:center;color:#fff;font-size:22px;font-weight:bold;">
                    MedixFlow
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px">
                    <h2 style="margin-top:0;color:#111827;">Hello ${userName},</h2>
                    <p style="color:#6b7280;font-size:14px;line-height:1.6;">
                      We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
                    </p>
                    <div style="text-align:center;margin:32px 0">
                      <a href="${resetLink}"
                        style="background:#0066cc;color:white;padding:12px 32px;
                        text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;">
                        Reset Password
                      </a>
                    </div>
                    <p style="font-size:12px;color:#9ca3af;text-align:center;">
                      This link will expire in 1 hour.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;">
                    © 2026 MedixFlow • All rights reserved
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`[EmailService] Forgot password email sent to ${to}`)
  }
}

export default new EmailService()
