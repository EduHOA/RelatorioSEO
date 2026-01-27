import React, { useState, useEffect } from 'react';
import { getGeminiApiKey, setGeminiApiKey } from '../../services/geminiService';
import './GeminiConfig.css';

interface GeminiConfigProps {
  onSave: () => void;
}

export const GeminiConfig: React.FC<GeminiConfigProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedKey = getGeminiApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Por favor, insira uma API Key válida do Google Gemini');
      return;
    }

    setIsSaving(true);
    try {
      setGeminiApiKey(apiKey.trim());
      alert('API Key salva com sucesso!');
      setIsVisible(false);
      onSave();
    } catch (error) {
      alert('Erro ao salvar API Key');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja remover a API Key?')) {
      localStorage.removeItem('gemini-api-key');
      setApiKey('');
      alert('API Key removida');
    }
  };

  if (!isVisible) {
    return (
      <div className="gemini-config-toggle">
        <button 
          className="btn-gemini-toggle"
          onClick={() => setIsVisible(true)}
        >
          🤖 Configurar IA (Gemini)
        </button>
      </div>
    );
  }

  return (
    <div className="gemini-config">
      <div className="gemini-config-header">
        <h3>🤖 Configuração do Google Gemini</h3>
        <button 
          className="btn-close"
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </div>
      
      <div className="gemini-config-body">
        <p className="gemini-description">
          Configure sua API Key do Google Gemini para habilitar análises inteligentes dos dados do Google Search Console.
          A IA irá gerar insights, recomendações e análises automáticas dos seus dados.
        </p>

        <div className="form-group">
          <label htmlFor="gemini-key">
            API Key do Google Gemini <span className="required">*</span>
          </label>
          <input
            id="gemini-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Cole sua API Key aqui"
            className="input-api-key"
          />
          <small className="form-hint">
            Sua API Key é armazenada localmente no navegador e não é compartilhada.
            <br />
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-api-key"
            >
              Obter API Key do Google Gemini →
            </a>
          </small>
        </div>

        <div className="gemini-config-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={!apiKey}
          >
            Remover Key
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!apiKey.trim() || isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar API Key'}
          </button>
        </div>

        {getGeminiApiKey() && (
          <div className="gemini-status">
            <span className="status-indicator active">✓</span>
            <span>API Key configurada e pronta para uso</span>
          </div>
        )}
      </div>
    </div>
  );
};
