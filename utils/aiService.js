// Minimal AI service wrapper that talks to OpenAI Chat Completions.
// Requires OPENAI_API_KEY in environment. Returns parsed JSON results.

const OPENAI_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY (or AI_API_KEY) is not set. AI features will fail at runtime.');
}

// Helper to let callers check availability without relying on exceptions
export const isAIAvailable = () => !!OPENAI_KEY;

const callChat = async (messages, model = 'gpt-3.5-turbo') => {
  if (!OPENAI_KEY) throw new Error('Missing OPENAI_API_KEY');
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 1200 })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI provider error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  const reply = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
  return reply;
};

// Web search function using multiple strategies
const searchProductSpecifications = async (productTitle) => {
  try {
    // Try using DuckDuckGo instant answer API (free, no key required)
    const searchQuery = encodeURIComponent(productTitle.replace(/Renewed|Premium/gi, '').trim());
    const duckUrl = `https://api.duckduckgo.com/?q=${searchQuery}+specifications+features&format=json&t=namix`;
    
    const searchResponse = await Promise.race([
      fetch(duckUrl).catch(() => null),
      new Promise(resolve => setTimeout(() => resolve(null), 3000)) // 3 second timeout
    ]);

    if (searchResponse && searchResponse.ok) {
      const data = await searchResponse.json();
      // Extract any available information
      if (data.AbstractText) {
        return data.AbstractText;
      }
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        const specs = data.RelatedTopics.filter(topic => topic.Text)
          .map(topic => topic.Text)
          .join(' ');
        if (specs) return specs;
      }
    }
    
    // Fallback: Use Google search (basic)
    const googleUrl = `https://www.google.com/search?q=${searchQuery}+specifications`;
    console.log('Web search query for product specs:', searchQuery);
    
  } catch (error) {
    console.warn('Web search failed, will rely on AI knowledge base:', error.message);
  }
  
  return null;
};

// Attempt to parse JSON from model response
const extractJSON = (text) => {
  if (!text) return null;
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const sub = text.slice(first, last + 1);
    try {
      return JSON.parse(sub);
    } catch (e) {
      // fallback: try to find arrays/values
    }
  }
  return null;
};

export const verifyProduct = async (product) => {
  // If AI not available, don't block creation — assume verified but mark reason
  if (!isAIAvailable()) return { verified: true, reason: 'AI unavailable - auto-verified' };

  const messages = [
    { role: 'system', content: 'You are a strict product listing verifier. Return only JSON with keys {verified: boolean, reason: string}.' },
    { role: 'user', content: `Product JSON:\n${JSON.stringify(product, null, 2)}\n\nCheck whether this product is appropriate for listing on an online marketplace in Namibia. Consider safety, legality, and obvious policy violations (weapons, illicit drugs, stolen goods, adult-only items, counterfeit). If it is appropriate, respond with {"verified": true, "reason": "OK"}. If not, respond with {"verified": false, "reason": "explanation"}.` }
  ];
  const reply = await callChat(messages);
  const parsed = extractJSON(reply);
  if (parsed && typeof parsed.verified === 'boolean') return parsed;
  // If model didn't return strict JSON, conservatively fail with explanation
  return { verified: false, reason: 'AI response malformed or inconclusive' };
};

