/* eslint-env node */
// =============================================
//  Mailer — Send Reminder Emails via Resend
//  ─────────────────────────────────────────────
//  Uses Resend API.
//  Works inside Firebase Cloud Functions.
// =============================================

const { Resend } = require('resend');
const { defineString } = require('firebase-functions/params');

// Environment variables set via .env or firebase functions:config
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Send a task reminder email
 */
async function sendReminderEmail(toEmail, task, daysLeft, type = 'daily', motivationalMsg = '', tone = 'Motivational') {
    const resend = new Resend(resendApiKey.value());
    const deadlineDate = task.deadline.toDate
        ? task.deadline.toDate()
        : new Date(task.deadline);

    const deadlineStr = deadlineDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    const toneLower = (tone || 'Motivational').toLowerCase();
    
    // Tone Setup
    let greeting = 'Hello,';
    let bodyIntro = 'You have an upcoming task:';
    let accentColor = '#e8772e';
    let bgColor = '#fdf6ec';
    let urgency = '';
    let subject = '';
    
    if (toneLower === 'friendly') {
        greeting = 'Hi there! 🌸';
        bodyIntro = 'Just a gentle reminder about your upcoming task:';
        accentColor = '#e056fd';
        bgColor = '#faeaff';
    } else if (toneLower === 'strict') {
        greeting = 'COMMAND ISSUED:';
        bodyIntro = 'ATTENTION: Deadline approaching for the following task.';
        accentColor = '#c0392b';
        bgColor = '#fdf0f0';
    } else {
        // Motivational
        greeting = 'Hey Champion, 🚀';
        bodyIntro = "Let's keep the momentum going on your task:";
    }

    if (type === 'urgent') {
        if (daysLeft <= 1) {
            urgency = '🚨 DUE TOMORROW — ACT NOW!';
        } else {
            urgency = `🚨 Only ${daysLeft} Days Left!`;
        }
        subject = toneLower === 'strict' 
            ? `[CRITICAL] Final Warning: ${task.title}`
            : toneLower === 'friendly' ? `💕 Gentle Urgent Nudge: ${task.title}` : `⚠️ Urgent Task Reminder: ${task.title} — ${urgency}`;
        accentColor = '#e74c3c';
        bgColor = '#fef2f2';
        bodyIntro = toneLower === 'strict' 
            ? 'FAILURE IS NOT AN OPTION: Deadline is critical.' 
            : toneLower === 'friendly' ? 'Please try to close this soon, you can do it!' : 'This is an urgent reminder that your task deadline is approaching.';
    } else {
        if (daysLeft === 7) {
            urgency = '⏰ 7-Day Heads Up';
        } else if (daysLeft <= 1) {
            urgency = '🚨 Due Tomorrow!';
        } else {
            urgency = `⚡ ${daysLeft} Days Left`;
        }
        subject = toneLower === 'strict' 
            ? `[NOTICE] Deadline Tracker: ${task.title}`
            : toneLower === 'friendly' ? `✨ Here is your reminder: ${task.title}` : `⏰ Task Reminder: ${task.title} — ${urgency}`;
    }

    const continuousNote = type === 'urgent'
        ? '<p style="color: #e74c3c; font-size: 13px; margin: 16px 0 0; text-align: center; font-weight: 600;">⚠️ You will continue receiving reminders every 2 hours until this task is completed or the deadline passes.</p>'
        : '';

    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: ${bgColor}; border-radius: 16px;">
        <h1 style="color: ${accentColor}; font-size: 22px; margin: 0 0 8px;">🔒 CrushIt</h1>
        <p style="color: #666; font-size: 13px; margin: 0 0 24px;">${type === 'urgent' ? '⚠️ Urgent Task Reminder' : '⏰ Task Reminder'}</p>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); ${type === 'urgent' ? 'border-left: 4px solid #e74c3c;' : `border-left: 4px solid ${accentColor};`}">
          <p style="color: #333; font-size: 15px; margin: 0 0 16px; font-weight: bold;">${greeting}</p>
          <p style="color: #333; font-size: 15px; margin: 0 0 20px;">${bodyIntro}</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px; width: 80px;">Title</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${task.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Priority</td>
              <td style="padding: 8px 0; color: ${task.priority === 'high' ? '#e74c3c' : task.priority === 'medium' ? '#f39c12' : '#27ae60'}; font-size: 14px; font-weight: 600; text-transform: uppercase;">${task.priority || 'medium'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Deadline</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${deadlineStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Status</td>
              <td style="padding: 8px 0; color: ${accentColor}; font-size: 14px; font-weight: 600;">${urgency}</td>
            </tr>
          </table>
        </div>

        <p style="color: ${accentColor}; font-size: 15px; margin: 24px 0 0; text-align: center; font-weight: 600;">
          ${motivationalMsg || 'Stay focused and complete it on time. 💪'}
        </p>
        ${continuousNote}
        <p style="color: #aaa; font-size: 11px; margin: 16px 0 0; text-align: center;">
          — CrushIt Reminder System
        </p>
      </div>
    `;

    try {
        const payload = {
            from: 'CrushIt 🔒 <onboarding@resend.dev>', // Default testing email
            to: [toEmail],
            subject: subject,
            html: html,
        };

        const { data, error } = await resend.emails.send(payload);

        if (error) {
            console.error(`  ❌ Failed to send email to ${toEmail}: `, error);
            throw new Error(error.message);
        }

        console.log(`  ✉️  Email sent to ${toEmail} for "${task.title}" (${urgency}) [${type}]`);
        return data;
    } catch (error) {
        console.error(`  ❌ Failed to send email to ${toEmail}:`, error.message);
        throw error;
    }
}

/**
 * Utility: Quick test email
 */
async function sendTestEmail(toEmail) {
    const resend = new Resend(resendApiKey.value());
    try {
        const { data, error } = await resend.emails.send({
            from: 'CrushIt 🔒 <onboarding@resend.dev>',
            to: [toEmail],
            subject: 'Test Email from CrushIt via Resend',
            html: '<p>This is a test email sent from Firebase Functions using Resend!</p>'
        });
        
        if (error) {
            console.error('Error from Resend:', error);
            throw new Error(error.message);
        }
        
        return data;
    } catch (error) {
        console.error('Error from Resend:', error);
        throw error;
    }
}

module.exports = { sendReminderEmail, sendTestEmail };
