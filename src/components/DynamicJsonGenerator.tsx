import React, { useState, useEffect } from 'react';
import { llmService } from '../services/llmService';
import type { LLMProvider, ConvertResponse } from '../services/llmService';
import { Copy, Zap, Download, History, Sparkles, Clock, Trash2, FileText, Lightbulb, Target, Cpu, ArrowRight } from 'lucide-react';
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
  const [apiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [examplePrompts, setExamplePrompts] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  // Auto-dismiss why card after 5 seconds
  useEffect(() => {
    if (showWhyModal) {
      const timer = setTimeout(() => setShowWhyModal(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWhyModal]);

  // Load settings from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('prompt-history');

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Check if API key is configured
    if (!apiKey) {
      setError('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
      return;
    }

    // Check backend availability and load examples
    checkBackendAndLoadExamples();
  }, [apiKey]);

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
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('prompt-history');
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('prompt-history', JSON.stringify(updatedHistory));
  };

  const displayHistory = history.slice(0, 10); // Show only last 10 items

  return (
    <div className="dynamic-json-generator">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <Sparkles className="title-icon" size={32} />
            <div>
              <h1
                style={{ cursor: 'pointer' }}
                onClick={() => setShowWhyModal(true)}
                title="Why Convert Text to JSON for AI Models?"
              >
                JSON Prompter
              </h1>
              <p className="subtitle">Professional AI-Powered JSON Generation</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="status-indicator">
              <div className="status-dot active"></div>
              <span>Claude AI Ready</span>
            </div>
            <button 
              className="history-toggle-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History size={20} />
              History ({history.length})
            </button>
          </div>
        </div>
      </header>

      {/* Why Card Popup Notification */}
      {showWhyModal && (
        <div className="why-card why-card-notification">
          <button className="why-card-close" onClick={() => setShowWhyModal(false)}>&times;</button>
          <div className="why-content">
            <div className="why-header">
              <Lightbulb className="why-icon" size={20} />
              <h3>Why Convert Text to JSON for AI Models?</h3>
            </div>
            <div className="why-benefits">
              <div className="benefit-item">
                <Target className="benefit-icon" size={14} />
                <div className="benefit-text">
                  <strong>Better Structure:</strong> JSON provides clear, hierarchical data organization
                </div>
              </div>
              <div className="benefit-item">
                <Cpu className="benefit-icon" size={14} />
                <div className="benefit-text">
                  <strong>Improved Processing:</strong> AI models understand structured data better
                </div>
              </div>
              <div className="benefit-item">
                <ArrowRight className="benefit-icon" size={14} />
                <div className="benefit-text">
                  <strong>Enhanced Outputs:</strong> Structured prompts result in higher-quality AI content
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="app-content">
        {/* Main Layout */}
        <div className={`main-layout ${showHistory ? 'with-history' : ''}`}>
          {/* Input Panel */}
          <div className="input-panel">
            <div className="panel-header">
              <h2>
                <Zap className="section-icon" size={20} />
                Input Prompt
              </h2>
            </div>
            <div className="input-content">
              <textarea
                className="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the JSON structure you want to create...

Professional Examples:
• Employee database with personal details and roles
• Product inventory with pricing and availability
• Customer order with items and billing information
• Project management with tasks and deadlines"
              />
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              <button
                className="generate-btn"
                onClick={handleConvert}
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <>
                    <Sparkles size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Generate JSON
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="output-panel">
            <div className="panel-header">
              <h2>
                <FileText className="section-icon" size={20} />
                Generated JSON
              </h2>
              {jsonResult && (
                <div className="output-actions">
                  <button className="action-btn" onClick={copyToClipboard}>
                    <Copy size={16} />
                    Copy
                  </button>
                  <button className="action-btn" onClick={downloadJSON}>
                    <Download size={16} />
                    Export
                  </button>
                </div>
              )}
            </div>
            <div className="output-content">
              <div className="json-output">
                {jsonResult ? (
                  <pre>{JSON.stringify(jsonResult, null, 2)}</pre>
                ) : (
                  <div className="empty-state">
                    <Sparkles size={48} />
                    <h3>Ready to Generate</h3>
                    <p>Your structured JSON output will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="history-panel">
              <div className="panel-header">
                <h2>
                  <History className="section-icon" size={20} />
                  Prompt History
                </h2>
                <div className="history-actions">
                  {history.length > 0 && (
                    <button className="clear-btn" onClick={clearHistory}>
                      <Trash2 size={16} />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              <div className="history-content">
                {displayHistory.length > 0 ? (
                  <div className="history-list">
                    {displayHistory.map((item) => (
                      <div key={item.id} className="history-item">
                        <div className="history-preview">
                          <div className="history-prompt">
                            {item.prompt.length > 100 
                              ? `${item.prompt.substring(0, 100)}...` 
                              : item.prompt}
                          </div>
                          <div className="history-meta">
                            <Clock size={14} />
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="history-controls">
                          <button 
                            className="load-btn"
                            onClick={() => loadFromHistory(item)}
                          >
                            Load
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteHistoryItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-history">
                    <History size={48} />
                    <h3>No History Yet</h3>
                    <p>Generated prompts will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicJsonGenerator;