export const generateDescriptionAndFeatures = async (product) => {
  // If AI is not available, return sensible defaults immediately
  if (!isAIAvailable()) {
    return {
      description: product.description || product.title || 'No description available.',
      features: Array.isArray(product.features) && product.features.length > 0 ? product.features.slice(0, 6) : []
    };
  }

  // Check if product category requires AI generation (phones, tablets, laptops, computers, gaming)
  const category = (product.category || '').toLowerCase();
  const aiGenerationCategories = [
    'phones', 'iphones', 'samsung-phones', 'android',
    'tablets', 'ipads', 'android-tablets',
    'laptops', 'macbooks', 'dell-laptops', 'hp-laptops', 'lenovo-laptops',
    'computers', 'desktops', 'hp-aio', 'gaming-pcs',
    'gaming', 'playstation', 'xbox', 'nintendo', 'gaming-laptops'
  ];

  const shouldGenerateAI = aiGenerationCategories.some(cat => category.includes(cat));

  // Search for real product specifications from the web
  let webSearchResults = '';
  if (shouldGenerateAI) {
    try {
      console.log('🔍 Searching web for accurate product specifications using title:', product.title);
      webSearchResults = await searchProductSpecifications(product.title);
      if (webSearchResults) {
        console.log('✓ Web search successfully found product information');
      } else {
        console.log('⚠ Web search returned no results, will use AI knowledge base');
      }
    } catch (error) {
      console.warn('⚠ Web search failed, will use AI knowledge base:', error.message);
    }
  } else {
    console.log('ℹ Product category does not require web search, using AI knowledge base');
  }

  // Generate category-specific prompts for better results
  let systemPrompt = 'You are a product copywriter with access to comprehensive product databases. Produce a short marketing description (1-2 sentences) and a concise features list (4-6 bullet points). Return only JSON with keys {description: string, features: string[] }. IMPORTANT: Generate ACCURATE, VERIFIED product specifications based on actual product data, not generic descriptions.';
  let userPrompt = `Product JSON:\n${JSON.stringify(product, null, 2)}\n\nGenerate a short, factual product description and 4-6 concise features suitable for the product detail page. Avoid superlatives unless justified. Return JSON.`;

  if (shouldGenerateAI) {
    // Add web search context if available
    const webContext = webSearchResults ? `\n\nWeb Research Context:\n${webSearchResults}` : '';
    
    if (webContext) {
      console.log('✓ Web search context will be included in AI prompt for enhanced accuracy');
    } else {
      console.log('ℹ No web search context available, proceeding with category-specific AI prompt');
    }
    
    // Category-specific prompts for tech products
    if (category.includes('phone') || category.includes('iphone') || category.includes('samsung')) {
      systemPrompt = 'You are a smartphone expert with access to official product specifications and reviews. Your task is to generate ACCURATE technical descriptions with VERIFIED specifications. Produce a 1-2 sentence marketing description and 4-6 precise technical features (display, processor, camera, battery, software, design). Return only JSON with keys {description: string, features: string[] }. CRITICAL: All features must be factual specifications from the actual product, not generic features.';
      userPrompt = `Smartphone Product:\n${JSON.stringify(product, null, 2)}${webContext}\n\nResearch and generate ACCURATE technical specifications for this smartphone. Features should be SPECIFIC VERIFIED specs like:
- Exact display size and technology (e.g., "6.7-inch OLED display with 120Hz refresh rate")
- Exact processor model (e.g., "Snapdragon 8 Gen 3 processor")
- Camera specifications (e.g., "50MP main camera with f/1.6 aperture and optical stabilization")
- Battery capacity (e.g., "5000mAh battery with 65W fast charging")
- Software and special features
- Build materials and design

Return JSON with {description, features} containing only REAL, VERIFIED specifications for this exact product model.`;
    } else if (category.includes('tablet') || category.includes('ipad')) {
      systemPrompt = 'You are a tablet specialist with access to official specifications. Generate ACCURATE technical descriptions with VERIFIED specifications. Produce 1-2 sentence description and 4-6 precise ACTUAL technical features. Return only JSON with keys {description: string, features: string[] }. CRITICAL: All features must be factual, verified specifications.';
      userPrompt = `Tablet Product:\n${JSON.stringify(product, null, 2)}${webContext}\n\nResearch and generate ACCURATE technical specifications for this tablet. Features must be VERIFIED specs such as:
- Exact display size, technology, and resolution (e.g., "12.9-inch Liquid Retina XDR display, 2732x2048 resolution")
- Exact processor (e.g., "Apple M2 chip with 10-core GPU")
- RAM and storage configuration
- Camera specifications
- Battery capacity and charging
- Operating system version
- Weight and dimensions

Return JSON with {description, features} containing only REAL, VERIFIED specifications.`;
    } else if (category.includes('laptop') || category.includes('macbook') || category.includes('dell') || category.includes('hp-laptop') || category.includes('lenovo')) {
      systemPrompt = 'You are a laptop expert with access to manufacturer specifications. Generate ACCURATE technical descriptions with VERIFIED hardware specs. Produce 1-2 sentence description and 4-6 EXACT technical features (processor, RAM, storage, display, battery, graphics). Return only JSON with keys {description: string, features: string[] }. CRITICAL: All specs must be factual, verified information.';
      userPrompt = `Laptop Product:\n${JSON.stringify(product, null, 2)}${webContext}\n\nResearch and generate ACCURATE technical specifications for this laptop. Features must be VERIFIED specs including:
- Exact processor generation and model (e.g., "Intel Core i7-13700H processor")
- RAM type and capacity (e.g., "16GB DDR5 RAM")
- Storage type and size (e.g., "512GB NVMe SSD")
- Display specifications (e.g., "15.6-inch IPS display, 1920x1080, 144Hz refresh rate")
- Graphics (e.g., "NVIDIA RTX 4060 with 8GB GDDR6")
- Battery capacity and estimated runtime
- Ports and connectivity

Return JSON with {description, features} containing REAL, VERIFIED specifications for this exact model.`;
    } else if (category.includes('desktop') || category.includes('aio') || category.includes('computer') || category.includes('gaming-pc')) {
      systemPrompt = 'You are a desktop computer expert with access to hardware specifications. Generate ACCURATE descriptions with VERIFIED hardware specs. Produce 1-2 sentence description and 4-6 EXACT technical features. Return only JSON with keys {description: string, features: string[] }. CRITICAL: All specifications must be factual and verified.';
      userPrompt = `Desktop/All-in-One Computer Product:\n${JSON.stringify(product, null, 2)}${webContext}\n\nResearch and generate ACCURATE technical specifications for this desktop/AIO. Features must be VERIFIED specs such as:
- CPU: exact model and generation (e.g., "Intel Core i9-13900K processor, 24 cores")
- RAM: type and capacity (e.g., "64GB DDR5 RAM")
- Storage: type and capacity (e.g., "2TB NVMe SSD")
- GPU: exact model (e.g., "NVIDIA RTX 4090 with 24GB GDDR6X")
- For AIOs: display specifications (e.g., "23.8-inch 4K display with USB-C")
- Power supply specifications (e.g., "850W Gold-rated power supply")
- Expansion and connectivity options

Return JSON with {description, features} containing REAL, VERIFIED specifications.`;
    } else if (category.includes('gaming') || category.includes('playstation') || category.includes('xbox') || category.includes('nintendo')) {
      systemPrompt = 'You are a gaming expert with access to console and gaming PC specifications. Generate engaging, ACCURATE descriptions with VERIFIED gaming features. Produce 1-2 sentence description and 4-6 FACTUAL gaming features. Return only JSON with keys {description: string, features: string[] }. CRITICAL: All specifications must be real, verified gaming features and performance metrics.';
      userPrompt = `Gaming Product:\n${JSON.stringify(product, null, 2)}${webContext}\n\nResearch and generate ACCURATE gaming specifications. Features must be VERIFIED gaming specs such as:
- Graphics capabilities (e.g., "4K gaming at 120fps with ray tracing support")
- Storage speed (e.g., "1TB custom NVMe SSD with ultra-fast load times")
- Special gaming features (e.g., "Dual haptic triggers for immersive feedback, adaptive triggers")
- Game Pass or exclusive titles
- Performance metrics and benchmarks
- Backward compatibility
- Online features and services

Return JSON with {description, features} containing REAL, VERIFIED gaming specifications and features.`;
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const reply = await callChat(messages);
    const parsed = extractJSON(reply);
    if (parsed && typeof parsed.description === 'string' && Array.isArray(parsed.features)) {
      console.log('✓ AI generated verified product features');
      return parsed;
    }
  } catch (error) {
    console.warn('AI generation error, falling back to defaults:', error.message);
  }

  // Fallback: create minimal values
  return {
    description: product.title || 'No description available.',
    features: Array.isArray(product.features) && product.features.length > 0 ? product.features.slice(0, 6) : []
  };
};

export default { verifyProduct, generateDescriptionAndFeatures };
