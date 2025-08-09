import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for LLM
const SYSTEM_PROMPT = `You are a JSON architect. Given a user's natural language request, design a clean, structured JSON representation that captures all relevant information and parameters.

Rules:
1. Return ONLY valid JSON, no explanations or markdown
2. Use camelCase for keys
3. Include all relevant parameters from the user's request
4. Add a "task" field describing the main action
5. Be comprehensive but concise
6. Ensure the JSON can be fed into any LLM or system

Example:
Input: "Write a Python function to scrape the top 5 news headlines and save them to a CSV"
Output: {"task":"write code","language":"Python","functionality":"scrape top 5 news headlines","outputFormat":"CSV","dataSource":"news websites","limit":5}`;

// OpenAI API call
async function callOpenAI(prompt, apiKey, model = 'gpt-4o-mini') {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content?.trim();
  
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}

// OpenRouter API call
async function callOpenRouter(prompt, apiKey, model = 'anthropic/claude-3.5-sonnet') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001', // Required by OpenRouter
      'X-Title': 'Dynamic JSON Prompt Generator', // Optional
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenRouter response:', JSON.stringify(data, null, 2));
  
  const content = data.choices[0]?.message?.content?.trim();
  
  if (!content) {
    throw new Error('No response from OpenRouter');
  }

  // Clean up the response - remove markdown code blocks if present
  let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(cleanContent);
}

// Google Gemini API call
async function callGemini(prompt, apiKey, model = 'gemini-1.5-flash') {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nUser request: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Gemini response:', JSON.stringify(data, null, 2));
  
  const content = data.candidates[0]?.content?.parts[0]?.text?.trim();
  
  if (!content) {
    throw new Error('No response from Gemini');
  }

  // Clean up the response - remove markdown code blocks if present
  let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(cleanContent);
}

// Mock/demo JSON generation
function mockConvertPromptToJSON(prompt) {
  const words = prompt.toLowerCase().split(' ');
  
  let mockJson = {
    task: "process request",
    inputType: "natural language",
    timestamp: new Date().toISOString()
  };

  // Simple keyword detection
  if (words.includes('write') || words.includes('code') || words.includes('function')) {
    mockJson.task = "write code";
    if (words.includes('python')) mockJson.language = "Python";
    if (words.includes('javascript')) mockJson.language = "JavaScript";
    if (words.includes('typescript')) mockJson.language = "TypeScript";
  }

  if (words.includes('scrape') || words.includes('crawl')) {
    mockJson.functionality = "web scraping";
  }

  if (words.includes('csv')) mockJson.outputFormat = "CSV";
  if (words.includes('json')) mockJson.outputFormat = "JSON";
  if (words.includes('xml')) mockJson.outputFormat = "XML";

  if (words.includes('email')) mockJson.contentType = "email";
  if (words.includes('marketing')) mockJson.purpose = "marketing";

  const numberMatch = prompt.match(/\\d+/);
  if (numberMatch) mockJson.limit = parseInt(numberMatch[0]);

  return mockJson;
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dynamic JSON Prompt Generator API is running' });
});

// Convert prompt to JSON
app.post('/convert', async (req, res) => {
  try {
    const { prompt, provider, apiKey, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }

    let jsonResult;

    switch (provider) {
      case 'openai':
        if (!apiKey) {
          return res.status(400).json({ 
            success: false, 
            error: 'API key is required for OpenAI' 
          });
        }
        jsonResult = await callOpenAI(prompt, apiKey, model);
        break;

      case 'openrouter':
        if (!apiKey) {
          return res.status(400).json({ 
            success: false, 
            error: 'API key is required for OpenRouter' 
          });
        }
        jsonResult = await callOpenRouter(prompt, apiKey, model);
        break;

      case 'gemini':
        if (!apiKey) {
          return res.status(400).json({ 
            success: false, 
            error: 'API key is required for Gemini' 
          });
        }
        jsonResult = await callGemini(prompt, apiKey, model);
        break;

      case 'mock':
      default:
        jsonResult = mockConvertPromptToJSON(prompt);
        break;
    }

    res.json({
      success: true,
      json: jsonResult,
      provider: provider || 'mock',
      model: model || 'demo-model',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert prompt to JSON',
      provider: req.body.provider || 'unknown',
      model: req.body.model || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
});

// Example prompts
app.get('/examples', (req, res) => {
  const examples = [
    "Write a Python function to scrape the top 5 news headlines and save them to a CSV",
    "Generate a marketing email for a coffee shop promoting a new latte flavor",
    "Create a REST API endpoint for user authentication with JWT tokens",
    "Build a React component for a file upload with drag and drop",
    "Design a database schema for an e-commerce platform",
    "Develop a machine learning model to predict stock prices",
    "Create a chatbot for customer service automation",
    "Build a mobile app for expense tracking with categories"
  ];

  res.json({ examples });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dynamic JSON Prompt Generator API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Convert endpoint: http://localhost:${PORT}/convert`);
});
