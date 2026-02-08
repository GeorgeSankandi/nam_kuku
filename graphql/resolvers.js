import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/productModel.js';
import { categoryData } from '../utils/categoryData.js';

const validNavigationTargets = Object.keys(categoryData).map(key => `#category/${key}`);
validNavigationTargets.push('#home', '#about', '#contact', '#cart', '#trade-in');

export const resolvers = {
  Query: {
    products: async () => {
      return Product.find({});
    },
    
    askChatbot: async (_, { question }) => {
      const genAI = process.env.GEMINI_API_KEY
          ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
          : null;

      if (!genAI) {
        console.error("[SERVER] GEMINI_API_KEY is not set. The chatbot cannot function.");
        return { 
            reply: "The AI assistant is not configured correctly on the server.",
            navigationTarget: null,
            highlightProductId: null
        };
      }
      
      let rawText = ''; 
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const allProducts = await Product.find({});
        const productContext = allProducts.map(p => 
            `- Product ID: ${p.productId}, Title: ${p.title}, Price: N$${p.currentPrice}, Category: ${p.category}, Stock: ${p.stock !== undefined ? p.stock + ' left' : 'Not tracked'}, Features: [${(p.features || []).join(', ')}]`
        ).join('\n');

        const prompt = `
          You are a sophisticated AI assistant for an online electronics store called NAMIX. Your task is to provide helpful, conversational replies and determine appropriate actions based on user queries. You must always respond in a valid JSON format.

          The user's query is: "${question}"

          Based on the user's query and the provided context of our entire product database, perform the following tasks:

          1.  **Generate a Text Reply:**
              *   Create a friendly, concise, and helpful answer.
              *   If the user asks for specific product details (like stock, features, or price), provide them accurately from the context.
              *   If the user asks a general question, answer it conversationally.
              *   If a user's search for a product yields no results, check the context for the most similar product based on keywords or category and suggest it. For example: "We don't have that exact model, but we do have the [Similar Product Name], which is very popular. Would you like to see it?"

          2.  **Determine a Navigation Target:**
              *   If your reply suggests a similar product, set this to that product's page URL (e.g., "#product/16pro128").
              *   If the user explicitly asks to see a product you've just discussed, set this to its product page URL.
              *   If the user asks to see a category page (e.g., "show me laptops"), set this to the corresponding URL from the "VALID NAVIGATION TARGETS" list.
              *   In all other cases, this MUST be null.

          3.  **Determine a Highlight Product ID:**
              *   If your reply is specifically about a single product from the context, return its exact "Product ID" here.
              *   If your reply is general, suggests a similar product, or discusses multiple products, this MUST be null.

          ---
          CONTEXT (Full Product Database):
          ${productContext}
          ---
          VALID NAVIGATION TARGETS:
          ${validNavigationTargets.join(', ')}
          (plus any specific product page like #product/PRODUCT_ID)
          ---
          Your final response MUST be a single valid JSON object with three keys: "reply" (a string), "navigationTarget" (a string from the list or null), and "highlightProductId" (a string Product ID from the context or null).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawText = response.text();

        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResponse = JSON.parse(cleanJson);

        let navigationTarget = parsedResponse.navigationTarget || null;
        if (navigationTarget && !validNavigationTargets.includes(navigationTarget) && !navigationTarget.startsWith('#product/')) {
          navigationTarget = null; // Sanitize to prevent invalid navigation
        }

        let highlightProductId = parsedResponse.highlightProductId || null;
        if (highlightProductId) {
          const productExists = allProducts.some(p => p.productId === highlightProductId);
          if (!productExists) {
            highlightProductId = null; // Sanitize if product doesn't exist
          } else {
            // If we are highlighting a product, we should always navigate to it.
            navigationTarget = `#product/${highlightProductId}`;
          }
        }

        return {
            reply: parsedResponse.reply || "I'm not sure how to answer that. Could you rephrase?",
            navigationTarget,
            highlightProductId
        };

      } catch (error) {
        console.error('[SERVER] Error in askChatbot resolver:', error);
        if (rawText) {
          console.error('[SERVER] Raw AI response that may have caused the error:', rawText);
        }
        return { 
            reply: "I'm having a little trouble thinking right now. Please try asking in a different way.",
            navigationTarget: null,
            highlightProductId: null
        };
      }
    },
  },
};