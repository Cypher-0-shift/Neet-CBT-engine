import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6 max-w-md">
            The application encountered an unexpected error. Your session data is safe, but you may need to reload the page to continue.
          </p>
          <div className="flex gap-4">
            <Button onClick={this.handleReload} className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Application
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-red-50 text-red-900 rounded-md text-left overflow-auto max-w-2xl w-full border border-red-200">
              <p className="font-mono text-sm whitespace-pre-wrap">{this.state.error.toString()}</p>
              <p className="font-mono text-xs mt-2 text-red-700 whitespace-pre-wrap">
                {this.state.error.stack}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
