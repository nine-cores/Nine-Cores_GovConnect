import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import log from '@/core/logger';
import { GNAppointment } from '@/database/entities/gn-appointment.entity';
import { api, app } from '@/config';

export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth?: {
        user: string;
        pass: string;
    };
}

export interface EmailMessage {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: {
        filename: string;
        content: Buffer;
        contentType: string;
    }[];
}

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure for Mailhog in development
        const emailConfig: EmailConfig = {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '4607'),
            secure: false, // Mailhog doesn't use SSL
            // No auth needed for Mailhog
        };

        log.info(`Email service configuration: host=${emailConfig.host}, port=${emailConfig.port}, secure=${emailConfig.secure}`);
        this.transporter = nodemailer.createTransport(emailConfig);
        
        // Test connection on startup
        this.testConnection();
    }

    async sendEmail(message: EmailMessage): Promise<boolean> {
        try {
            const mailOptions: any = {
                from: '"Government Portal" <noreply@gov.lk>',
                to: message.to,
                subject: message.subject,
                text: message.text,
                html: message.html,
            };

            if (message.attachments) {
                mailOptions.attachments = message.attachments;
            }

            const info = await this.transporter.sendMail(mailOptions);

            log.info(`Email sent successfully: ${info.messageId}`);
            return true;
        } catch (error) {
            log.error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
            log.error(`Email error details: ${JSON.stringify(error)}`);
            return false;
        }
    }

    async sendOTPEmail(email: string, otp: string, type: string): Promise<boolean> {
        const subject = this.getOTPSubject(type);
        const html = this.generateOTPEmailHTML(otp, type);
        const text = this.generateOTPEmailText(otp, type);

        return this.sendEmail({
            to: email,
            subject,
            html,
            text
        });
    }

    private getOTPSubject(type: string): string {
        switch (type) {
            case 'Login':
                return 'Your Login Verification Code';
            case 'PasswordReset':
                return 'Password Reset Verification Code';
            case 'EmailVerification':
                return 'Email Verification Code';
            default:
                return 'Your Verification Code';
        }
    }

    private generateOTPEmailHTML(otp: string, type: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Verification Code</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #2c5aa0; text-align: center; 
                               background: white; padding: 20px; border-radius: 8px; margin: 20px 0; 
                               letter-spacing: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .warning { color: #d32f2f; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏛️ Government Portal</h1>
                        <p>Citizen Authentication Service</p>
                    </div>
                    <div class="content">
                        <h2>Your ${type} Verification Code</h2>
                        <p>Hello,</p>
                        <p>You have requested a verification code for ${type.toLowerCase()}. Please use the code below:</p>
                        
                        <div class="otp-code">${otp}</div>
                        
                        <p><strong>This code will expire in 10 minutes.</strong></p>
                        
                        <div class="warning">
                            <p><strong>Security Notice:</strong></p>
                            <ul>
                                <li>Never share this code with anyone</li>
                                <li>Government staff will never ask for your verification code</li>
                                <li>If you didn't request this code, please ignore this email</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from the Government Citizen Portal.</p>
                        <p>For support, please contact your local government office.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    private generateOTPEmailText(otp: string, type: string): string {
        return `
Government Portal - ${type} Verification Code

Your verification code is: ${otp}

This code will expire in 10 minutes.

Security Notice:
- Never share this code with anyone
- Government staff will never ask for your verification code
- If you didn't request this code, please ignore this email

This is an automated message from the Government Citizen Portal.
For support, please contact your local government office.
        `.trim();
    }

    async sendAppointmentConfirmation(appointment: GNAppointment, citizenEmail: string): Promise<boolean> {
        try {
            // Generate appointment details URL for QR code
            const appointmentUrl = `${api.url}/v1/citizen-appointments/${appointment.gnAppointmentId}`;
            
            // Generate unique filename for QR code
            const qrCodeFilename = `${uuidv4()}.png`;
            const qrCodePath = path.join(process.cwd(), 'uploads', 'QR', qrCodeFilename);
            
            // Ensure QR directory exists
            const qrDir = path.dirname(qrCodePath);
            if (!fs.existsSync(qrDir)) {
                fs.mkdirSync(qrDir, { recursive: true });
            }
            
            // Generate QR code and save as file
            await QRCode.toFile(qrCodePath, appointmentUrl, {
                type: 'png',
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            // URL to access the QR code
            const qrCodeUrl = `${api.host}/uploads/QR/${qrCodeFilename}`;


            
            log.info(`QR code saved at: ${qrCodePath}`);
            log.info(`QR code URL: ${qrCodeUrl}`);

            const subject = `Appointment Confirmation - ${appointment.gnService?.serviceName || 'GN Service'}`;
            const html = this.generateAppointmentConfirmationHTML(appointment, appointmentUrl, qrCodeUrl);
            const text = this.generateAppointmentConfirmationText(appointment, appointmentUrl);

            return this.sendEmail({
                to: citizenEmail,
                subject,
                html,
                text
            });
        } catch (error) {
            log.error(`Failed to send appointment confirmation email: ${error}`);
            return false;
        }
    }

    private generateAppointmentConfirmationHTML(appointment: GNAppointment, appointmentUrl: string, qrCodeUrl?: string): string {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Appointment Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
                    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; color: #666; }
                    .detail-value { color: #333; }
                    .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 8px; }
                    .status-confirmed { color: #4caf50; font-weight: bold; font-size: 18px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .important-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏛️ Government Portal</h1>
                        <h2>Appointment Confirmation</h2>
                    </div>
                    <div class="content">
                        <div class="status-confirmed">✅ Your appointment has been confirmed!</div>
                        
                        <div class="appointment-card">
                            <h3>Appointment Details</h3>
                            
                            <div class="detail-row">
                                <span class="detail-label">Appointment ID:</span>
                                <span class="detail-value">${appointment.gnAppointmentId}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Service:</span>
                                <span class="detail-value">${appointment.gnService?.serviceName || 'GN Service'}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">${appointmentDate}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Time:</span>
                                <span class="detail-value">${appointment.startTime} - ${appointment.endTime}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Purpose:</span>
                                <span class="detail-value">${appointment.purpose}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Officer:</span>
                                <span class="detail-value">${appointment.user?.displayName || 'GN Officer'}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value status-confirmed">${appointment.status}</span>
                            </div>
                        </div>

                                                <div class="qr-section">
                            <h3>📱 QR Code for Your Appointment</h3>
                            <p>Show this QR code at your appointment or scan it to view details online:</p>
                            ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="Appointment QR Code" style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px; margin: 15px 0;" />` : '<p><em>(QR Code will be generated shortly)</em></p>'}
                            <p><a href="${appointmentUrl}">View appointment details online</a></p>
                        </div>

                        <div class="important-note">
                            <h4>📋 Important Instructions:</h4>
                            <ul>
                                <li><strong>Arrive 15 minutes early</strong> for your appointment</li>
                                <li>Bring a <strong>valid ID</strong> and any required documents</li>
                                <li>Show the <strong>QR code</strong> to the officer when you arrive</li>
                                <li>If you need to cancel or reschedule, contact the office at least 24 hours in advance</li>
                            </ul>
                        </div>
                        
                        <div class="important-note">
                            <h4>📍 Office Location:</h4>
                            <p>Your appointment is with the Grama Niladhari officer for your division.</p>
                            <p>Please contact your local GN office if you need directions or have questions.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated confirmation from the Government Citizen Portal.</p>
                        <p>For support, please contact your local government office.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    private generateAppointmentConfirmationText(appointment: GNAppointment, appointmentUrl: string): string {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
Government Portal - Appointment Confirmation

✅ Your appointment has been confirmed!

Appointment Details:
- Appointment ID: ${appointment.gnAppointmentId}
- Service: ${appointment.gnService?.serviceName || 'GN Service'}
- Date: ${appointmentDate}
- Time: ${appointment.startTime} - ${appointment.endTime}
- Purpose: ${appointment.purpose}
- Officer: ${appointment.user?.displayName || 'GN Officer'}
- Status: ${appointment.status}

View appointment details online: ${appointmentUrl}

Important Instructions:
- Arrive 15 minutes early for your appointment
- Bring a valid ID and any required documents
- Show the QR code (attached) to the officer when you arrive
- If you need to cancel or reschedule, contact the office at least 24 hours in advance

Office Location:
Your appointment is with the Grama Niladhari officer for your division.
Please contact your local GN office if you need directions or have questions.

This is an automated confirmation from the Government Citizen Portal.
For support, please contact your local government office.
        `.trim();
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            log.info('Email service connection verified');
            return true;
        } catch (error) {
            log.error(`Email service connection failed: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
}

// Create singleton instance
export const emailService = new EmailService();
