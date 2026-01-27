import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { ReportConfig } from '../../types/report';
import { createDefaultReport } from '../../utils/reportTemplates';
import { XLSXUpload } from './XLSXUpload';
import { parseGSCData } from '../../utils/xlsxParser';
// import { analyzeGSCData } from '../../services/openaiService'; // IA desativada temporariamente
import { LoadingScreen } from './LoadingScreen';
import './ClientSetup.css';

interface ClientSetupProps {
  onComplete: (config: ReportConfig) => void;
  onBack: () => void;
}

export const ClientSetup: React.FC<ClientSetupProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<'info' | 'csv'>('info');
  const [formData, setFormData] = useState<{
    clientName: string;
    domain: string;
    periodStart: Date | null;
    periodEnd: Date | null;
    period: string;
    comparisonPeriod: 'Período anterior' | 'Ano anterior';
    logo: string;
  }>({
    clientName: '',
    domain: '',
    periodStart: null,
    periodEnd: null,
    period: '',
    comparisonPeriod: 'Ano anterior',
    logo: '',
  });
  const [gscData, setGscData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [isAnalyzing, setIsAnalyzing] = useState(false); // IA desativada temporariamente
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Atualiza o período formatado quando as datas mudam
      if (field === 'periodStart' || field === 'periodEnd') {
        if (updated.periodStart && updated.periodEnd) {
          updated.period = `${format(updated.periodStart, 'dd/MM/yyyy')} a ${format(updated.periodEnd, 'dd/MM/yyyy')}`;
        }
      }
      
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome do cliente é obrigatório';
    }
    
    if (!formData.domain.trim()) {
      newErrors.domain = 'Domínio é obrigatório';
    }
    
    if (!formData.periodStart || !formData.periodEnd) {
      newErrors.period = 'Período de análise é obrigatório';
    } else if (formData.periodStart > formData.periodEnd) {
      newErrors.period = 'Data inicial deve ser anterior à data final';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep('csv');
    }
  };

  const handleCSVUpload = async (data: any) => {
    setGscData(data);
    setAiAnalysis(null);
    
    // IA DESATIVADA TEMPORARIAMENTE
    // Para reativar, descomente o código abaixo e o import no topo do arquivo
    /*
    setIsAnalyzing(true);
    try {
      // Recupera dados brutos da planilha se disponíveis (do objeto de dados ou global)
      const rawExcelData = data.rawExcelData || (globalThis as any).__lastRawExcelData;
      
      const analysis = await analyzeGSCData(
        data, 
        formData.clientName || 'Cliente', 
        formData.period || 'Período',
        rawExcelData
      );
      setAiAnalysis(analysis);
      console.log('Análise da IA concluída:', analysis);
    } catch (error: any) {
      console.error('Erro ao analisar com IA:', error);
      // Não bloqueia o fluxo se a análise falhar, mas mostra aviso mais informativo
      const errorMessage = error.message || 'Erro desconhecido';
      
      if (errorMessage.includes('Cota') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
        alert(
          `⚠️ Cota da API do Gemini Excedida\n\n` +
          `A análise automática não pôde ser gerada porque a cota diária da API foi excedida.\n\n` +
          `Você pode:\n` +
          `• Aguardar o reset da cota (geralmente à meia-noite)\n` +
          `• Verificar sua conta em https://ai.google.dev/\n` +
          `• Continuar editando o relatório manualmente\n\n` +
          `O relatório foi criado normalmente, apenas sem a análise automática da IA.`
        );
      } else {
        alert(`Aviso: Não foi possível gerar análise automática.\n\nErro: ${errorMessage}\n\nVocê pode continuar editando o relatório manualmente.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
    */
  };

  const handleFinish = () => {
    if (!gscData) {
      alert('Por favor, importe os dados do Google Search Console antes de finalizar.');
      return;
    }

    const config = createDefaultReport(formData.clientName, formData.period);
    
    // Atualiza informações do cliente
    config.clientName = formData.clientName;
    config.period = formData.period;
    config.logo = formData.logo || config.logo;
    
    // Atualiza header
    const headerSection = config.sections.find(s => s.type === 'header');
    if (headerSection) {
      headerSection.data.domain = formData.domain;
      headerSection.data.periodInfo = formData.period;
      headerSection.data.comparisonPeriod = formData.comparisonPeriod;
    }

    // Processa dados do GSC e atualiza seções
    if (gscData) {
      updateReportWithGSCData(config, gscData);
    }

    // Adiciona análise da IA se disponível (sempre tenta adicionar)
    if (aiAnalysis) {
      // Atualiza métricas do dashboard se a IA forneceu
      if (aiAnalysis.metrics) {
        const kpiSection = config.sections.find(s => s.type === 'kpiGrid');
        if (kpiSection) {
          const aiMetrics = aiAnalysis.metrics;
          const existingMetrics = kpiSection.data.metrics || [];
          
          // Atualiza ou adiciona métricas da IA
          const metricsMap = new Map(existingMetrics.map((m: any) => [m.label.toLowerCase(), m]));
          
          if (aiMetrics.clicks) {
            const existing = metricsMap.get('cliques') || metricsMap.get('cliques');
            if (existing) {
              existing.value = aiMetrics.clicks;
            } else {
              existingMetrics.push({ label: 'Cliques', value: aiMetrics.clicks, change: 0, changeType: 'neutral' });
            }
          }
          
          if (aiMetrics.impressions) {
            const existing = metricsMap.get('impressões') || metricsMap.get('impressoes');
            if (existing) {
              existing.value = aiMetrics.impressions;
            } else {
              existingMetrics.push({ label: 'Impressões', value: aiMetrics.impressions, change: 0, changeType: 'neutral' });
            }
          }
          
          if (aiMetrics.avgPosition) {
            const existing = metricsMap.get('posição média') || metricsMap.get('posicao media');
            if (existing) {
              existing.value = aiMetrics.avgPosition;
            } else {
              existingMetrics.push({ label: 'Posição média', value: aiMetrics.avgPosition, change: 0, changeType: 'neutral' });
            }
          }
          
          if (aiMetrics.avgCTR) {
            const existing = metricsMap.get('ctr médio') || metricsMap.get('ctr medio');
            if (existing) {
              existing.value = aiMetrics.avgCTR;
            } else {
              existingMetrics.push({ label: 'CTR médio', value: aiMetrics.avgCTR, change: 0, changeType: 'neutral' });
            }
          }
          
          if (aiMetrics.organicSessions) {
            const existing = metricsMap.get('sessões orgânicas') || metricsMap.get('sessoes organicas');
            if (existing) {
              existing.value = aiMetrics.organicSessions;
            } else {
              existingMetrics.push({ label: 'Sessões orgânicas', value: aiMetrics.organicSessions, change: 0, changeType: 'neutral' });
            }
          }
          
          if (aiMetrics.newUsers) {
            const existing = metricsMap.get('novos usuários orgânicos') || metricsMap.get('novos usuarios organicos');
            if (existing) {
              existing.value = aiMetrics.newUsers;
            } else {
              existingMetrics.push({ label: 'Novos usuários orgânicos', value: aiMetrics.newUsers, change: 0, changeType: 'neutral' });
            }
          }
          
          if (aiMetrics.avgSessionDuration) {
            const existing = metricsMap.get('tempo médio de sessão') || metricsMap.get('tempo medio de sessao');
            if (existing) {
              existing.value = aiMetrics.avgSessionDuration;
            } else {
              existingMetrics.push({ label: 'Tempo médio de sessão', value: aiMetrics.avgSessionDuration, change: 0, changeType: 'neutral' });
            }
          }
          
          kpiSection.data.metrics = existingMetrics;
        }
      }
      
      // Formata análise seguindo o modelo fornecido
      const analysisSection = config.sections.find(s => s.type === 'analysis');
      let analysisText = `<h3>Análise</h3>`;
      
      // Summary formatado como parágrafos (modelo fornecido)
      if (aiAnalysis.summary) {
        // Divide o summary em parágrafos se houver quebras de linha
        const paragraphs = aiAnalysis.summary.split('\n\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
          analysisText += `<p>${paragraph.trim()}</p>`;
        });
      }
      
      if (analysisSection) {
        analysisSection.data.analysis = analysisText;
      } else {
        // Cria nova seção de análise se não existir
        config.sections.push({
          id: `analysis-ai-${Date.now()}`,
          type: 'analysis',
          title: 'Análise',
          visible: true,
          order: config.sections.length,
          data: {
            title: 'Análise',
            analysis: analysisText,
          },
        });
      }
    }

    onComplete(config);
  };

  const updateReportWithGSCData = (config: ReportConfig, data: any) => {
    console.log('Atualizando relatório com dados GSC:', data);
    console.log('Dados do ano anterior:', data.previousYearData);
    console.log('Comparação de períodos:', data.periodComparison);
    
    // Atualiza KPIs principais com variações calculadas
    const kpiSection = config.sections.find(s => s.type === 'kpiGrid');
    if (kpiSection && data.metrics && data.metrics.length > 0) {
      kpiSection.data.metrics = data.metrics.map((m: any) => {
        // Determina o tipo de mudança baseado no valor
        let changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
        if (m.change > 0) {
          // Para posição média, aumento é negativo (pior posição)
          if (m.label.toLowerCase().includes('posição')) {
            changeType = 'decrease';
          } else {
            changeType = 'increase';
          }
        } else if (m.change < 0) {
          // Para posição média, diminuição é positivo (melhor posição)
          if (m.label.toLowerCase().includes('posição')) {
            changeType = 'increase';
          } else {
            changeType = 'decrease';
          }
        }
        
        return {
          label: m.label,
          value: m.value,
          change: m.change || 0,
          changeType: changeType,
        };
      });
      console.log('KPIs atualizados com comparação:', kpiSection.data.metrics);
    }

    // Atualiza ganhos/perdas
    const gainsLossesSection = config.sections.find(s => s.type === 'gainsLosses');
    if (gainsLossesSection && data.gainsLosses && data.gainsLosses.length > 0) {
      gainsLossesSection.data.gainsLosses = data.gainsLosses;
      console.log('Ganhos/Perdas atualizados:', gainsLossesSection.data.gainsLosses);
    }

    // Atualiza Meta SEO se houver dados
    const metaSection = config.sections.find(s => s.type === 'metaSEO');
    if (metaSection && data.metaSEO) {
      metaSection.data.metaSEO = data.metaSEO;
    }
  };

  // IA DESATIVADA TEMPORARIAMENTE - LoadingScreen comentado
  // Se estiver analisando, mostra tela de carregamento
  /*
  if (isAnalyzing) {
    return (
      <LoadingScreen 
        isAnalyzing={true}
        message="A IA está analisando os dados do Google Search Console e gerando insights personalizados para o relatório..."
      />
    );
  }
  */

  return (
    <div className="client-setup">
      <div className="setup-header">
        <button className="btn-back" onClick={onBack}>
          ← Voltar
        </button>
        <h1>Configuração do Relatório</h1>
        <div className="step-indicator">
          <div className={`step ${step === 'info' ? 'active' : 'completed'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Informações</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step === 'csv' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Dados GSC</span>
          </div>
        </div>
      </div>

      <div className="setup-content">
        {step === 'info' ? (
          <div className="setup-form">
            <div className="form-section">
              <h2>Informações do Cliente</h2>
              <p className="section-description">
                Preencha as informações básicas do relatório
              </p>

              <div className="form-group">
                <label htmlFor="clientName">
                  Nome do Cliente <span className="required">*</span>
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Ex: GZV Solutions"
                  className={errors.clientName ? 'error' : ''}
                />
                {errors.clientName && (
                  <span className="error-message">{errors.clientName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="domain">
                  Domínio do Site <span className="required">*</span>
                </label>
                <input
                  id="domain"
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  placeholder="Ex: gzvsolutions.com.br"
                  className={errors.domain ? 'error' : ''}
                />
                {errors.domain && (
                  <span className="error-message">{errors.domain}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Período de Análise <span className="required">*</span>
                  </label>
                  <div className="date-range-picker">
                    <div className="date-picker-group">
                      <label className="date-label">De:</label>
                      <DatePicker
                        selected={formData.periodStart}
                        onChange={(date: Date | null) => handleInputChange('periodStart', date)}
                        selectsStart
                        startDate={formData.periodStart}
                        endDate={formData.periodEnd}
                        dateFormat="dd/MM/yyyy"
                        className={errors.period ? 'error' : ''}
                        placeholderText="Data inicial"
                        isClearable
                      />
                    </div>
                    <div className="date-picker-group">
                      <label className="date-label">Até:</label>
                      <DatePicker
                        selected={formData.periodEnd}
                        onChange={(date: Date | null) => handleInputChange('periodEnd', date)}
                        selectsEnd
                        startDate={formData.periodStart}
                        endDate={formData.periodEnd}
                        minDate={formData.periodStart}
                        dateFormat="dd/MM/yyyy"
                        className={errors.period ? 'error' : ''}
                        placeholderText="Data final"
                        isClearable
                      />
                    </div>
                  </div>
                  {formData.period && (
                    <div className="period-display">
                      <strong>Período selecionado:</strong> {formData.period}
                    </div>
                  )}
                  {errors.period && (
                    <span className="error-message">{errors.period}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="comparisonPeriod">
                    Período de Comparação
                  </label>
                  <select
                    id="comparisonPeriod"
                    value={formData.comparisonPeriod}
                    onChange={(e) => handleInputChange('comparisonPeriod', e.target.value)}
                  >
                    <option value="Período anterior">Período anterior</option>
                    <option value="Ano anterior">Ano anterior</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="logo">
                  URL do Logo (opcional)
                </label>
                <input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                />
                <small className="form-hint">
                  Se não preenchido, será usado o logo padrão da LiveSEO
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary btn-large" onClick={handleNext}>
                Próximo: Importar Dados GSC →
              </button>
            </div>
          </div>
        ) : (
          <div className="csv-step">
            <XLSXUpload 
              onUpload={handleCSVUpload} 
              periodStart={formData.periodStart}
              periodEnd={formData.periodEnd}
            />
            
            {gscData && (
              <div className="data-preview">
                <h3>✅ Dados importados com sucesso!</h3>
                <div className="preview-stats">
                  <div className="stat-item">
                    <span className="stat-label">Métricas processadas:</span>
                    <span className="stat-value">{gscData.metrics?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Palavras-chave:</span>
                    <span className="stat-value">{gscData.keywords?.length || 0}</span>
                  </div>
                  {gscData.rawData && (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Total de cliques:</span>
                        <span className="stat-value">{gscData.rawData.totalClicks.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total de impressões:</span>
                        <span className="stat-value">{gscData.rawData.totalImpressions.toLocaleString('pt-BR')}</span>
                      </div>
                    </>
                  )}
                  {gscData.filters && gscData.filters.type !== 'all' && (
                    <div className="stat-item filter-info">
                      <span className="stat-label">Filtro detectado:</span>
                      <span className="stat-value">{gscData.filters.type === 'blog' ? '📝 Blog' : '🌐 Site'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep('info')}>
                ← Voltar
              </button>
              <button 
                className="btn btn-primary btn-large" 
                onClick={handleFinish}
                disabled={!gscData}
              >
                Finalizar e Criar Relatório
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
