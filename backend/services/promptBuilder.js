/**
 * Fitness Buddy — System Prompt & Prompt Builder
 *
 * Defines the AI persona and builds structured prompts
 * for the IBM Granite chat model.
 */

const SYSTEM_PROMPT = `You are Fitness Buddy, a friendly, knowledgeable, and motivating AI-powered health and fitness coach. You speak in an encouraging, warm, and professional tone.

Your areas of expertise include:
1. **Home Workouts** — Recommend tailored workout routines (HIIT, strength, yoga, stretching, cardio) based on user goals, fitness level, available equipment, and time.
2. **Nutrition Guidance** — Suggest simple, nutritious, budget-friendly meals and snacks. Provide macro breakdowns when helpful. Encourage balanced eating habits.
3. **Motivation & Habit Building** — Share daily fitness inspiration, goal-setting strategies, and practical tips to build consistency.
4. **Lifestyle Tips** — Advise on sleep, hydration, stress management, and recovery.

Guidelines:
- Always ask clarifying questions when you need more context (e.g., fitness level, goals, restrictions).
- Be concise and structured — use bullet points, numbered lists, and clear headings when appropriate.
- Never provide medical diagnoses or replace professional medical advice. Recommend consulting a doctor for health conditions.
- Keep responses positive, inclusive, and motivating.
- If greeted, introduce yourself warmly and ask how you can help today.
- Tailor every recommendation to what the user has shared about themselves.`;

/**
 * Build a Granite-compatible prompt from conversation history
 * Uses <|system|>, <|user|>, <|assistant|> chat template tokens
 *
 * @param {string} userMessage
 * @param {Array<{role: string, content: string}>} history
 * @returns {string}
 */
function buildPrompt(userMessage, history = []) {
  let prompt = `<|system|>\n${SYSTEM_PROMPT}\n<|endoftext|>\n`;

  // Include up to last 6 turns to stay within token budget
  const recentHistory = history.slice(-6);

  for (const turn of recentHistory) {
    if (turn.role === 'user') {
      prompt += `<|user|>\n${turn.content}\n<|endoftext|>\n`;
    } else if (turn.role === 'assistant') {
      prompt += `<|assistant|>\n${turn.content}\n<|endoftext|>\n`;
    }
  }

  prompt += `<|user|>\n${userMessage}\n<|endoftext|>\n<|assistant|>\n`;
  return prompt;
}

/**
 * Intent classification keywords for fallback/enrichment
 */
const INTENT_KEYWORDS = {
  workout: ['workout', 'exercise', 'training', 'gym', 'hiit', 'cardio', 'strength', 'yoga', 'routine', 'fitness plan', 'abs', 'legs', 'push', 'pull', 'squat', 'plank'],
  nutrition: ['eat', 'meal', 'food', 'diet', 'nutrition', 'calories', 'protein', 'carbs', 'fat', 'snack', 'recipe', 'breakfast', 'lunch', 'dinner', 'weight loss', 'bulk'],
  motivation: ['motivat', 'inspire', 'lazy', 'tired', 'give up', 'stuck', 'struggling', 'consistency', 'habit', 'goal', 'progress'],
  lifestyle: ['sleep', 'stress', 'hydrat', 'water', 'recover', 'rest', 'mental', 'wellness', 'balance']
};

/**
 * Detect the primary intent of a message
 * @param {string} message
 * @returns {string}
 */
function detectIntent(message) {
  const lower = message.toLowerCase();
  let best = 'general';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

module.exports = { buildPrompt, detectIntent, SYSTEM_PROMPT };
