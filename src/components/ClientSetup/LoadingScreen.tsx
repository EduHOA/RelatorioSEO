import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  isAnalyzing?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Processando dados...', 
  progress,
  isAnalyzing = false 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <img 
            src="https://www.linx.com.br/app/uploads/2022/07/liveSEO-logo-aplicacao-principal-1-1.png" 
            alt="LiveSEO" 
          />
        </div>
        
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>

        <h2 className="loading-title">
          {isAnalyzing ? '🤖 Analisando com Inteligência Artificial' : 'Processando dados do Google Search Console'}
        </h2>
        
        <p className="loading-message">{message}</p>

        {isAnalyzing && (
          <div className="ai-analysis-steps">
            <div className="step-item">
              <span className="step-icon">✓</span>
              <span>Dados do GSC carregados</span>
            </div>
            <div className="step-item active">
              <span className="step-icon">⟳</span>
              <span>Analisando métricas e tendências</span>
            </div>
            <div className="step-item">
              <span className="step-icon">○</span>
              <span>Gerando insights e recomendações</span>
            </div>
            <div className="step-item">
              <span className="step-icon">○</span>
              <span>Preparando relatório</span>
            </div>
          </div>
        )}

        {progress !== undefined && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        <div className="loading-hint">
          {isAnalyzing 
            ? 'A IA está analisando seus dados e gerando insights personalizados...'
            : 'Aguarde enquanto processamos seus arquivos...'
          }
        </div>
      </div>
    </div>
  );
};
