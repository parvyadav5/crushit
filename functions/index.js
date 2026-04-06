/* eslint-env node */
// =============================================
//  Firebase Cloud Functions — FREE PLAN (SPARK)
//  ─────────────────────────────────────────────
//  Unified Reminder System — HTTPS Triggered
//
//  How it works on Free Plan:
//  1. Triggered by EXTERNAL free cron service (e.g., cron-job.org)
//  2. Runs every 2 hours
//  3. Protected by ?key=SECRET query parameter
//  4. Checks both "Daily" (9AM) and "Urgent" tasks
//
//  Deploy: firebase deploy --only functions
//  URL: https://us-central1-YOUR_PROJECT.cloudfunctions.net/checkReminders?key=crushit_secret_123
// =============================================

const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require('firebase-admin/messaging');
const { sendReminderEmail, sendTestEmail } = require('./mailer');
const { getMotivationalMessage } = require('./messageGenerator');

initializeApp();
const db = getFirestore();

// 🔒 SECURITY KEY — Must match ?key= parameter in cron job
const CRON_SECRET_KEY = 'crushit_secret_123';

// =============================================
//  HELPER FUNCTIONS
// =============================================

function getDaysLeft(deadline) {
    const now = new Date();
    const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineStart = new Date(
        deadlineDate.getFullYear(),
        deadlineDate.getMonth(),
        deadlineDate.getDate()
    );
    return Math.ceil((deadlineStart - todayStart) / (1000 * 60 * 60 * 24));
}

function getHoursLeft(deadline) {
    const now = new Date();
    const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    return (deadlineDate - now) / (1000 * 60 * 60);
}

function wasWithinHours(timestamp, hours) {
    if (!timestamp) return false;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return (new Date() - date) / (1000 * 60 * 60) < hours;
}

function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isMorningTime() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const hour = istTime.getUTCHours();
    return hour >= 9 && hour < 11;
}

async function getUserEmail(userId) {
    try {
        const userRecord = await getAuth().getUser(userId);
        return userRecord.email;
    } catch {
        return null;
    }
}

function isQuietHoursForUser(userData) {
    if (!userData || !userData.quietHoursStart || !userData.quietHoursEnd) return false;
    
    const startParts = userData.quietHoursStart.split(':').map(Number);
    const endParts = userData.quietHoursEnd.split(':').map(Number);
    
    // Assuming user times align with timezone IST (UTC+5:30) as previously mapped
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const currentHour = istTime.getUTCHours();
    const currentMins = istTime.getUTCMinutes();
    const currentTotalMins = currentHour * 60 + currentMins;
    
    const startTotalMins = startParts[0] * 60 + startParts[1];
    const endTotalMins = endParts[0] * 60 + endParts[1];
    
    if (startTotalMins > endTotalMins) {
        // e.g. 23:00 to 07:00 (crosses midnight)
        return currentTotalMins >= startTotalMins || currentTotalMins < endTotalMins;
    } else {
        // e.g. 01:00 to 05:00
        return currentTotalMins >= startTotalMins && currentTotalMins < endTotalMins;
    }
}

async function getUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) return userDoc.data();
        return null;
    } catch {
        return null;
    }
}

async function getUserTokens(userId) {
    try {
        const tokensSnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('tokens')
            .get();
        if (tokensSnapshot.empty) return [];
        return tokensSnapshot.docs.map((d) => d.data().token).filter(Boolean);
    } catch {
        return [];
    }
}

