import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-rose-950/30 border border-rose-800/60 rounded-xl m-4 text-center">
          <div className="p-3 bg-rose-900/40 rounded-full text-rose-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-rose-200 mb-2">
            {this.props.fallbackTitle || 'Rendering Error Encountered'}
          </h3>
          <p className="text-sm text-rose-300/80 max-w-lg mb-4">
            {this.state.error?.message || 'An unexpected rendering error occurred while displaying table contents.'}
          </p>

          {this.state.error?.stack && (
            <pre className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-rose-400/90 font-mono text-left max-w-2xl w-full overflow-x-auto mb-4 max-h-40">
              {this.state.error.stack}
            </pre>
          )}

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-rose-900/30 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
