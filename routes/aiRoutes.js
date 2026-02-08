import express from 'express';
import { generateFeaturesWithGemini, generateDescriptionWithGemini, isGeminiAvailable } from '../utils/geminiService.js';

const router = express.Router();

/**
 * Generate features for a product title
 * POST /api/ai/generate-features
 * Body: { title: string }
 * Returns: { features: string[] }
 */
router.post('/generate-features', async (req, res) => {
  try {
    if (!isGeminiAvailable()) {
      return res.status(500).json({ 
        error: 'Gemini API is not configured',
        features: []
      });
    }

    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Product title is required',
        features: []
      });
    }

    const trimmedTitle = title.trim();
    
    if (trimmedTitle.length < 3) {
      return res.status(400).json({ 
        error: 'Product title must be at least 3 characters',
        features: []
      });
    }

    console.log(`🔍 Generating features for product: "${trimmedTitle}"`);
    
    const features = await generateFeaturesWithGemini(trimmedTitle);
    
    console.log(`✓ Successfully generated ${features.length} features for "${trimmedTitle}"`);

    res.json({ 
      success: true,
      features: Array.isArray(features) ? features : []
    });

  } catch (error) {
    console.error('Error in generate-features endpoint:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to generate features',
      features: []
    });
  }
});

/**
 * Generate description for a product
 * POST /api/ai/generate-description
 * Body: { title: string, features?: string[] }
 * Returns: { description: string }
 */
router.post('/generate-description', async (req, res) => {
  try {
    if (!isGeminiAvailable()) {
      return res.status(500).json({ 
        error: 'Gemini API is not configured',
        description: ''
      });
    }

    const { title, features } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Product title is required',
        description: ''
      });
    }

    const trimmedTitle = title.trim();

    console.log(`📝 Generating description for product: "${trimmedTitle}"`);
    
    const description = await generateDescriptionWithGemini(
      trimmedTitle,
      Array.isArray(features) ? features : []
    );
    
    console.log(`✓ Successfully generated description for "${trimmedTitle}"`);

    res.json({ 
      success: true,
      description: description || ''
    });

  } catch (error) {
    console.error('Error in generate-description endpoint:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to generate description',
      description: ''
    });
  }
});

export default router;
