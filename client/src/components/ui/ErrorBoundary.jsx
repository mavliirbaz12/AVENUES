import { Component, useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUpVariants } from '@/lib/animations';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child components
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log to error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // You can also log to a service like Sentry here
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorFallback Component
 * UI displayed when an error occurs
 */
export function ErrorFallback({ error, onRetry, showDetails = false }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[50vh] flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        
        <h2 className="font-display text-2xl font-bold text-white mb-3">
          Something went wrong
        </h2>
        
        <p className="text-white/60 mb-6">
          We apologize for the inconvenience. Please try again or contact support if the issue persists.
        </p>

        {showDetails && error && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-400 text-sm font-mono break-all">
              {error.message || error.toString()}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="btn-accent inline-flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <a
            href="/"
            className="btn-outline"
          >
            Go Home
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * SectionErrorBoundary Component
 * Error boundary for specific sections
 */
export function SectionErrorBoundary({ children, sectionName = 'content' }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="py-12 px-6">
          <ErrorFallback
            error={new Error(`Failed to load ${sectionName}`)}
            onRetry={() => window.location.reload()}
          />
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * AsyncErrorHandler Component
 * Handles errors in async operations
 */
export function useAsyncErrorHandler() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (asyncFunction, ...args) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return { error, isLoading, execute, clearError };
}

/**
 * NetworkError Component
 * Displayed when network request fails
 */
export function NetworkError({ onRetry }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
        <AlertCircle size={32} className="text-yellow-500" />
      </div>
      
      <h3 className="font-display text-xl font-bold text-white mb-2">
        Connection Error
      </h3>
      
      <p className="text-white/60 mb-6">
        Unable to connect to the server. Please check your internet connection.
      </p>

      <button
        onClick={onRetry}
        className="btn-accent"
      >
        Retry Connection
      </button>
    </motion.div>
  );
}

/**
 * NotFound Component
 * 404 page content
 */
export function NotFound({ resource = 'page' }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[60vh] flex items-center justify-center p-6"
    >
      <div className="text-center">
        <h1 className="font-display text-8xl font-bold text-white/10 mb-4">
          404
        </h1>
        <h2 className="font-display text-3xl font-bold text-white mb-4">
          {resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          The {resource} you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="btn-accent">
          Back to Home
        </a>
      </div>
    </motion.div>
  );
}
