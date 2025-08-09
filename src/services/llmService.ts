/**
 * LLM Service for Dynamic JSON Generation
 * Supports multiple providers: OpenAI, Google Gemini, local models, and backend API
 */

export interface LLMProvider {
  name: string;
  apiKey?: string;
  endpoint?: string;
  model: string;
}

export interface ConvertRequest {
  prompt: string;
  provider: LLMProvider;
}

export interface ConvertResponse {
  json: any;
  provider: string;
  model: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class LLMService {
  // Use backend API for all conversions (recommended approach)
  private async callBackendAPI(request: ConvertRequest): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        provider: request.provider.name,
        apiKey: request.provider.apiKey,
        model: request.provider.model,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Backend conversion failed');
    }

    return data.json;
  }

  async convertPromptToJSON(request: ConvertRequest): Promise<ConvertResponse> {
    try {
      // Try backend API first
      try {
        const jsonResult = await this.callBackendAPI(request);
        return {
          json: jsonResult,
          provider: request.provider.name,
          model: request.provider.model,
          timestamp: new Date().toISOString(),
          success: true,
        };
      } catch (backendError) {
        console.warn('Backend API unavailable, falling back to mock:', backendError);
        
        // Fallback to mock if backend is unavailable
        if (request.provider.name === 'mock') {
          const mockResult = this.mockConvertPromptToJSON(request.prompt);
          return mockResult;
        } else {
          throw new Error('Backend API is required for real LLM providers. Please start the backend server or use demo mode.');
        }
      }
    } catch (error) {
      return {
        json: null,
        provider: request.provider.name,
        model: request.provider.model,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Mock/demo method for when no API keys are available
  mockConvertPromptToJSON(prompt: string): ConvertResponse {
    // Simple rule-based JSON generation for demo purposes
    const words = prompt.toLowerCase().split(' ');
    
    let mockJson: any = {
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

    const numberMatch = prompt.match(/\d+/);
    if (numberMatch) mockJson.limit = parseInt(numberMatch[0]);

    return {
      json: mockJson,
      provider: "mock",
      model: "demo-model",
      timestamp: new Date().toISOString(),
      success: true,
    };
  }

  // Check if backend is available
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get example prompts from backend
  async getExamples(): Promise<string[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/examples`);
      if (response.ok) {
        const data = await response.json();
        return data.examples || [];
      }
    } catch {
      // Fallback examples
    }
    
    return [
      "Write a Python function to scrape the top 5 news headlines and save them to a CSV",
      "Generate a marketing email for a coffee shop promoting a new latte flavor",
      "Create a REST API endpoint for user authentication with JWT tokens",
      "Build a React component for a file upload with drag and drop",
      "Design a database schema for an e-commerce platform",
    ];
  }
}

export const llmService = new LLMService();
