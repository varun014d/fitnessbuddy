/**
 * Chat Controller — orchestrates prompt building + Granite call
 */

const { callGranite } = require('../services/ibmGranite');
const { buildPrompt, detectIntent } = require('../services/promptBuilder');

// Fallback responses when Granite is unavailable (demo / offline mode)
const FALLBACK = {
  workout: `Here's a quick 20-minute home workout you can try right now!\n\n**Warm-up (3 min)**\n- Jumping jacks — 1 min\n- Arm circles + hip rotations — 1 min\n- High knees — 1 min\n\n**Main Circuit (x3 rounds)**\n- 15 Push-ups\n- 20 Bodyweight squats\n- 30-second Plank\n- 15 Glute bridges\n- 10 Tricep dips (use a chair)\n\n**Cool-down (2 min)**\n- Child's pose, hamstring stretch\n\n💪 Consistency beats intensity — keep showing up!`,
  nutrition: `Here are some quick, nutritious meal ideas:\n\n**Breakfast 🥣**\n- Overnight oats with banana & chia seeds\n- Greek yogurt with berries & honey\n\n**Lunch 🥗**\n- Grilled chicken wrap with avocado & greens\n- Lentil soup with whole-grain bread\n\n**Dinner 🍽️**\n- Baked salmon with steamed broccoli & quinoa\n- Stir-fried tofu with vegetables & brown rice\n\n**Snacks 🍎**\n- Handful of mixed nuts\n- Apple slices with peanut butter\n\nAim for balanced plates: ½ veggies, ¼ protein, ¼ complex carbs! 🌿`,
  motivation: `You've already taken the first step by showing up — that's huge! 🌟\n\n**Today's Fitness Motivation:**\n> *"The only bad workout is the one that didn't happen."*\n\n**3 Tips to Stay Consistent:**\n1. **Start small** — Even 10 minutes a day builds momentum.\n2. **Track your wins** — Log every workout, no matter how short.\n3. **Find your WHY** — Write down your reason and read it daily.\n\nRemember: progress isn't linear. Every step forward counts! 💪`,
  general: `Hi! I'm **Fitness Buddy**, your AI-powered health and fitness coach! 🏋️\n\nI can help you with:\n- 🏃 **Workout plans** tailored to your goals & schedule\n- 🥗 **Nutrition advice** and healthy meal ideas\n- 💡 **Daily motivation** and habit-building tips\n- 😴 **Lifestyle guidance** — sleep, hydration, recovery\n\nWhat would you like to work on today? Tell me about your fitness goals!`
};

/**
 * Main chat function
 * @param {string} userMessage
 * @param {Array} history
 * @returns {Promise<string>}
 */
async function chat(userMessage, history = []) {
  // Check if IBM credentials are configured
  if (!process.env.IBM_API_KEY || process.env.IBM_API_KEY === 'your_ibm_cloud_api_key_here') {
    console.warn('[WARN] IBM_API_KEY not configured — serving demo response');
    const intent = detectIntent(userMessage);
    return FALLBACK[intent] || FALLBACK.general;
  }

  try {
    const prompt = buildPrompt(userMessage, history);
    const response = await callGranite(prompt);

    // If Granite returns an empty response, use fallback
    if (!response || response.length < 5) {
      const intent = detectIntent(userMessage);
      return FALLBACK[intent] || FALLBACK.general;
    }

    return response;
  } catch (err) {
    console.error('[Granite Error]', err.response?.data || err.message);

    // Return graceful fallback instead of crashing
    const intent = detectIntent(userMessage);
    return `I'm having a brief moment of connectivity issues with my AI brain! 😅\n\nHere's a helpful response in the meantime:\n\n${FALLBACK[intent] || FALLBACK.general}`;
  }
}

module.exports = { chat };
