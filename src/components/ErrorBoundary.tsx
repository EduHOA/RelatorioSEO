import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif',
          maxWidth: '800px',
          margin: '2rem auto',
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Erro na Aplicação</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Ocorreu um erro ao carregar a aplicação. Por favor, verifique o console do navegador para mais detalhes.
          </p>
          {this.state.error && (
            <details style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              textAlign: 'left',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>
                Detalhes do erro
              </summary>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.85rem',
                color: '#333',
              }}>
                {this.state.error.toString()}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#ff9a05',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
