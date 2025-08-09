import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Error:', error)
    console.error('Error Info:', errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <AlertTriangle size={48} />
            </div>
            <h2>Something went wrong</h2>
            <p>
              The application encountered an unexpected error. This has been logged
              for investigation.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Technical Details (Development Mode)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button className="btn-primary" onClick={this.handleReset}>
                <RefreshCw size={16} />
                Try Again
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// CSS styles for the error boundary (add to your main CSS file)
export const errorBoundaryStyles = `
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.error-content h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #ffffff;
}

.error-content p {
  margin: 0 0 24px 0;
  color: #cccccc;
  line-height: 1.5;
}

.error-details {
  margin: 24px 0;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.error-stack {
  background-color: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #ef4444;
  overflow-x: auto;
  white-space: pre-wrap;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
`
