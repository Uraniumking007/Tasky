import nodemailer from "nodemailer";

// Validate email configuration
function validateEmailConfig() {
  const requiredVars = ["SMTP_USER", "SMTP_PASS"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("Missing required email environment variables:", missing);
    return false;
  }

  return true;
}

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add timeout and connection settings
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
});

export interface TeamInvitationEmailData {
  inviteeEmail: string;
  inviterName: string;
  teamName: string;
  organizationName?: string;
  inviteUrl: string;
  expiryDate: Date;
}

export interface OrganizationInvitationEmailData {
  inviteeEmail: string;
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
  expiryDate: Date;
}

export async function sendTeamInvitationEmail(data: TeamInvitationEmailData) {
  try {
    // Validate email configuration first
    if (!validateEmailConfig()) {
      return {
        success: false,
        error:
          "Email configuration is incomplete. Please check SMTP_USER and SMTP_PASS environment variables.",
      };
    }

    const {
      inviteeEmail,
      inviterName,
      teamName,
      organizationName,
      inviteUrl,
      expiryDate,
    } = data;

    console.log("Sending team invitation email to:", inviteeEmail);
    console.log("From:", process.env.SMTP_FROM || "noreply@tasky.com");

    const expiryFormatted = expiryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation - Tasky</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .team-info {
              background-color: #f3f4f6;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .team-name {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .organization-name {
              color: #6b7280;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #2563eb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .expiry-notice {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 12px;
              margin: 20px 0;
              color: #92400e;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Tasky</div>
              <div class="title">You're Invited!</div>
            </div>
            
            <div class="content">
              <p>Hi there!</p>
              
              <p><strong>${inviterName}</strong> has invited you to join their team on Tasky.</p>
              
              <div class="team-info">
                <div class="team-name">${teamName}</div>
                ${organizationName ? `<div class="organization-name">${organizationName}</div>` : ""}
              </div>
              
              <p>Tasky is a powerful task management platform that helps teams stay organized and productive.</p>
              
              <div style="text-align: center;">
                <a href="${inviteUrl}" class="cta-button">Accept Invitation</a>
              </div>
              
              <div class="expiry-notice">
                ⏰ This invitation expires on <strong>${expiryFormatted}</strong>
              </div>
              
              <p>If you don't have a Tasky account yet, you'll be able to create one when you accept the invitation.</p>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact the person who sent you this invitation.</p>
              <p>© 2024 Tasky. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
You're Invited to Join a Team on Tasky!

Hi there!

${inviterName} has invited you to join their team "${teamName}"${organizationName ? ` in the organization "${organizationName}"` : ""} on Tasky.

Tasky is a powerful task management platform that helps teams stay organized and productive.

To accept this invitation, please visit:
${inviteUrl}

This invitation expires on ${expiryFormatted}.

If you don't have a Tasky account yet, you'll be able to create one when you accept the invitation.

If you have any questions, please contact the person who sent you this invitation.

© 2024 Tasky. All rights reserved.
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@tasky.com",
      to: inviteeEmail,
      subject: `You're invited to join ${teamName} on Tasky`,
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending team invitation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendOrganizationInvitationEmail(
  data: OrganizationInvitationEmailData,
) {
  try {
    // Validate email configuration first
    if (!validateEmailConfig()) {
      return {
        success: false,
        error:
          "Email configuration is incomplete. Please check SMTP_USER and SMTP_PASS environment variables.",
      };
    }

    const {
      inviteeEmail,
      inviterName,
      organizationName,
      inviteUrl,
      expiryDate,
    } = data;

    console.log("Sending organization invitation email to:", inviteeEmail);
    console.log("From:", process.env.SMTP_FROM || "noreply@tasky.com");

    const expiryFormatted = expiryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Organization Invitation - Tasky</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .org-info {
              background-color: #f3f4f6;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .org-name {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .cta-button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #2563eb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .expiry-notice {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 12px;
              margin: 20px 0;
              color: #92400e;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Tasky</div>
              <div class="title">Organization Invitation</div>
            </div>
            
            <div class="content">
              <p>Hi there!</p>
              
              <p><strong>${inviterName}</strong> has invited you to join their organization on Tasky.</p>
              
              <div class="org-info">
                <div class="org-name">${organizationName}</div>
              </div>
              
              <p>Tasky is a powerful task management platform that helps organizations and teams stay organized and productive.</p>
              
              <div style="text-align: center;">
                <a href="${inviteUrl}" class="cta-button">Accept Invitation</a>
              </div>
              
              <div class="expiry-notice">
                ⏰ This invitation expires on <strong>${expiryFormatted}</strong>
              </div>
              
              <p>If you don't have a Tasky account yet, you'll be able to create one when you accept the invitation.</p>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact the person who sent you this invitation.</p>
              <p>© 2024 Tasky. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Organization Invitation - Tasky

Hi there!

${inviterName} has invited you to join the organization "${organizationName}" on Tasky.

Tasky is a powerful task management platform that helps organizations and teams stay organized and productive.

To accept this invitation, please visit:
${inviteUrl}

This invitation expires on ${expiryFormatted}.

If you don't have a Tasky account yet, you'll be able to create one when you accept the invitation.

If you have any questions, please contact the person who sent you this invitation.

© 2024 Tasky. All rights reserved.
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@tasky.com",
      to: inviteeEmail,
      subject: `You're invited to join ${organizationName} on Tasky`,
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending organization invitation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}

export interface PasswordResetEmailData {
  email: string;
  username: string;
  resetUrl: string;
  expiryDate: Date;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  try {
    // Validate email configuration first
    if (!validateEmailConfig()) {
      return {
        success: false,
        error:
          "Email configuration is incomplete. Please check SMTP_USER and SMTP_PASS environment variables.",
      };
    }

    const { email, username, resetUrl, expiryDate } = data;

    console.log("Sending password reset email to:", email);
    console.log("From:", process.env.SMTP_FROM || "noreply@tasky.com");

    const expiryFormatted = expiryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Tasky</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .user-info {
              background-color: #f3f4f6;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .username {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .cta-button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #2563eb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .expiry-notice {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 12px;
              margin: 20px 0;
              color: #92400e;
              font-size: 14px;
            }
            .security-notice {
              background-color: #fef2f2;
              border: 1px solid #f87171;
              border-radius: 6px;
              padding: 12px;
              margin: 20px 0;
              color: #dc2626;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 Tasky</div>
              <div class="title">Password Reset Request</div>
            </div>
            
            <div class="content">
              <p>Hi ${username}!</p>
              
              <p>We received a request to reset the password for your Tasky account.</p>
              
              <div class="user-info">
                <div class="username">${username}</div>
                <div style="color: #6b7280; font-size: 14px;">${email}</div>
              </div>
              
              <p>If you requested this password reset, click the button below to set a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="cta-button">Reset Password</a>
              </div>
              
              <div class="expiry-notice">
                ⏰ This password reset link expires on <strong>${expiryFormatted}</strong>
              </div>
              
              <div class="security-notice">
                🔒 <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
              </div>
              
              <p>For security reasons, this link can only be used once and will expire in 1 hour.</p>
            </div>
            
            <div class="footer">
              <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
              <p style="word-break: break-all; font-size: 12px; color: #9ca3af;">${resetUrl}</p>
              <p>© 2024 Tasky. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Password Reset Request - Tasky

Hi ${username}!

We received a request to reset the password for your Tasky account (${email}).

If you requested this password reset, please visit the following link to set a new password:
${resetUrl}

This password reset link expires on ${expiryFormatted}.

SECURITY NOTICE: If you did not request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link can only be used once and will expire in 1 hour.

If you're having trouble with the link, copy and paste this URL into your browser:
${resetUrl}

© 2024 Tasky. All rights reserved.
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@tasky.com",
      to: email,
      subject: "Reset your Tasky password",
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
