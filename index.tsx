import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ef4444', backgroundColor: '#09090b', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>Something went wrong.</h1>
          <pre style={{backgroundColor: '#18181b', padding: '1rem', borderRadius: '0.5rem', maxWidth: '800px', overflow: 'auto'}}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: '#3f3f46', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);