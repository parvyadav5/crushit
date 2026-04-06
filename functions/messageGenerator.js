/* eslint-env node */
// =============================================
//  Motivational Messages — Tone-Based
//  ─────────────────────────────────────
//  Friendly, Strict, Motivational arrays
//  Anti-repeat: never sends same message twice
// =============================================

const FRIENDLY_MESSAGES = [
    'You got this! 🌸✨',
    "Don't stop now, you're doing amazing 🌷",
    'Tiny steps today, big wins tomorrow 💖',
    'Stay focused, future you is proud 💫',
    'Finish it and feel great! 💕',
    'One task at a time 💗',
    "You're closer than you think! 🦋"
];

const STRICT_MESSAGES = [
    'Stay sharp. Finish what you started. 🔥',
    'No excuses. Just results. 💪',
    "You don't quit. You execute. 🎯",
    'One mission. Complete it. 🔥',
    'Focus. Grind. Win. 🧠',
    'Work now. Celebrate later. 🏆',
    'Stay locked in. No distractions. 🎯'
];

const MOTIVATIONAL_MESSAGES = [
    'Be relentless. Finish the task. 🔥',
    'Pressure makes diamonds. Keep pushing. 💎',
    'Success loves consistency. 📈',
    'Stay focused. Stay unstoppable. ⚡',
    'Do it like a warrior. 🛡️',
    "Stay strong. Finish today's mission. 💪",
    "You're closer than you think. Push! 🔥"
];

// Track last used index per user to avoid consecutive duplicates
const lastUsedIndex = {};

/**
 * Get a random motivational message based on tone.
 * Never repeats the same message consecutively for a user.
 *
 * @param {string} tone - 'Friendly', 'Strict', 'Motivational'
 * @param {string} userId - user ID for anti-repeat tracking
 * @returns {string} motivational message
 */
function getMotivationalMessage(tone, userId) {
    let messages = MOTIVATIONAL_MESSAGES;
    const toneLower = (tone || 'Motivational').toLowerCase();
    
    if (toneLower === 'friendly') messages = FRIENDLY_MESSAGES;
    else if (toneLower === 'strict') messages = STRICT_MESSAGES;

    const key = `${userId}_${toneLower}`;

    let index;
    do {
        index = Math.floor(Math.random() * messages.length);
    } while (index === lastUsedIndex[key] && messages.length > 1);

    lastUsedIndex[key] = index;
    return messages[index];
}

module.exports = { getMotivationalMessage };
