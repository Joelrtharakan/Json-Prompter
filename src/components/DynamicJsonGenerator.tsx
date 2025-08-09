import React, { useState, useEffect } from 'react';
import { llmService } from '../services/llmService';
import type { LLMProvider, ConvertResponse } from '../services/llmService';
import { Copy, Zap, Download, History, Sparkles } from 'lucide-react';
import './DynamicJsonGenerator.css';

interface PromptHistory {
  id: string;
  prompt: string;
  json: any;
  timestamp: string;
  provider: string;
}

const DynamicJsonGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [jsonResult, setJsonResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProvider] = useState<LLMProvider>({
    name: 'openrouter',
    model: 'anthropic/claude-3.5-sonnet'
  });
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [apiKey] = useState('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');
  const [examplePrompts, setExamplePrompts] = useState<string[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('prompt-history');

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Check backend availability and load examples
    checkBackendAndLoadExamples();
  }, []);

  const checkBackendAndLoadExamples = async () => {
    const examples = await llmService.getExamples();
    setExamplePrompts(examples);
  };

  const saveToHistory = (prompt: string, response: ConvertResponse) => {
    const newEntry: PromptHistory = {
      id: Date.now().toString(),
      prompt,
      json: response.json,
      timestamp: response.timestamp,
      provider: response.provider,
    };

    const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep only last 10
    setHistory(updatedHistory);
    localStorage.setItem('prompt-history', JSON.stringify(updatedHistory));
  };

  const handleConvert = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response: ConvertResponse;

      if (currentProvider.name === 'mock') {
        // Use mock service for demo
        response = llmService.mockConvertPromptToJSON(prompt);
      } else {
        // Use real API
        const providerWithKey = { ...currentProvider, apiKey };
        response = await llmService.convertPromptToJSON({
          prompt,
          provider: providerWithKey
        });
      }

      if (response.success) {
        setJsonResult(response.json);
        saveToHistory(prompt, response);
      } else {
        setError(response.error || 'Failed to generate JSON');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (jsonResult) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(jsonResult, null, 2));
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const downloadJSON = () => {
    if (jsonResult) {
      const blob = new Blob([JSON.stringify(jsonResult, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadFromHistory = (item: PromptHistory) => {
    setPrompt(item.prompt);
    setJsonResult(item.json);
  };

  return (
    <div className="dynamic-json-generator">
      <div className="header">
          <div className="header-content">
            <div className="title">
              <Sparkles className="title-icon" />
              <h1>Claude AI JSON Generator</h1>
            </div>
            <p className="subtitle">
              Transform natural language into structured JSON • Powered by Claude 3.5 Sonnet
            </p>
          </div>
      </div>

      <div className="main-content">
        <div className="input-section">
          <div className="input-header">
            <h2>Enter Your Prompt</h2>
            <span className="claude-badge">Powered by Claude 3.5 Sonnet</span>
          </div>
          
          <textarea
            className="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to do in natural language..."
            rows={4}
          />

          <div className="example-prompts">
            <h4>Try these examples:</h4>
            <div className="examples-grid">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  className="example-btn"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="convert-btn"
            onClick={handleConvert}
            disabled={isLoading || !prompt.trim()}
          >
            <Zap size={20} />
            {isLoading ? 'Converting...' : 'Convert to JSON'}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="output-section">
          <div className="output-header">
            <h2>Generated JSON</h2>
            {jsonResult && (
              <div className="output-actions">
                <button className="action-btn" onClick={copyToClipboard}>
                  <Copy size={16} />
                  Copy
                </button>
                <button className="action-btn" onClick={downloadJSON}>
                  <Download size={16} />
                  Download
                </button>
              </div>
            )}
          </div>

          <div className="json-output">
            {jsonResult ? (
              <pre>{JSON.stringify(jsonResult, null, 2)}</pre>
            ) : (
              <div className="empty-state">
                Your generated JSON will appear here
              </div>
            )}
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <History size={20} />
            <h3>Recent Conversions</h3>
          </div>
          <div className="history-grid">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="history-item"
                onClick={() => loadFromHistory(item)}
              >
                <div className="history-prompt">
                  {item.prompt.substring(0, 80)}...
                </div>
                <div className="history-meta">
                  {item.provider} • {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicJsonGenerator;
