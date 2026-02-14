// utils/geminiService.js

// Use the stable 1.5-flash model
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const getGeminiApiKey = () => process.env.GEMINI_API_KEY;

// Log status on first access
let hasLoggedWarning = false;
const checkGeminiKey = () => {
  if (!hasLoggedWarning && !getGeminiApiKey()) {
    console.warn('Warning: GEMINI_API_KEY is not set. Real-time feature generation will fail.');
    hasLoggedWarning = true;
  }
};

/**
 * Generate product features using Gemini API with web search
 * @param {string} productTitle - The product title/name
 * @returns {Promise<Array>} Array of feature strings
 */
export const generateFeaturesWithGemini = async (productTitle) => {
  checkGeminiKey();
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    return []; // Return empty array gracefully
  }

  try {
    const prompt = `You are a product specifications expert. Based on the product title "${productTitle}", generate a list of 5-6 realistic and accurate product features.

Format your response as a JSON object with a single key "features" containing an array of strings. Each feature should be:
- Accurate to the actual product
- Concise (1-2 sentences max)
- Specific and relevant
- Listed as bullet point style text

Example format:
{
  "features": [
    "Feature 1 description",
    "Feature 2 description",
    "Feature 3 description"
  ]
}

Product Title: ${productTitle}

Generate realistic features based on current market products with this title. Search your knowledge base for authentic specifications.`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    };

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // ROBUST JSON EXTRACTION: Find the first '{' and the last '}'
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.warn('Could not extract JSON from Gemini response. Raw text:', responseText);
      return [];
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsedResponse.features)) {
      console.warn('Features is not an array in Gemini response:', parsedResponse);
      return [];
    }

    return parsedResponse.features;

  } catch (error) {
    console.error('Error generating features with Gemini:', error.message);
    return []; // Return empty array on failure so app doesn't crash
  }
};

/**
 * Generate product description using Gemini API
 * @param {string} productTitle - The product title/name
 * @param {Array} features - Array of feature strings
 * @returns {Promise<string>} Generated description
 */
export const generateDescriptionWithGemini = async (productTitle, features = []) => {
  checkGeminiKey();
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    return ''; // Return empty string gracefully
  }

  try {
    const featuresText = features.length > 0 
      ? `Key features context:\n${features.map(f => `- ${f}`).join('\n')}\n\n`
      : '';

    const prompt = `You are a professional product copywriter for a premium electronics store called NamKuku. 
    
Product Title: "${productTitle}"

${featuresText}

Task: Write a UNIQUE, DISTINCT, and COMPELLING marketing description for this specific product (2-3 sentences). 

Requirements:
1. Do NOT use generic templates. 
2. Focus specifically on the unique identity and key selling points of "${productTitle}".
3. Make it distinct from other similar product descriptions.
4. Use a professional, engaging tone.
5. If it's a "Renewed Premium" or "Second-hand" item, mention the value and quality assurance.

Return ONLY the description text, no JSON, no formatting, just the paragraph.`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300
      }
    };

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('Error generating description with Gemini:', error.message);
    return '';
  }
};

export const isGeminiAvailable = () => !!getGeminiApiKey();