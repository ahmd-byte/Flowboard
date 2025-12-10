import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-gray-50 p-4">
      <div className="max-w-md w-full bg-neutral-900 dark:bg-neutral-900 light:bg-white rounded-2xl border border-neutral-800 dark:border-neutral-800 light:border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-neutral-400 dark:text-neutral-400 light:text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-neutral-500 dark:text-neutral-500 light:text-gray-500 cursor-pointer mb-2">
              Error details (development only)
            </summary>
            <div className="bg-neutral-800 dark:bg-neutral-800 light:bg-gray-100 rounded-lg p-4 text-xs text-red-400 dark:text-red-400 light:text-red-600 overflow-auto max-h-40">
              <div className="font-mono whitespace-pre-wrap">
                {error.toString()}
                {errorInfo && errorInfo.componentStack}
              </div>
            </div>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-neutral-800 dark:bg-neutral-800 light:bg-gray-100 hover:bg-neutral-700 dark:hover:bg-neutral-700 light:hover:bg-gray-200 text-white dark:text-white light:text-gray-900 px-4 py-2.5 rounded-xl font-medium transition-all"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;

