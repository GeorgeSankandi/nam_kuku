import express from 'express';
import { generateFeaturesWithGemini, generateDescriptionWithGemini, isGeminiAvailable } from '../utils/geminiService.js';
import { searchProductImages } from '../utils/imageSearch.js';

const router = express.Router();

// Route: POST /api/ai/generate-features
router.post('/generate-features', async (req, res) => {
    try {
        const { title } = req.body;
        console.log(`[AI Route] Requesting features for: "${title}"`);
        
        if (!title) return res.status(400).json({ error: 'Title required' });

        if (!isGeminiAvailable()) {
            console.warn('[AI Route] Gemini API key missing');
            return res.json({ success: false, features: [] });
        }

        const features = await generateFeaturesWithGemini(title);
        console.log(`[AI Route] Features generated: ${features.length}`);
        res.json({ success: true, features });
    } catch (error) {
        console.error('[AI Route] Features Error:', error);
        res.status(500).json({ error: 'Failed to generate features' });
    }
});

// Route: POST /api/ai/generate-description
router.post('/generate-description', async (req, res) => {
    try {
        const { title, features } = req.body;
        console.log(`[AI Route] Requesting description for: "${title}"`);
        
        if (!title) return res.status(400).json({ error: 'Title required' });

        if (!isGeminiAvailable()) {
            console.warn('[AI Route] Gemini API key missing');
            return res.json({ success: false, description: '' });
        }

        const description = await generateDescriptionWithGemini(title, features);
        console.log(`[AI Route] Description generated (${description.length} chars)`);
        res.json({ success: true, description });
    } catch (error) {
        console.error('[AI Route] Description Error:', error);
        res.status(500).json({ error: 'Failed to generate description' });
    }
});

// Route: POST /api/ai/generate-images
router.post('/generate-images', async (req, res) => {
    try {
        const { title } = req.body;
        console.log(`[AI Route] Requesting images for: "${title}"`);
        
        if (!title) return res.status(400).json({ error: 'Title required' });

        const images = await searchProductImages(title);
        console.log(`[AI Route] Images found: ${images.length}`);
        res.json({ success: true, images });
    } catch (error) {
        console.error('[AI Route] Image Error:', error);
        res.status(500).json({ error: 'Failed to find images', images: [] });
    }
});

export default router;

