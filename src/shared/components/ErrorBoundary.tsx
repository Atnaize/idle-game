import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches React errors and prevents full app crashes
 * Provides a fallback UI and option to reset the error state
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.resetError);
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800/90 backdrop-blur rounded-lg shadow-2xl border border-purple-500/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">⚠️</div>
              <h1 className="text-2xl font-bold text-red-400">
                Something went wrong
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-200 mb-2">
                  Error Message:
                </h2>
                <div className="bg-gray-900/50 rounded p-4 text-red-300 font-mono text-sm">
                  {this.state.error.toString()}
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo.componentStack && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-200 mb-2">
                    Component Stack:
                  </h2>
                  <div className="bg-gray-900/50 rounded p-4 text-gray-400 font-mono text-xs overflow-auto max-h-64">
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={this.resetError}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Reset Game & Reload
                </button>
              </div>

              <p className="text-sm text-gray-400 mt-4">
                If this error persists, please report it with the error message above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
