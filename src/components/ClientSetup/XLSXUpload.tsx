import React, { useRef, useState } from 'react';
import { parsePDFData } from '../../utils/pdfParser';
import { LoadingScreen } from './LoadingScreen';
import './XLSXUpload.css';

interface XLSXUploadProps {
  onUpload: (data: any) => void;
  periodStart?: Date | null;
  periodEnd?: Date | null;
}

export const XLSXUpload: React.FC<XLSXUploadProps> = ({ onUpload, periodStart, periodEnd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [processingMessage, setProcessingMessage] = useState<string>('');

  const handleFiles = async (files: FileList) => {
    // Filtra apenas arquivos PDF
    const pdfFiles = Array.from(files).filter(file => 
      file.name.endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      setError('Por favor, selecione arquivos PDF (.pdf)');
      return;
    }

    setIsProcessing(true);
    setError('');
    setUploadedFiles(pdfFiles.map(f => f.name));
    setProcessingMessage('Lendo arquivos PDF...');

    try {
      // Processa todos os arquivos PDF usando agente de IA
      setProcessingMessage('Extraindo texto dos PDFs...');
      
      const allDataPromises = pdfFiles.map(async (file, index) => {
        setProcessingMessage(`Processando PDF ${index + 1}/${pdfFiles.length} com agente de IA...`);
        return parsePDFData(file).then(result => ({
          type: 'pdf',
          file: file.name,
          data: result
        }));
      });
      
      const allResults = await Promise.all(allDataPromises);
      
      // Extrai dados de todos os PDFs
      const allData: any[] = allResults.map(result => result.data);

      setProcessingMessage('Organizando dados extraídos...');
      // Separa dados por período e compara
      const processedData = processDataByPeriod(allData, periodStart, periodEnd);
      
      setProcessingMessage('Finalizando processamento...');
      onUpload(processedData);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar os arquivos PDF. Verifique o formato.';
      setError(errorMessage);
      console.error('Erro ao processar arquivos:', err);
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processDataByPeriod = (dataArray: any[], periodStart?: Date | null, periodEnd?: Date | null) => {
    // Identifica qual arquivo corresponde ao período informado e qual ao ano anterior
    let currentPeriodData: any[] = [];
    let previousYearData: any[] = [];
    
    // Calcula o período do ano anterior
    const previousYearStart = periodStart ? new Date(periodStart) : null;
    const previousYearEnd = periodEnd ? new Date(periodEnd) : null;
    if (previousYearStart) previousYearStart.setFullYear(previousYearStart.getFullYear() - 1);
    if (previousYearEnd) previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1);
    
    dataArray.forEach((data) => {
      const filePeriod = extractPeriodFromData(data);
      
      // Verifica se o arquivo corresponde ao período informado
      if (periodStart && periodEnd && filePeriod && filePeriod.start && filePeriod.end) {
        const fileStart = filePeriod.start;
        const fileEnd = filePeriod.end;
        
        // Verifica se o período do arquivo corresponde ao período informado
        // Usa uma margem de tolerância de 1 dia para considerar arquivos que podem ter pequenas diferenças
        const tolerance = 24 * 60 * 60 * 1000; // 1 dia em milissegundos
        
        const isCurrentPeriod = 
          Math.abs(fileStart.getTime() - periodStart.getTime()) <= tolerance * 30 && 
          Math.abs(fileEnd.getTime() - periodEnd.getTime()) <= tolerance * 30;
        
        const isPreviousYear = 
          previousYearStart && previousYearEnd &&
          Math.abs(fileStart.getTime() - previousYearStart.getTime()) <= tolerance * 30 && 
          Math.abs(fileEnd.getTime() - previousYearEnd.getTime()) <= tolerance * 30;
        
        if (isCurrentPeriod) {
          currentPeriodData.push(data);
        } else if (isPreviousYear) {
          previousYearData.push(data);
        } else {
          // Se não corresponde a nenhum período específico, verifica se está dentro do período atual
          if (fileStart.getTime() >= periodStart.getTime() && fileEnd.getTime() <= periodEnd.getTime()) {
            currentPeriodData.push(data);
          } else if (previousYearStart && previousYearEnd && 
                     fileStart.getTime() >= previousYearStart.getTime() && 
                     fileEnd.getTime() <= previousYearEnd.getTime()) {
            previousYearData.push(data);
          } else {
            // Se não corresponde a nenhum período, assume que é do período atual (mais recente)
            currentPeriodData.push(data);
          }
        }
      } else {
        // Se não há período informado ou não conseguiu detectar, assume que todos são do período atual
        currentPeriodData.push(data);
      }
    });
    
    // Se não encontrou dados do período atual, usa todos os dados
    if (currentPeriodData.length === 0) {
      currentPeriodData = dataArray;
    }
    
    // Combina dados do período atual
    const currentData = combineGSCData(currentPeriodData);
    
    // Combina dados do ano anterior (se houver)
    const previousData = previousYearData.length > 0 ? combineGSCData(previousYearData) : null;
    
    // Calcula variações comparando com o ano anterior
    if (previousData && previousData.rawData && currentData.rawData) {
      // Cliques
      if (previousData.rawData.totalClicks && previousData.rawData.totalClicks !== 0) {
        const clicksChange = ((currentData.rawData.totalClicks - previousData.rawData.totalClicks) / previousData.rawData.totalClicks) * 100;
        currentData.metrics[0].change = clicksChange;
      }
      
      // Impressões
      if (previousData.rawData.totalImpressions && previousData.rawData.totalImpressions !== 0) {
        const impressionsChange = ((currentData.rawData.totalImpressions - previousData.rawData.totalImpressions) / previousData.rawData.totalImpressions) * 100;
        currentData.metrics[1].change = impressionsChange;
      }
      
      // Posição média (invertido: menor posição = melhor)
      if (previousData.rawData.avgPosition && previousData.rawData.avgPosition !== 0) {
        const positionChange = ((previousData.rawData.avgPosition - currentData.rawData.avgPosition) / previousData.rawData.avgPosition) * 100;
        currentData.metrics[2].change = positionChange;
      }
      
      // CTR
      if (previousData.rawData.avgCTR && previousData.rawData.avgCTR !== 0) {
        const ctrChange = ((currentData.rawData.avgCTR - previousData.rawData.avgCTR) / previousData.rawData.avgCTR) * 100;
        currentData.metrics[3].change = ctrChange;
      }
    }
    
    return {
      ...currentData,
      previousYearData: previousData,
      periodComparison: previousData ? {
        hasComparison: true,
        currentPeriod: {
          start: periodStart,
          end: periodEnd,
        },
        previousPeriod: {
          start: previousYearStart,
          end: previousYearEnd,
        },
      } : null,
    };
  };

  const extractPeriodFromData = (data: any): { start: Date | null; end: Date | null } | null => {
    // Tenta extrair período do headerInfo
    if (data.headerInfo && data.headerInfo.period) {
      const periodText = data.headerInfo.period.toLowerCase();
      // Procura por padrões de data (dd/mm/yyyy, mm/yyyy, etc)
      const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/g;
      const dates = periodText.match(datePattern);
      
      if (dates && dates.length >= 2) {
        const startDate = parseDate(dates[0]);
        const endDate = parseDate(dates[dates.length - 1]);
        if (startDate && endDate) {
          return { start: startDate, end: endDate };
        }
      }
    }
    
    // Tenta extrair das linhas brutas do cabeçalho
    if (data.headerInfo && data.headerInfo.rawLines) {
      const allText = data.headerInfo.rawLines.join(' ').toLowerCase();
      const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/g;
      const dates = allText.match(datePattern);
      
      if (dates && dates.length >= 2) {
        const startDate = parseDate(dates[0]);
        const endDate = parseDate(dates[dates.length - 1]);
        if (startDate && endDate) {
          return { start: startDate, end: endDate };
        }
      }
    }
    
    return null;
  };

  const parseDate = (dateStr: string): Date | null => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    } catch (e) {
      // Ignora erros de parsing
    }
    return null;
  };

  const combineGSCData = (dataArray: any[]) => {
    // Combina palavras-chave (soma valores duplicados preservando valores exatos)
    const keywordMap = new Map<string, any>();
    const detectedFilters: string[] = [];
    const headerInfos: any[] = [];
    
    dataArray.forEach((data, index) => {
      // Coleta informações de filtros
      if (data.filters && data.filters.type) {
        detectedFilters.push(data.filters.type);
      }
      
      // Coleta informações do cabeçalho
      if (data.headerInfo) {
        headerInfos.push(data.headerInfo);
      }
      
      if (data.keywords) {
        data.keywords.forEach((kw: any) => {
          const existing = keywordMap.get(kw.keyword);
          if (existing) {
            // Soma valores exatos (não arredonda)
            existing.clicks += kw.clicks;
            existing.impressions += kw.impressions;
            // Calcula média ponderada de posição
            const totalImpressions = existing.impressions + kw.impressions;
            if (totalImpressions > 0) {
              existing.position = ((existing.position * existing.impressions) + (kw.position * kw.impressions)) / totalImpressions;
            }
          } else {
            keywordMap.set(kw.keyword, { ...kw });
          }
        });
      }
    });

    const combinedKeywords = Array.from(keywordMap.values());
    
    // Detecta tipo de filtro combinado
    const uniqueFilters = [...new Set(detectedFilters)];
    const filterType = uniqueFilters.length === 1 ? uniqueFilters[0] : 'all';

    // Calcula métricas totais
    const totalClicks = combinedKeywords.reduce((sum, k) => sum + k.clicks, 0);
    const totalImpressions = combinedKeywords.reduce((sum, k) => sum + k.impressions, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = combinedKeywords.length > 0 
      ? combinedKeywords.reduce((sum, k) => sum + k.position, 0) / combinedKeywords.length 
      : 0;

    // Preserva valores exatos do GSC (mudanças serão calculadas depois da comparação)
    const metrics = [
      {
        label: 'Cliques',
        value: totalClicks.toLocaleString('pt-BR'), // Número exato formatado
        change: 0, // Será calculado na comparação
      },
      {
        label: 'Impressões',
        value: totalImpressions.toLocaleString('pt-BR'), // Número exato formatado
        change: 0, // Será calculado na comparação
      },
      {
        label: 'Posição média',
        value: avgPosition.toFixed(1),
        change: 0, // Será calculado na comparação
      },
      {
        label: 'CTR médio',
        value: avgCTR.toFixed(2) + '%',
        change: 0, // Será calculado na comparação
      },
    ];

    // Top palavras-chave
    const sortedByClicks = [...combinedKeywords]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    const gains = sortedByClicks
      .filter(k => k.clicks > 0)
      .slice(0, 5)
      .map(k => ({
        keyword: k.keyword,
        change: `+${k.clicks.toFixed(0)} cliques`,
        changeType: 'increase' as const,
      }));

    const losses = sortedByClicks
      .filter(k => k.clicks === 0 && k.impressions > 0)
      .slice(0, 5)
      .map(k => ({
        keyword: k.keyword,
        change: '-100% cliques',
        changeType: 'decrease' as const,
      }));

    return {
      metrics,
      keywords: combinedKeywords,
      gainsLosses: [
        {
          title: 'Maiores ganhos em palavras-chave',
          items: gains,
        },
        {
          title: 'Maiores perdas em palavras-chave',
          items: losses,
        },
      ],
      rawData: {
        totalClicks,
        totalImpressions,
        avgCTR,
        avgPosition,
        keywordCount: combinedKeywords.length,
      },
      filters: {
        type: filterType as 'site' | 'blog' | 'all',
        detectedFrom: `Arquivos combinados: ${uniqueFilters.join(', ') || 'Todos'}`,
      },
      headerInfo: {
        rawLines: headerInfos.flatMap(h => h.rawLines || []),
        period: headerInfos.find(h => h.period)?.period,
        clicks: headerInfos.find(h => h.clicks)?.clicks,
        impressions: headerInfos.find(h => h.impressions)?.impressions,
        ctr: headerInfos.find(h => h.ctr)?.ctr,
        position: headerInfos.find(h => h.position)?.position,
      },
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Mostra tela de carregamento durante processamento
  if (isProcessing) {
    return (
      <LoadingScreen 
        message={processingMessage || 'Processando arquivos PDF...'}
      />
    );
  }

  return (
    <div className="xlsx-upload">
      <div className="upload-header">
        <h2>Importar Dados do Google Search Console</h2>
        <p className="upload-description">
          Faça o upload dos arquivos PDF (.pdf) exportados do Google Search Console
          <br />
          <strong>Você pode enviar múltiplos arquivos de uma vez</strong>
        </p>
      </div>

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {isProcessing ? (
          <div className="upload-content">
            <div className="spinner"></div>
            <p>Processando {uploadedFiles.length} arquivo(s)...</p>
            <div className="file-list">
              {uploadedFiles.map((name, idx) => (
                <span key={idx} className="file-name">{name}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📊</div>
            <p className="upload-text">
              <strong>Arraste os arquivos PDF aqui</strong>
              <br />
              ou clique para selecionar
            </p>
            <p className="upload-hint">
              Formato aceito: .pdf (múltiplos arquivos)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}

      {uploadedFiles.length > 0 && !isProcessing && (
        <div className="uploaded-files">
          <h4>Arquivos carregados:</h4>
          <ul>
            {uploadedFiles.map((name, idx) => (
              <li key={idx}>✓ {name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="upload-info">
        <h3>Como exportar do Google Search Console:</h3>
        <ol>
          <li>Acesse o Google Search Console</li>
          <li>Vá em "Performance" → "Resultados da pesquisa"</li>
          <li>Configure o período desejado</li>
          <li>Gere o relatório em PDF com as métricas e palavras-chave</li>
          <li>Baixe o arquivo PDF gerado</li>
          <li>Repita para cada período que deseja analisar</li>
          <li>Envie todos os arquivos PDF de uma vez</li>
        </ol>
        <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
          <strong>Formato esperado:</strong> O PDF deve conter as seções "Visão Geral do Período" e "Top 10 Palavras-chave por Cliques"
        </p>
      </div>
    </div>
  );
};
