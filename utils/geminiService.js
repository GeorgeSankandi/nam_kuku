// No need to import process - it's globally available in Node.js
// Read API key lazily at function call time instead of at module load
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
    throw new Error('GEMINI_API_KEY is not configured');
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
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500
      }
    };

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from Gemini response:', responseText);
      throw new Error('Could not parse JSON from Gemini response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsedResponse.features)) {
      throw new Error('Features is not an array in Gemini response');
    }

    return parsedResponse.features;

  } catch (error) {
    console.error('Error generating features with Gemini:', error.message);
    throw error;
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
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const featuresText = features.length > 0 
      ? `Key features:\n${features.map(f => `- ${f}`).join('\n')}\n\n`
      : '';

    const prompt = `You are a professional product copywriter. Based on the product title "${productTitle}", write a compelling but accurate product description.

${featuresText}

Create a concise marketing description (2-3 sentences) that:
- Highlights the product's main benefits
- Is accurate and not misleading
- Uses professional marketing language
- Is suitable for an e-commerce product page

Return only the description text, no JSON or additional formatting.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300
      }
    };

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('Error generating description with Gemini:', error.message);
    throw error;
  }
};

export const isGeminiAvailable = () => !!getGeminiApiKey();
