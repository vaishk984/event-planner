// Email Service using Resend (Free: 100 emails/day)
// https://resend.com/docs

import { logger } from '@/lib/utils/logger'

interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

interface EmailResult {
    success: boolean
    messageId?: string
    error?: string
}

// Check if Resend is configured
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@planneros.com'
const APP_NAME = 'PlannerOS'

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
    // If no API key, log and return (development mode)
    if (!RESEND_API_KEY) {
        logger.warn('RESEND_API_KEY not configured, email not sent', {
            to: options.to,
            subject: options.subject
        })

        // In development, just log the email
        if (process.env.NODE_ENV === 'development') {
            console.log('\n📧 EMAIL (dev mode - not actually sent):')
            console.log(`   To: ${options.to}`)
            console.log(`   Subject: ${options.subject}`)
            console.log('   ---')
            return { success: true, messageId: 'dev-mode' }
        }

        return { success: false, error: 'Email service not configured' }
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `${APP_NAME} <${FROM_EMAIL}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email')
        }

        logger.info('Email sent successfully', {
            to: options.to,
            subject: options.subject,
            messageId: data.id
        })

        return { success: true, messageId: data.id }
    } catch (error) {
        logger.error('Failed to send email', error as Error, {
            to: options.to,
            subject: options.subject
        })
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export async function sendWelcomeEmail(
    to: string,
    name: string,
    role: 'planner' | 'vendor'
): Promise<EmailResult> {
    const roleSpecificContent = role === 'planner'
        ? 'Start creating events and managing your clients with our powerful tools.'
        : 'Complete your vendor profile to start receiving booking requests from planners.'

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PlannerOS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">🎉 Welcome to PlannerOS!</h1>
    </div>
    
    <p>Hi ${name},</p>
    
    <p>Thank you for joining PlannerOS - the operating system for event planners!</p>
    
    <p>${roleSpecificContent}</p>
    
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Quick Start:</h3>
        <ul style="padding-left: 20px;">
            <li>Complete your profile</li>
            <li>${role === 'planner' ? 'Create your first event' : 'Set up your services & pricing'}</li>
            <li>Explore the dashboard</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
           style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Go to Dashboard
        </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
        Need help? Reply to this email or check our help center.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} PlannerOS. All rights reserved.
    </p>
</body>
</html>
`

    return sendEmail({
        to,
        subject: `Welcome to PlannerOS, ${name}! 🎉`,
        html,
        text: `Welcome to PlannerOS, ${name}! ${roleSpecificContent}`
    })
}

export async function sendPasswordResetEmail(
    to: string,
    resetLink: string
): Promise<EmailResult> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">Reset Your Password</h1>
    </div>
    
    <p>Hi,</p>
    
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Reset Password
        </a>
    </div>
    
    <p style="color: #666;">
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} PlannerOS. All rights reserved.
    </p>
</body>
</html>
`

    return sendEmail({
        to,
        subject: 'Reset your PlannerOS password',
        html,
        text: `Reset your password by visiting: ${resetLink}`
    })
}

export async function sendBookingNotificationEmail(
    to: string,
    eventName: string,
    vendorName: string,
    status: 'pending' | 'accepted' | 'declined'
): Promise<EmailResult> {
    const statusMessages = {
        pending: `You have a new booking request for "${eventName}" from ${vendorName}.`,
        accepted: `Great news! ${vendorName} has accepted your booking request for "${eventName}".`,
        declined: `${vendorName} has declined your booking request for "${eventName}".`
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">Booking Update</h1>
    </div>
    
    <p>${statusMessages[status]}</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/planner/events" 
           style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            View Details
        </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} PlannerOS. All rights reserved.
    </p>
</body>
</html>
`

    return sendEmail({
        to,
        subject: `Booking Update: ${eventName}`,
        html,
        text: statusMessages[status]
    })
}