async function sendPushNotification(userId, task, daysLeft, type, motivationalMsg) {
    const tokens = await getUserTokens(userId);
    if (tokens.length === 0) return;

    const deadlineDate = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
    const deadlineStr = deadlineDate.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    const title = type === 'urgent' ? `⚠️ Urgent: ${task.title}` : `⏰ ${task.title}`;
    const body = type === 'urgent'
        ? `Only ${daysLeft} day(s) left! Deadline: ${deadlineStr}`
        : `${daysLeft} days until deadline: ${deadlineStr}`;

    const fullBody = motivationalMsg ? `${body}\n\n${motivationalMsg}` : body;

    const message = {
        tokens: tokens,
        notification: { title, body: fullBody },
        webpush: {
            fcmOptions: { link: '/' },
            notification: { icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' }
        }
    };

    try {
        const response = await getMessaging().sendEachForMulticast(message);
        if (response.failureCount > 0) {
            // Cleanup logic omitted for brevity in free version, but recommended
        }
    } catch (err) {
        console.error('Push failed:', err.message);
    }
}

// =============================================
//  MAIN FUNCTION (HTTPS)
// =============================================

exports.checkReminders = onRequest(async (req, reqRes) => {
    // 1. Security Check
    const key = req.query.key;
    if (key !== CRON_SECRET_KEY) {
        return reqRes.status(403).send('Forbidden: Invalid Key');
    }

    // 2. We skip global quiet hours. Will check individually inside the loop.

    const isDailyRun = isMorningTime();
    const today = getTodayString();
    let stats = { daily: 0, urgent: 0, skipped: 0 };

    try {
        const tasksSnapshot = await db.collection('tasks').where('completed', '==', false).get();

        if (tasksSnapshot.empty) {
            return reqRes.status(200).send('No pending tasks.');
        }

        for (const taskDoc of tasksSnapshot.docs) {
            const task = taskDoc.data();
            const taskId = taskDoc.id;

            if (!task.deadline) { stats.skipped++; continue; }

            const daysLeft = getDaysLeft(task.deadline);
            const hoursLeft = getHoursLeft(task.deadline);

            // Skip expired
            if (hoursLeft <= 0) { stats.skipped++; continue; }

            const userData = await getUserData(task.userId);
            if (!userData || userData.emailReminders === false) { stats.skipped++; continue; }
            if (isQuietHoursForUser(userData)) { stats.skipped++; continue; }
            
            const userEmail = userData.email || await getUserEmail(task.userId);
            if (!userEmail) { stats.skipped++; continue; }

            const motivMsg = getMotivationalMessage(userData.tone || 'Motivational', task.userId);

            // ─── DAILY REMINDERS (Run only between 9-11 AM) ───
            if (isDailyRun) {
                // 7-Day Alert
                if (daysLeft === 7 && !task.notified7day) {
                    try {
                        await sendReminderEmail(userEmail, task, daysLeft, 'daily', motivMsg, userData.tone);
                        await sendPushNotification(task.userId, task, daysLeft, 'daily', motivMsg);
                        await db.collection('tasks').doc(taskId).update({
                            notified7day: true,
                            lastReminderSent: FieldValue.serverTimestamp()
                        });
                        stats.daily++;
                    } catch (emailErr) {
                        console.error(`  ⚠️ Email failed for ${userEmail}:`, emailErr.message);
                        stats.skipped++;
                    }
                    continue;
                }

                // 5-6 Day Reminder (Once per day)
                if (daysLeft > 4 && daysLeft < 7) {
                    // Check if already sent today
                    if (task.lastReminderSent) {
                        const lastSent = task.lastReminderSent.toDate ? task.lastReminderSent.toDate() : new Date(task.lastReminderSent);
                        const sentUnadjusted = new Date(lastSent); // UTC
                        // Simple check: if last sent was < 20 hours ago
                        if ((new Date() - sentUnadjusted) < 20 * 60 * 60 * 1000) {
                            stats.skipped++;
                            continue;
                        }
                    }

                    try {
                        await sendReminderEmail(userEmail, task, daysLeft, 'daily', motivMsg, userData.tone);
                        await sendPushNotification(task.userId, task, daysLeft, 'daily', motivMsg);
                        await db.collection('tasks').doc(taskId).update({
                            lastReminderSent: FieldValue.serverTimestamp()
                        });
                        stats.daily++;
                    } catch (emailErr) {
                        console.error(`  ⚠️ Email failed for ${userEmail}:`, emailErr.message);
                        stats.skipped++;
                    }
                    continue;
                }
            }

            // ─── URGENT REMINDERS (Run every execution if ≤ 4 days) ───
            if (daysLeft <= 4) {
                // Anti-Spam: Daily Cap Reset
                let sentToday = task.remindersSentToday || 0;
                if (task.lastReminderDay !== today) sentToday = 0;

                if (sentToday >= 6) { stats.skipped++; continue; } // Max 6/day

                // Anti-Spam: 2-Hour Window
                if (wasWithinHours(task.lastReminderSent, 2)) {
                    stats.skipped++;
                    continue;
                }

                // Send Urgent Reminder
                try {
                    await sendReminderEmail(userEmail, task, daysLeft, 'urgent', motivMsg, userData.tone);
                    await sendPushNotification(task.userId, task, daysLeft, 'urgent', motivMsg);

                    await db.collection('tasks').doc(taskId).update({
                        lastReminderSent: FieldValue.serverTimestamp(),
                        remindersSentToday: sentToday + 1,
                        lastReminderDay: today
                    });
                    stats.urgent++;
                } catch (emailErr) {
                    console.error(`  ⚠️ Email failed for ${userEmail}:`, emailErr.message);
                    stats.skipped++;
                }
            }
        }

        return reqRes.status(200).json({
            status: 'Success',
            mode: isDailyRun ? 'Daily + Urgent' : 'Urgent Only',
            stats: stats
        });

    } catch (error) {
        console.error('Error:', error);
        return reqRes.status(500).send('Internal Server Error: ' + error.message);
    }
});

// =============================================
//  TEST EMAIL FUNCTION (HTTPS)
// =============================================

exports.testEmail = onRequest(async (req, reqRes) => {
    const toEmail = req.query.email;
    if (!toEmail) {
        return reqRes.status(400).send('Missing ?email parameter');
    }
    
    // Security check optional but good practice
    const key = req.query.key;
    if (key !== CRON_SECRET_KEY) {
        return reqRes.status(403).send('Forbidden: Invalid Key');
    }

    try {
        const result = await sendTestEmail(toEmail);
        return reqRes.status(200).json({ status: 'Success', result });
    } catch (error) {
        return reqRes.status(500).send('Error testing email: ' + error.message);
    }
});

// =============================================
//  SCHEDULED HOURLY REMINDER (Native Firebase)
// =============================================

exports.hourlyReminder = onSchedule('every 1 hours', async () => {
    try {
        const tasksSnapshot = await db.collection('tasks').where('completed', '==', false).get();
        if (tasksSnapshot.empty) return;

        for (const taskDoc of tasksSnapshot.docs) {
            const task = taskDoc.data();
            const taskId = taskDoc.id;

            if (!task.deadline) continue;

            const hoursLeft = getHoursLeft(task.deadline);

            const userData = await getUserData(task.userId);
            if (!userData || userData.emailReminders === false) continue;
            if (isQuietHoursForUser(userData)) continue;

            // Due within 24 hours (and hasn't expired), and hasn't been notified yet
            if (hoursLeft > 0 && hoursLeft <= 24 && !task.notified24h) {
                const userEmail = userData.email || await getUserEmail(task.userId);
                if (!userEmail) continue;
                
                const motivMsg = getMotivationalMessage(userData.tone || 'Motivational', task.userId);
                
                await sendReminderEmail(userEmail, task, 1, 'urgent', motivMsg, userData.tone);
                
                // Mark as notified to prevent spamming every hour
                await db.collection('tasks').doc(taskId).update({
                    notified24h: true
                });
            }
        }
    } catch (error) {
        console.error('Hourly reminder error:', error);
    }
});
