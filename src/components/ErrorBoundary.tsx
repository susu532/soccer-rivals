import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-2">
              Something went wrong
            </h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-6">
              The application encountered an error
            </p>

            <div className="bg-black/40 rounded-2xl p-4 mb-8 text-left overflow-hidden">
              <p className="text-red-400 font-mono text-xs break-words">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-vibrant-cyan hover:bg-vibrant-cyan/80 text-black font-black italic uppercase tracking-tighter rounded-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              <RotateCcw size={20} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
