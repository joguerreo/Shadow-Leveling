import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[System Error Caught By Boundary]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.removeItem('shadow_system_player_v2');
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-[#121624] border border-primary/40 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl shadow-primary/20">
            <div className="size-16 mx-auto rounded-2xl bg-primary/10 border border-primary/50 flex items-center justify-center text-primary animate-pulse">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block font-mono">
                [ ALERTA DEL SISTEMA DEL MONARCA ]
              </span>
              <h2 className="text-2xl font-black font-display text-white tracking-tight">
                Distorsión de Maná Detectada
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed font-mono">
                El sistema ha contenido una anomalía en la interfaz neuronal para proteger los datos de tu Cazador.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-left font-mono text-[11px] text-red-400 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl text-xs font-black uppercase font-mono tracking-wider text-white transition-all shadow-lg shadow-primary/25 cursor-pointer"
              >
                Restaurar Sistema
              </button>
              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Reiniciar datos locales de emergencia"
              >
                Limpiar Caché
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
