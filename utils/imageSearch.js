/**
 * Utility to search for product images using the official Google Custom Search JSON API.
 * This is a robust replacement for the previous web-scraping method.
 *
 * REQUIRES two environment variables to be set:
 * 1. GOOGLE_SEARCH_API_KEY: Your API key from the Google Cloud Console.
 * 2. GOOGLE_CSE_ID: Your Custom Search Engine ID.
 */

// Lazily check for keys to avoid crashing the server on startup if not set.
const getApiKeys = () => {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cseId) {
    console.warn('WARNING: GOOGLE_SEARCH_API_KEY or GOOGLE_CSE_ID is not set in your .env file. AI Image Search will not work.');
    return null;
  }
  return { apiKey, cseId };
};

export const searchProductImages = async (query) => {
    const keys = getApiKeys();
    if (!keys) {
        throw new Error('Google Search API is not configured on the server.');
    }

    if (!query) return [];

    // Construct the API URL
    const searchParams = new URLSearchParams({
        key: keys.apiKey,
        cx: keys.cseId,
        q: query,
        searchType: 'image',
        num: 5, // Request 5 images
        imgSize: 'large', // Request large images for better quality
        safe: 'high'
    });
    
    const apiUrl = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Image Search API Error:', errorData.error.message);
            throw new Error(`Google API Error: ${errorData.error.message}`);
        }

        const data = await response.json();

        if (data && data.items) {
            // Extract the image links from the response
            const imageUrls = data.items.map(item => item.link).filter(Boolean);
            return imageUrls;
        }

        // Return empty if no items are found
        return [];

    } catch (error) {
        console.error('Failed to fetch images from Google Search API:', error.message);
        // Rethrow the error so the calling route can handle it
        throw error;
    }
};
