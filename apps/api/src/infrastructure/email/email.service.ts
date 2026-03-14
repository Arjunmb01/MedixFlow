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

class EmailService {
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
}

export default new EmailService()
