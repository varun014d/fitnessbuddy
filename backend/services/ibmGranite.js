/**
 * IBM Watsonx.ai / Granite — Token + Inference client
 */

const axios = require('axios');

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Fetch (or reuse cached) IBM IAM access token
 */
async function getIBMToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
    apikey: process.env.IBM_API_KEY
  });

  const response = await axios.post(
    process.env.IBM_IAM_URL || 'https://iam.cloud.ibm.com/identity/token',
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  cachedToken = response.data.access_token;
  // Expire 5 minutes before actual expiry for safety
  tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
  return cachedToken;
}

/**
 * Call IBM Granite model via Watsonx.ai inference API
 * @param {string} prompt  - Complete formatted prompt string
 * @returns {string}       - Model response text
 */
async function callGranite(prompt) {
  const token = await getIBMToken();

  const baseUrl = process.env.IBM_WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
  const modelId = process.env.IBM_MODEL_ID || 'ibm/granite-13b-chat-v2';
  const projectId = process.env.IBM_PROJECT_ID;

  if (!projectId) {
    throw new Error('IBM_PROJECT_ID is not set in environment variables.');
  }

  const payload = {
    model_id: modelId,
    input: prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: 600,
      min_new_tokens: 30,
      stop_sequences: ['<|user|>', '<|endoftext|>'],
      repetition_penalty: 1.1,
      temperature: 0.7
    },
    project_id: projectId
  };

  const response = await axios.post(
    `${baseUrl}/ml/v1/text/generation?version=2023-05-29`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      timeout: 30000
    }
  );

  const generated = response.data?.results?.[0]?.generated_text || '';
  return generated.trim();
}

module.exports = { callGranite };
