import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '600px',
          margin: '50px auto'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            🚨 Application Error
          </h2>
          <p style={{ marginBottom: '16px', color: '#6b7280' }}>
            Something went wrong while loading the dashboard.
          </p>
          <details style={{ marginBottom: '20px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
              Error Details
            </summary>
            <pre style={{ 
              background: '#f3f4f6', 
              padding: '12px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {this.state.error?.message}
              {this.state.error?.stack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
