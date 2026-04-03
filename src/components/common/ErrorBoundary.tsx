import React, { Component, ErrorInfo, ReactNode } from 'react';
import { playSound } from '../../utils/sound-effects';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Play error sound
    playSound('error').catch(() => {
      // Silently fail if sound doesn't play
    });

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    playSound('click').catch(() => {});
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    playSound('click').catch(() => {});
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-gradient-to-br from-rose-900/20 to-slate-900 border border-rose-500/30 rounded-3xl p-8 space-y-6">
              {/* Error Icon */}
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">⚠️</div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-slate-400">
                  We encountered an unexpected error. Don't worry, your funds are safe.
                </p>
              </div>

              {/* Error Details (Collapsible) */}
              <details className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                <summary className="text-sm font-bold text-slate-300 cursor-pointer hover:text-white transition-colors">
                  Technical Details (for developers)
                </summary>
                <div className="mt-4 space-y-3">
                  {this.state.error && (
                    <div>
                      <div className="text-xs font-bold text-rose-400 mb-1">Error:</div>
                      <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <div className="text-xs font-bold text-rose-400 mb-1">Component Stack:</div>
                      <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Reload Page
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center text-xs text-slate-500">
                If the problem persists, please{' '}
                <a
                  href="https://github.com/x5engine/SuiCompass-Protocol/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  report this issue
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
