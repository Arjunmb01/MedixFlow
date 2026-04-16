import nodemailer from 'nodemailer';

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendMail(to: string, subject: string, text: string, html?: string) {
        try {
            const info = await this.transporter.sendMail({
                from: `"MedixFlow" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@medixflow.com'}>`,
                to,
                subject,
                text,
                html,
            });

            console.log(`[Email Service] Message sent: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error('[Email Service] Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}

export default new EmailService();
