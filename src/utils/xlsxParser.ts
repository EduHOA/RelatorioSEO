import * as XLSX from 'xlsx';

export interface GSCMetric {
  label: string;
  value: string;
  change: number;
}

export interface GSCKeyword {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  change?: number;
}

export interface ParsedGSCData {
  metrics: GSCMetric[];
  keywords: GSCKeyword[];
  gainsLosses?: {
    title: string;
    items: {
      keyword: string;
      change: string;
      changeType: 'increase' | 'decrease';
    }[];
  }[];
  metaSEO?: any;
  rawData?: {
    totalClicks: number;
    totalImpressions: number;
    avgCTR: number;
    avgPosition: number;
    keywordCount: number;
  };
  filters?: {
    type?: 'site' | 'blog' | 'all';
    detectedFrom?: string;
  };
  headerInfo?: {
    period?: string;
    clicks?: string;
    impressions?: string;
    ctr?: string;
    position?: string;
    rawLines?: string[];
  };
}

export interface RawExcelData {
  sheetNames: string[];
  allSheetsData: Record<string, any[][]>;
}

export async function parseGSCData(file: File): Promise<ParsedGSCData | ParsedGSCData[]> {
  if (!XLSX) {
    throw new Error('Biblioteca xlsx não está disponível. Por favor, execute: npm install');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Erro ao ler o arquivo'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Captura dados brutos de TODAS as páginas para análise da IA
        const rawExcelData: RawExcelData = {
          sheetNames: workbook.SheetNames,
          allSheetsData: {}
        };
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
          }) as any[][];
          rawExcelData.allSheetsData[sheetName] = jsonData;
        });
        
        // Armazena dados brutos no objeto de resultado (será usado pela IA)
        (globalThis as any).__lastRawExcelData = rawExcelData;
        
        // Verifica se tem planilha "Grafico" ou "Gráfico"
        const hasGraficoSheet = workbook.SheetNames.some(name => 
          name.toLowerCase().includes('grafico') || name.toLowerCase().includes('gráfico') || name.toLowerCase().includes('grafico')
        );

        // Verifica se tem a estrutura padrão (Summary + dados de palavras-chave)
        const hasSummarySheet = workbook.SheetNames.some(name => 
          name.toLowerCase().includes('summary') || name.toLowerCase().includes('resumo')
        );

        // PRIORIDADE: Se tem planilha "Grafico", processa ela primeiro
        if (hasGraficoSheet) {
          const results = processGraficoStructure(workbook);
          resolve(results);
          return;
        }

        if (hasSummarySheet || workbook.SheetNames.length >= 2) {
          // Processa estrutura padrão: Summary + palavras-chave
          const results = processStandardStructure(workbook);
          resolve(results);
          return;
        }

        // Verifica se o nome do arquivo indica múltiplos períodos
        const fileName = file.name;
        const hasMultiplePeriods = fileName.includes('_') && 
          (fileName.match(/\d{2}_\d{2}_\d{4}/g) || []).length >= 2;

        // Se o arquivo tem múltiplos períodos no nome, tenta processar cada período separadamente
        if (hasMultiplePeriods) {
          const periods = extractPeriodsFromFileName(fileName);
          if (periods.length >= 2) {
            // Processa cada período separadamente
            const results = processMultiplePeriods(workbook, periods);
            resolve(results);
            return;
          }
        }

        // Processamento padrão (arquivo único ou período único)
        const result = processSinglePeriod(workbook);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };

    reader.readAsBinaryString(file);
  });
}

function processGraficoStructure(workbook: XLSX.WorkBook): ParsedGSCData[] {
  const results: ParsedGSCData[] = [];
  
  // Encontra a planilha "Grafico" ou "Gráfico"
  const graficoSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('grafico') || name.toLowerCase().includes('gráfico')
  );
  
  if (!graficoSheetName) {
    // Se não encontrou, tenta processar como estrutura padrão
    return processStandardStructure(workbook);
  }
  
  const graficoWorksheet = workbook.Sheets[graficoSheetName];
  const graficoData = processGraficoSheet(graficoWorksheet);
  
  // Encontra a planilha de palavras-chave (se houver)
  const keywordsSheetName = workbook.SheetNames.find((name, index) => 
    name !== graficoSheetName && (name.toLowerCase().includes('query') || 
                  name.toLowerCase().includes('keyword') ||
                  name.toLowerCase().includes('palavra') ||
                  name.toLowerCase().includes('consulta'))
  ) || (workbook.SheetNames.length > 1 ? workbook.SheetNames.find(n => n !== graficoSheetName) : null);
  
  let keywordsData = { currentKeywords: [], comparisonKeywords: [], gainsLosses: [] };
  if (keywordsSheetName) {
    keywordsData = processKeywordsSheet(workbook.Sheets[keywordsSheetName], graficoData);
  }
  
  // Cria dados para período de análise usando dados da planilha Grafico
  const currentPeriodData: ParsedGSCData = {
    metrics: graficoData.currentMetrics,
    keywords: keywordsData.currentKeywords,
    gainsLosses: keywordsData.gainsLosses,
    rawData: {
      totalClicks: graficoData.currentPeriod.clicks,
      totalImpressions: graficoData.currentPeriod.impressions,
      avgCTR: graficoData.currentPeriod.ctr,
      avgPosition: graficoData.currentPeriod.position,
      keywordCount: keywordsData.currentKeywords.length,
    },
    filters: { type: 'all', detectedFrom: 'Planilha Grafico' },
    headerInfo: {
      period: graficoData.currentPeriod.date,
      clicks: String(graficoData.currentPeriod.clicks),
      impressions: String(graficoData.currentPeriod.impressions),
      ctr: String(graficoData.currentPeriod.ctr) + '%',
      position: String(graficoData.currentPeriod.position),
      rawLines: [
        `Período: ${graficoData.currentPeriod.date}`,
        `Cliques: ${graficoData.currentPeriod.clicks}`,
        `Impressões: ${graficoData.currentPeriod.impressions}`,
      ],
    },
  };

  // Cria dados para período de comparação (se houver)
  if (graficoData.comparisonPeriod && graficoData.comparisonPeriod.clicks > 0) {
    const comparisonPeriodData: ParsedGSCData = {
      metrics: graficoData.comparisonMetrics,
      keywords: keywordsData.comparisonKeywords,
      rawData: {
        totalClicks: graficoData.comparisonPeriod.clicks,
        totalImpressions: graficoData.comparisonPeriod.impressions,
        avgCTR: graficoData.comparisonPeriod.ctr,
        avgPosition: graficoData.comparisonPeriod.position,
        keywordCount: keywordsData.comparisonKeywords.length,
      },
      filters: { type: 'all', detectedFrom: 'Planilha Grafico' },
      headerInfo: {
        period: graficoData.comparisonPeriod.date,
        clicks: String(graficoData.comparisonPeriod.clicks),
        impressions: String(graficoData.comparisonPeriod.impressions),
        ctr: String(graficoData.comparisonPeriod.ctr) + '%',
        position: String(graficoData.comparisonPeriod.position),
      },
    };
    
    // Calcula variações
    if (graficoData.comparisonPeriod.clicks > 0) {
      const clicksChange = ((graficoData.currentPeriod.clicks - graficoData.comparisonPeriod.clicks) / graficoData.comparisonPeriod.clicks) * 100;
      currentPeriodData.metrics[0].change = clicksChange;
    }
    
    if (graficoData.comparisonPeriod.impressions > 0) {
      const impressionsChange = ((graficoData.currentPeriod.impressions - graficoData.comparisonPeriod.impressions) / graficoData.comparisonPeriod.impressions) * 100;
      currentPeriodData.metrics[1].change = impressionsChange;
    }
    
    if (graficoData.comparisonPeriod.position > 0) {
      const positionChange = ((graficoData.comparisonPeriod.position - graficoData.currentPeriod.position) / graficoData.comparisonPeriod.position) * 100;
      currentPeriodData.metrics[2].change = positionChange;
    }
    
    if (graficoData.comparisonPeriod.ctr > 0) {
      const ctrChange = ((graficoData.currentPeriod.ctr - graficoData.comparisonPeriod.ctr) / graficoData.comparisonPeriod.ctr) * 100;
      currentPeriodData.metrics[3].change = ctrChange;
    }
    
    return [currentPeriodData, comparisonPeriodData];
  }
  
  return [currentPeriodData];
}

function processGraficoSheet(worksheet: XLSX.WorkSheet): {
  currentPeriod: { date: string; clicks: number; impressions: number; ctr: number; position: number };
  comparisonPeriod: { date: string; clicks: number; impressions: number; ctr: number; position: number };
  currentMetrics: GSCMetric[];
  comparisonMetrics: GSCMetric[];
} {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: ''
  }) as any[][];

  if (jsonData.length < 2) {
    throw new Error('Planilha Grafico não tem estrutura esperada');
  }

  // Procura por cabeçalho com Cliques, Impressões, CTR, Posição
  let headerRow = -1;
  const headerMap: Record<string, number> = {};
  
  for (let i = 0; i < Math.min(10, jsonData.length); i++) {
    const row = jsonData[i];
    if (!row) continue;
    
    const rowText = row.map((cell: any) => String(cell).toLowerCase().trim()).join(' ');
    
    // Verifica se tem os campos necessários
    if ((rowText.includes('clique') || rowText.includes('click')) &&
        (rowText.includes('impressão') || rowText.includes('impression'))) {
      headerRow = i;
      
      row.forEach((cell: any, index: number) => {
        const cellText = String(cell).toLowerCase().trim();
        if (cellText.includes('período') || cellText.includes('periodo') || cellText.includes('data')) headerMap.period = index;
        if (cellText.includes('cliques') || cellText.includes('clicks') || cellText.includes('clique')) headerMap.clicks = index;
        if (cellText.includes('impressões') || cellText.includes('impressions') || cellText.includes('impressão')) headerMap.impressions = index;
        if (cellText.includes('ctr')) headerMap.ctr = index;
        if (cellText.includes('posição') || cellText.includes('position') || cellText.includes('posicao')) headerMap.position = index;
      });
      break;
    }
  }
  
  // Se não encontrou cabeçalho, tenta detectar automaticamente usando heurísticas
  if (headerRow === -1) {
    console.warn('Cabeçalho não encontrado, tentando detectar automaticamente...');
    
    // Tenta encontrar colunas numéricas que podem ser cliques/impressões
    // Assumindo que a primeira linha pode ser cabeçalho ou dados
    headerRow = 0; // Assume primeira linha como início dos dados
    
    // Analisa as primeiras linhas para identificar padrões
    for (let rowIdx = 0; rowIdx < Math.min(5, jsonData.length); rowIdx++) {
      const row = jsonData[rowIdx];
      if (!row || row.length === 0) continue;
      
      // Procura por valores numéricos grandes (provavelmente cliques/impressões)
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellValue = String(row[colIdx] || '').trim();
        const numValue = parseFloat(cellValue.replace(/[^\d.,]/g, '').replace(',', '.'));
        
        // Se encontrou um número grande (> 100), pode ser cliques ou impressões
        if (numValue > 100) {
          // Primeira coluna numérica grande = cliques
          if (headerMap.clicks === undefined) {
            headerMap.clicks = colIdx;
          }
          // Segunda coluna numérica grande = impressões
          else if (headerMap.impressions === undefined && colIdx !== headerMap.clicks) {
            headerMap.impressions = colIdx;
          }
        }
        
        // Procura por porcentagens (CTR)
        if (cellValue.includes('%') || (numValue > 0 && numValue < 100 && cellValue.match(/[\d.,]+/))) {
          if (headerMap.ctr === undefined && !headerMap.clicks && !headerMap.impressions) {
            // Se não encontrou cliques/impressões ainda, pode ser CTR
            headerMap.ctr = colIdx;
          }
        }
        
        // Procura por posições (valores entre 1 e 100, geralmente decimais)
        if (numValue > 0 && numValue < 100 && numValue % 1 !== 0) {
          if (headerMap.position === undefined && colIdx !== headerMap.clicks && colIdx !== headerMap.impressions) {
            headerMap.position = colIdx;
          }
        }
      }
      
      // Se encontrou pelo menos cliques e impressões, usa esta linha como referência
      if (headerMap.clicks !== undefined && headerMap.impressions !== undefined) {
        headerRow = rowIdx;
        break;
      }
    }
    
    // Se ainda não encontrou, tenta ordem padrão: assume primeira linha = dados, colunas 0,1,2,3,4
    if (headerMap.clicks === undefined || headerMap.impressions === undefined) {
      console.warn('Usando ordem padrão de colunas...');
      // Ordem padrão comum: [Período/Data, Cliques, Impressões, CTR, Posição]
      headerMap.period = 0;
      headerMap.clicks = 1;
      headerMap.impressions = 2;
      headerMap.ctr = 3;
      headerMap.position = 4;
      headerRow = 0; // Primeira linha como dados
    }
  }

  // Busca dados do período atual
  // Se headerRow foi detectado como cabeçalho, primeira linha de dados é headerRow + 1
  // Se headerRow foi assumido como primeira linha de dados, usa headerRow diretamente
  const dataStartRow = headerRow === 0 && (headerMap.clicks !== undefined && headerMap.impressions !== undefined) 
    ? 0  // Se assumimos primeira linha como dados
    : headerRow + 1; // Se encontramos cabeçalho, próxima linha são os dados
    
  const currentRow = jsonData[dataStartRow];
  if (!currentRow || currentRow.length === 0) {
    // Tenta usar a primeira linha disponível
    const firstDataRow = jsonData.find((row, idx) => idx >= headerRow && row && row.length > 0);
    if (!firstDataRow) {
      throw new Error('Planilha Grafico não tem dados');
    }
    // Usa primeira linha disponível
    const currentDate = 'Período atual';
    const currentClicks = parseFloat(String(firstDataRow[headerMap.clicks ?? 0] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const currentImpressions = parseFloat(String(firstDataRow[headerMap.impressions ?? 1] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    
    // Retorna valores padrão se não conseguir processar
    return {
      currentPeriod: { date: currentDate, clicks: currentClicks, impressions: currentImpressions, ctr: 0, position: 0 },
      comparisonPeriod: { date: '', clicks: 0, impressions: 0, ctr: 0, position: 0 },
      currentMetrics: [
        { label: 'Cliques', value: currentClicks.toLocaleString('pt-BR'), change: 0 },
        { label: 'Impressões', value: currentImpressions.toLocaleString('pt-BR'), change: 0 },
        { label: 'Posição média', value: '0.0', change: 0 },
        { label: 'CTR médio', value: '0.00%', change: 0 },
      ],
      comparisonMetrics: [
        { label: 'Cliques', value: '0', change: 0 },
        { label: 'Impressões', value: '0', change: 0 },
        { label: 'Posição média', value: '0.0', change: 0 },
        { label: 'CTR médio', value: '0.00%', change: 0 },
      ],
    };
  }
  
  const currentDate = String(currentRow[headerMap.period ?? 0] || '').trim() || 'Período atual';
  const currentClicks = parseFloat(String(currentRow[headerMap.clicks ?? 1] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const currentImpressions = parseFloat(String(currentRow[headerMap.impressions ?? 2] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  
  // Para CTR e Posição: calcula a média de todas as linhas de dados
  let totalCTR = 0;
  let totalPosition = 0;
  let ctrCount = 0;
  let positionCount = 0;
  
  // Processa todas as linhas de dados
  const startDataRow = dataStartRow;
  for (let i = startDataRow; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;
    
    // Tenta ler CTR
    if (headerMap.ctr !== undefined && headerMap.ctr >= 0) {
      const ctrValue = String(row[headerMap.ctr] || '0');
      const ctr = parseFloat(ctrValue.replace(/[^\d.,]/g, '').replace(',', '.').replace('%', '')) || 0;
      if (ctr > 0) {
        // Se está em decimal (0-1), converte para porcentagem
        if (ctr < 1 && ctr > 0) {
          totalCTR += ctr * 100;
        } else if (ctr <= 100) {
          totalCTR += ctr;
        }
        ctrCount++;
      }
    }
    
    // Tenta ler Posição
    if (headerMap.position !== undefined && headerMap.position >= 0) {
      const position = parseFloat(String(row[headerMap.position] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      if (position > 0 && position < 100) {
        totalPosition += position;
        positionCount++;
      }
    }
  }
  
  // Calcula médias
  const currentCTR = ctrCount > 0 ? totalCTR / ctrCount : (currentImpressions > 0 ? (currentClicks / currentImpressions) * 100 : 0);
  const currentPosition = positionCount > 0 ? totalPosition / positionCount : 0;

  // Busca dados do período de comparação (segunda linha de dados, se houver)
  let comparisonDate = '';
  let comparisonClicks = 0;
  let comparisonImpressions = 0;
  let comparisonCTR = 0;
  let comparisonPosition = 0;
  
  if (jsonData.length > startDataRow + 1) {
    const comparisonRow = jsonData[startDataRow + 1];
    if (comparisonRow && comparisonRow.length > 0) {
      comparisonDate = String(comparisonRow[headerMap.period ?? 0] || '').trim() || 'Período comparação';
      comparisonClicks = parseFloat(String(comparisonRow[headerMap.clicks ?? 1] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      comparisonImpressions = parseFloat(String(comparisonRow[headerMap.impressions ?? 2] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      
      // Para comparação, também calcula médias se houver múltiplas linhas
      // (assumindo que linhas alternadas são períodos diferentes)
      let compTotalCTR = 0;
      let compTotalPosition = 0;
      let compCtrCount = 0;
      let compPositionCount = 0;
      
      for (let i = startDataRow + 1; i < jsonData.length; i += 2) { // Linhas alternadas para comparação
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        if (headerMap.ctr !== undefined && headerMap.ctr >= 0) {
          const ctrValue = String(row[headerMap.ctr] || '0');
          const ctr = parseFloat(ctrValue.replace(/[^\d.,]/g, '').replace(',', '.').replace('%', '')) || 0;
          if (ctr > 0) {
            if (ctr < 1 && ctr > 0) {
              compTotalCTR += ctr * 100;
            } else if (ctr <= 100) {
              compTotalCTR += ctr;
            }
            compCtrCount++;
          }
        }
        
        if (headerMap.position !== undefined && headerMap.position >= 0) {
          const position = parseFloat(String(row[headerMap.position] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          if (position > 0 && position < 100) {
            compTotalPosition += position;
            compPositionCount++;
          }
        }
      }
      
      comparisonCTR = compCtrCount > 0 ? compTotalCTR / compCtrCount : (comparisonImpressions > 0 ? (comparisonClicks / comparisonImpressions) * 100 : 0);
      comparisonPosition = compPositionCount > 0 ? compTotalPosition / compPositionCount : 0;
    }
  }

  const currentPeriod = {
    date: currentDate,
    clicks: currentClicks,
    impressions: currentImpressions,
    ctr: currentCTR,
    position: currentPosition,
  };

  const comparisonPeriod = {
    date: comparisonDate,
    clicks: comparisonClicks,
    impressions: comparisonImpressions,
    ctr: comparisonCTR,
    position: comparisonPosition,
  };

  // Calcula variações
  const clicksChange = comparisonClicks > 0 ? ((currentClicks - comparisonClicks) / comparisonClicks) * 100 : 0;
  const impressionsChange = comparisonImpressions > 0 ? ((currentImpressions - comparisonImpressions) / comparisonImpressions) * 100 : 0;
  const positionChange = comparisonPosition > 0 ? ((comparisonPosition - currentPosition) / comparisonPosition) * 100 : 0;
  const ctrChange = comparisonCTR > 0 ? ((currentCTR - comparisonCTR) / comparisonCTR) * 100 : 0;

  const currentMetrics: GSCMetric[] = [
    {
      label: 'Cliques',
      value: currentClicks.toLocaleString('pt-BR'),
      change: clicksChange,
    },
    {
      label: 'Impressões',
      value: currentImpressions.toLocaleString('pt-BR'),
      change: impressionsChange,
    },
    {
      label: 'Posição média',
      value: currentPosition.toFixed(1),
      change: positionChange,
    },
    {
      label: 'CTR médio',
      value: currentCTR.toFixed(2) + '%',
      change: ctrChange,
    },
  ];

  const comparisonMetrics: GSCMetric[] = [
    {
      label: 'Cliques',
      value: comparisonClicks.toLocaleString('pt-BR'),
      change: 0,
    },
    {
      label: 'Impressões',
      value: comparisonImpressions.toLocaleString('pt-BR'),
      change: 0,
    },
    {
      label: 'Posição média',
      value: comparisonPosition.toFixed(1),
      change: 0,
    },
    {
      label: 'CTR médio',
      value: comparisonCTR.toFixed(2) + '%',
      change: 0,
    },
  ];

  return {
    currentPeriod,
    comparisonPeriod,
    currentMetrics,
    comparisonMetrics,
  };
}

function processStandardStructure(workbook: XLSX.WorkBook): ParsedGSCData[] {
  const results: ParsedGSCData[] = [];
  
  // Encontra a planilha Summary (primeira página)
  const summarySheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('summary') || name.toLowerCase().includes('resumo')
  ) || workbook.SheetNames[0];
  
  // Encontra a planilha de palavras-chave (segunda página)
  const keywordsSheetName = workbook.SheetNames.find((name, index) => 
    index > 0 && (name.toLowerCase().includes('query') || 
                  name.toLowerCase().includes('keyword') ||
                  name.toLowerCase().includes('palavra') ||
                  name.toLowerCase().includes('consulta'))
  ) || (workbook.SheetNames.length > 1 ? workbook.SheetNames[1] : workbook.SheetNames[0]);

  // Processa Summary
  const summaryData = processSummarySheet(workbook.Sheets[summarySheetName]);
  
  // Processa palavras-chave
  const keywordsData = processKeywordsSheet(workbook.Sheets[keywordsSheetName], summaryData);
  
  // Cria dados para período de análise
  const currentPeriodData: ParsedGSCData = {
    metrics: summaryData.currentMetrics,
    keywords: keywordsData.currentKeywords,
    gainsLosses: keywordsData.gainsLosses,
    rawData: {
      totalClicks: summaryData.currentPeriod.clicks,
      totalImpressions: summaryData.currentPeriod.impressions,
      avgCTR: summaryData.currentPeriod.ctr,
      avgPosition: summaryData.currentPeriod.position,
      keywordCount: keywordsData.currentKeywords.length,
    },
    filters: { type: 'all', detectedFrom: 'Arquivo padrão' },
    headerInfo: {
      period: summaryData.currentPeriod.date,
      clicks: String(summaryData.currentPeriod.clicks),
      impressions: String(summaryData.currentPeriod.impressions),
      ctr: String(summaryData.currentPeriod.ctr) + '%',
      position: String(summaryData.currentPeriod.position),
      rawLines: [
        `Período: ${summaryData.currentPeriod.date}`,
        `Cliques: ${summaryData.currentPeriod.clicks}`,
        `Impressões: ${summaryData.currentPeriod.impressions}`,
      ],
    },
  };

  // Cria dados para período de comparação
  const comparisonPeriodData: ParsedGSCData = {
    metrics: summaryData.comparisonMetrics,
    keywords: keywordsData.comparisonKeywords,
    rawData: {
      totalClicks: summaryData.comparisonPeriod.clicks,
      totalImpressions: summaryData.comparisonPeriod.impressions,
      avgCTR: summaryData.comparisonPeriod.ctr,
      avgPosition: summaryData.comparisonPeriod.position,
      keywordCount: keywordsData.comparisonKeywords.length,
    },
    filters: { type: 'all', detectedFrom: 'Arquivo padrão' },
    headerInfo: {
      period: summaryData.comparisonPeriod.date,
      clicks: String(summaryData.comparisonPeriod.clicks),
      impressions: String(summaryData.comparisonPeriod.impressions),
      ctr: String(summaryData.comparisonPeriod.ctr) + '%',
      position: String(summaryData.comparisonPeriod.position),
    },
  };

  // Calcula variações para o período atual
  if (summaryData.comparisonPeriod.clicks > 0) {
    const clicksChange = ((summaryData.currentPeriod.clicks - summaryData.comparisonPeriod.clicks) / summaryData.comparisonPeriod.clicks) * 100;
    currentPeriodData.metrics[0].change = clicksChange;
  }
  
  if (summaryData.comparisonPeriod.impressions > 0) {
    const impressionsChange = ((summaryData.currentPeriod.impressions - summaryData.comparisonPeriod.impressions) / summaryData.comparisonPeriod.impressions) * 100;
    currentPeriodData.metrics[1].change = impressionsChange;
  }
  
  if (summaryData.comparisonPeriod.position > 0) {
    const positionChange = ((summaryData.comparisonPeriod.position - summaryData.currentPeriod.position) / summaryData.comparisonPeriod.position) * 100;
    currentPeriodData.metrics[2].change = positionChange;
  }
  
  if (summaryData.comparisonPeriod.ctr > 0) {
    const ctrChange = ((summaryData.currentPeriod.ctr - summaryData.comparisonPeriod.ctr) / summaryData.comparisonPeriod.ctr) * 100;
    currentPeriodData.metrics[3].change = ctrChange;
  }

  return [currentPeriodData, comparisonPeriodData];
}

function processSummarySheet(worksheet: XLSX.WorkSheet): {
  currentPeriod: { date: string; clicks: number; impressions: number; ctr: number; position: number };
  comparisonPeriod: { date: string; clicks: number; impressions: number; ctr: number; position: number };
  currentMetrics: GSCMetric[];
  comparisonMetrics: GSCMetric[];
} {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: ''
  }) as any[][];

  if (jsonData.length < 4) {
    throw new Error('Planilha Summary não tem estrutura esperada (mínimo 4 linhas)');
  }

  // Linha 0: Cabeçalho (Período, Cliques, Impressões, CTR, Posição média)
  const headerRow = jsonData[0];
  const headerMap: Record<string, number> = {};
  
  headerRow.forEach((cell: any, index: number) => {
    const cellText = String(cell).toLowerCase().trim();
    if (cellText.includes('período') || cellText.includes('periodo')) headerMap.period = index;
    if (cellText.includes('cliques') || cellText.includes('clicks')) headerMap.clicks = index;
    if (cellText.includes('impressões') || cellText.includes('impressions')) headerMap.impressions = index;
    if (cellText.includes('ctr')) headerMap.ctr = index;
    if (cellText.includes('posição') || cellText.includes('position')) headerMap.position = index;
  });

  // Linha 1: Dados do período de análise
  const currentRow = jsonData[1];
  const currentDate = String(currentRow[headerMap.period] || '').trim();
  const currentClicks = parseFloat(String(currentRow[headerMap.clicks] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const currentImpressions = parseFloat(String(currentRow[headerMap.impressions] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const currentCTR = parseFloat(String(currentRow[headerMap.ctr] || '0').replace(/[^\d.,]/g, '').replace(',', '.').replace('%', '')) || 0;
  const currentPosition = parseFloat(String(currentRow[headerMap.position] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  // Linha 2: Dados do período de comparação
  const comparisonRow = jsonData[2];
  const comparisonDate = String(comparisonRow[headerMap.period] || '').trim();
  const comparisonClicks = parseFloat(String(comparisonRow[headerMap.clicks] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const comparisonImpressions = parseFloat(String(comparisonRow[headerMap.impressions] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const comparisonCTR = parseFloat(String(comparisonRow[headerMap.ctr] || '0').replace(/[^\d.,]/g, '').replace(',', '.').replace('%', '')) || 0;
  const comparisonPosition = parseFloat(String(comparisonRow[headerMap.position] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  const currentPeriod = {
    date: currentDate,
    clicks: currentClicks,
    impressions: currentImpressions,
    ctr: currentCTR,
    position: currentPosition,
  };

  const comparisonPeriod = {
    date: comparisonDate,
    clicks: comparisonClicks,
    impressions: comparisonImpressions,
    ctr: comparisonCTR,
    position: comparisonPosition,
  };

  // Calcula variações
  const clicksChange = comparisonClicks > 0 ? ((currentClicks - comparisonClicks) / comparisonClicks) * 100 : 0;
  const impressionsChange = comparisonImpressions > 0 ? ((currentImpressions - comparisonImpressions) / comparisonImpressions) * 100 : 0;
  const positionChange = comparisonPosition > 0 ? ((comparisonPosition - currentPosition) / comparisonPosition) * 100 : 0; // Invertido
  const ctrChange = comparisonCTR > 0 ? ((currentCTR - comparisonCTR) / comparisonCTR) * 100 : 0;

  const currentMetrics: GSCMetric[] = [
    {
      label: 'Cliques',
      value: currentClicks.toLocaleString('pt-BR'),
      change: clicksChange,
    },
    {
      label: 'Impressões',
      value: currentImpressions.toLocaleString('pt-BR'),
      change: impressionsChange,
    },
    {
      label: 'Posição média',
      value: currentPosition.toFixed(1),
      change: positionChange,
    },
    {
      label: 'CTR médio',
      value: currentCTR.toFixed(2) + '%',
      change: ctrChange,
    },
  ];

  const comparisonMetrics: GSCMetric[] = [
    {
      label: 'Cliques',
      value: comparisonClicks.toLocaleString('pt-BR'),
      change: 0,
    },
    {
      label: 'Impressões',
      value: comparisonImpressions.toLocaleString('pt-BR'),
      change: 0,
    },
    {
      label: 'Posição média',
      value: comparisonPosition.toFixed(1),
      change: 0,
    },
    {
      label: 'CTR médio',
      value: comparisonCTR.toFixed(2) + '%',
      change: 0,
    },
  ];

  return {
    currentPeriod,
    comparisonPeriod,
    currentMetrics,
    comparisonMetrics,
  };
}

function processKeywordsSheet(worksheet: XLSX.WorkSheet, summaryData: any): {
  currentKeywords: GSCKeyword[];
  comparisonKeywords: GSCKeyword[];
  gainsLosses: { title: string; items: { keyword: string; change: string; changeType: 'increase' | 'decrease' }[] }[];
} {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: ''
  }) as any[][];

  if (jsonData.length < 2) {
    return { currentKeywords: [], comparisonKeywords: [], gainsLosses: [] };
  }

  // Linha 0: Cabeçalho
  // Formato esperado: "Palavras-chave, Cliques no período de análise, Cliques no período de comparação, Diferença entre esses períodos, % de diferença"
  const headerRow = jsonData[0];
  const headerMap: Record<string, number> = {};
  
  headerRow.forEach((cell: any, index: number) => {
    const cellText = String(cell).toLowerCase().trim();
    
    // Mapeia coluna de palavras-chave
    if (cellText.includes('palavra') || 
        cellText.includes('keyword') || 
        cellText.includes('consulta') || 
        cellText.includes('query') ||
        cellText.includes('top consultas') ||
        cellText.includes('search query') ||
        cellText.includes('consulta de pesquisa')) {
      headerMap.keyword = index;
    }
    
    // Mapeia cliques do período de análise
    if ((cellText.includes('análise') || cellText.includes('analise') || cellText.includes('atual') || cellText.includes('current')) &&
        (cellText.includes('clique') || cellText.includes('click'))) {
      headerMap.currentClicks = index;
    }
    
    // Mapeia impressões do período de análise
    if ((cellText.includes('análise') || cellText.includes('analise') || cellText.includes('atual') || cellText.includes('current')) &&
        (cellText.includes('impressão') || cellText.includes('impression') || cellText.includes('exposição') || cellText.includes('exposure'))) {
      headerMap.currentImpressions = index;
    }
    
    // Mapeia CTR do período de análise
    if ((cellText.includes('análise') || cellText.includes('analise') || cellText.includes('atual') || cellText.includes('current')) &&
        (cellText.includes('ctr') || cellText.includes('taxa de cliques') || cellText.includes('click-through rate'))) {
      headerMap.currentCTR = index;
    }
    
    // Mapeia posição do período de análise
    if ((cellText.includes('análise') || cellText.includes('analise') || cellText.includes('atual') || cellText.includes('current')) &&
        (cellText.includes('posição') || cellText.includes('position') || cellText.includes('posicao') || cellText.includes('pos.'))) {
      headerMap.currentPosition = index;
    }
    
    // Mapeia cliques do período de comparação
    if ((cellText.includes('comparação') || cellText.includes('comparacao') || cellText.includes('anterior') || cellText.includes('previous') || cellText.includes('comparison')) &&
        (cellText.includes('clique') || cellText.includes('click'))) {
      headerMap.comparisonClicks = index;
    }
    
    // Mapeia impressões do período de comparação
    if ((cellText.includes('comparação') || cellText.includes('comparacao') || cellText.includes('anterior') || cellText.includes('previous') || cellText.includes('comparison')) &&
        (cellText.includes('impressão') || cellText.includes('impression') || cellText.includes('exposição') || cellText.includes('exposure'))) {
      headerMap.comparisonImpressions = index;
    }
    
    // Mapeia CTR do período de comparação
    if ((cellText.includes('comparação') || cellText.includes('comparacao') || cellText.includes('anterior') || cellText.includes('previous') || cellText.includes('comparison')) &&
        (cellText.includes('ctr') || cellText.includes('taxa de cliques') || cellText.includes('click-through rate'))) {
      headerMap.comparisonCTR = index;
    }
    
    // Mapeia posição do período de comparação
    if ((cellText.includes('comparação') || cellText.includes('comparacao') || cellText.includes('anterior') || cellText.includes('previous') || cellText.includes('comparison')) &&
        (cellText.includes('posição') || cellText.includes('position') || cellText.includes('posicao') || cellText.includes('pos.'))) {
      headerMap.comparisonPosition = index;
    }
    
    // Fallback: se não encontrou colunas específicas, tenta colunas genéricas
    if (headerMap.currentClicks === undefined && (cellText.includes('clique') || cellText.includes('click')) && !cellText.includes('comparação') && !cellText.includes('comparacao') && !cellText.includes('anterior')) {
      headerMap.currentClicks = index;
    }
    if (headerMap.currentImpressions === undefined && (cellText.includes('impressão') || cellText.includes('impression')) && !cellText.includes('comparação') && !cellText.includes('comparacao') && !cellText.includes('anterior')) {
      headerMap.currentImpressions = index;
    }
    if (headerMap.currentCTR === undefined && (cellText.includes('ctr') || cellText.includes('taxa de cliques')) && !cellText.includes('comparação') && !cellText.includes('comparacao') && !cellText.includes('anterior')) {
      headerMap.currentCTR = index;
    }
    if (headerMap.currentPosition === undefined && (cellText.includes('posição') || cellText.includes('position')) && !cellText.includes('comparação') && !cellText.includes('comparacao') && !cellText.includes('anterior')) {
      headerMap.currentPosition = index;
    }
    
    // Mapeia diferença (pode ser numérica ou percentual)
    if (cellText.includes('diferença') || cellText.includes('diferenca') || cellText.includes('difference')) {
      if (!headerMap.difference) headerMap.difference = index;
    }
    
    // Mapeia porcentagem de diferença
    if ((cellText.includes('%') || cellText.includes('porcentagem') || cellText.includes('percentual') || cellText.includes('percentage')) &&
        (cellText.includes('diferença') || cellText.includes('diferenca') || cellText.includes('variação') || cellText.includes('variacao') || cellText.includes('difference'))) {
      headerMap.percentage = index;
    }
  });

  const currentKeywords: GSCKeyword[] = [];
  const comparisonKeywords: GSCKeyword[] = [];
  const gains: Array<{ keyword: string; change: string; changeType: 'increase' | 'decrease' }> = [];
  const losses: Array<{ keyword: string; change: string; changeType: 'increase' | 'decrease' }> = [];

  // Processa linhas de dados (começando da linha 1)
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const keyword = String(row[headerMap.keyword] || '').trim();
    if (!keyword) continue;

    // Extrai valores preservando exatamente como estão no Excel
    const currentClicks = parseFloat(String(row[headerMap.currentClicks] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const comparisonClicks = parseFloat(String(row[headerMap.comparisonClicks] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    
    // Tenta usar diferença e porcentagem do arquivo, ou calcula se não estiver disponível
    let difference = 0;
    let percentage = 0;
    
    if (headerMap.difference !== undefined) {
      difference = parseFloat(String(row[headerMap.difference] || '0').replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
    } else {
      difference = currentClicks - comparisonClicks;
    }
    
    if (headerMap.percentage !== undefined) {
      percentage = parseFloat(String(row[headerMap.percentage] || '0').replace(/[^\d.,-]/g, '').replace(',', '.').replace('%', '')) || 0;
    } else if (comparisonClicks > 0) {
      percentage = ((currentClicks - comparisonClicks) / comparisonClicks) * 100;
    }

    // PRIORIDADE 1: Busca valores diretamente do Excel quando disponíveis
    let currentImpressions = 0;
    let comparisonImpressions = 0;
    let currentCTR = 0;
    let comparisonCTR = 0;
    let currentPosition = 0;
    let comparisonPosition = 0;
    
    // Busca impressões do período atual diretamente do Excel
    if (headerMap.currentImpressions !== undefined) {
      currentImpressions = parseFloat(String(row[headerMap.currentImpressions] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    // Busca impressões do período de comparação diretamente do Excel
    if (headerMap.comparisonImpressions !== undefined) {
      comparisonImpressions = parseFloat(String(row[headerMap.comparisonImpressions] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    // Busca CTR do período atual diretamente do Excel
    if (headerMap.currentCTR !== undefined) {
      const ctrValue = String(row[headerMap.currentCTR] || '0');
      currentCTR = parseFloat(ctrValue.replace(/[^\d.,]/g, '').replace(',', '.').replace('%', '')) || 0;
      // Se o valor já está em porcentagem (0-100), mantém; se está em decimal (0-1), converte
      if (currentCTR > 0 && currentCTR < 1) {
        currentCTR = currentCTR * 100;
      }
    }
    
    // Busca CTR do período de comparação diretamente do Excel
    if (headerMap.comparisonCTR !== undefined) {
      const ctrValue = String(row[headerMap.comparisonCTR] || '0');
      comparisonCTR = parseFloat(ctrValue.replace(/[^\d.,]/g, '').replace(',', '.').replace('%', '')) || 0;
      if (comparisonCTR > 0 && comparisonCTR < 1) {
        comparisonCTR = comparisonCTR * 100;
      }
    }
    
    // Busca posição do período atual diretamente do Excel
    if (headerMap.currentPosition !== undefined) {
      currentPosition = parseFloat(String(row[headerMap.currentPosition] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    // Busca posição do período de comparação diretamente do Excel
    if (headerMap.comparisonPosition !== undefined) {
      comparisonPosition = parseFloat(String(row[headerMap.comparisonPosition] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    // PRIORIDADE 2: Calcula valores se não foram encontrados diretamente no Excel
    // Calcula impressões baseado nas proporções do summary (apenas se não encontrou no Excel)
    if (currentImpressions === 0 && summaryData && summaryData.currentPeriod) {
      if (summaryData.currentPeriod.impressions > 0 && summaryData.currentPeriod.clicks > 0) {
        currentImpressions = (currentClicks / summaryData.currentPeriod.clicks) * summaryData.currentPeriod.impressions;
      }
    }
    
    if (comparisonImpressions === 0 && summaryData && summaryData.comparisonPeriod) {
      if (summaryData.comparisonPeriod.impressions > 0 && summaryData.comparisonPeriod.clicks > 0) {
        comparisonImpressions = (comparisonClicks / summaryData.comparisonPeriod.clicks) * summaryData.comparisonPeriod.impressions;
      }
    }
    
    // Calcula CTR se não encontrou no Excel
    if (currentCTR === 0 && currentImpressions > 0) {
      currentCTR = (currentClicks / currentImpressions) * 100;
    }
    
    if (comparisonCTR === 0 && comparisonImpressions > 0) {
      comparisonCTR = (comparisonClicks / comparisonImpressions) * 100;
    }
    
    // Usa posição média do summary se não encontrou no Excel
    if (currentPosition === 0 && summaryData?.currentPeriod?.position) {
      currentPosition = summaryData.currentPeriod.position;
    }
    
    if (comparisonPosition === 0 && summaryData?.comparisonPeriod?.position) {
      comparisonPosition = summaryData.comparisonPeriod.position;
    }
    
    // Validação de dados
    if (currentCTR > 100) currentCTR = 100; // CTR não pode ser maior que 100%
    if (comparisonCTR > 100) comparisonCTR = 100;
    if (currentPosition < 0) currentPosition = 0; // Posição não pode ser negativa
    if (comparisonPosition < 0) comparisonPosition = 0;

    currentKeywords.push({
      keyword,
      clicks: currentClicks,
      impressions: currentImpressions,
      ctr: currentCTR,
      position: currentPosition,
    });

    comparisonKeywords.push({
      keyword,
      clicks: comparisonClicks,
      impressions: comparisonImpressions,
      ctr: comparisonCTR,
      position: comparisonPosition,
    });

    // Classifica como ganho ou perda baseado na diferença ou porcentagem
    const hasGain = difference > 0 || percentage > 0;
    const hasLoss = difference < 0 || percentage < 0;

    if (hasGain) {
      gains.push({
        keyword,
        change: percentage !== 0 
          ? `+${Math.abs(percentage).toFixed(2)}%` 
          : `+${Math.abs(difference).toFixed(0)} cliques`,
        changeType: 'increase',
      });
    } else if (hasLoss) {
      losses.push({
        keyword,
        change: percentage !== 0 
          ? `-${Math.abs(percentage).toFixed(2)}%` 
          : `${difference.toFixed(0)} cliques`,
        changeType: 'decrease',
      });
    }
  }

  // Ordena ganhos por maior diferença/porcentagem
  const sortedGains = gains.sort((a, b) => {
    const aVal = parseFloat(a.change.replace(/[^\d.,-]/g, '').replace(',', '.'));
    const bVal = parseFloat(b.change.replace(/[^\d.,-]/g, '').replace(',', '.'));
    return Math.abs(bVal) - Math.abs(aVal);
  }).slice(0, 5);

  // Ordena perdas por maior diferença/porcentagem (mais negativo primeiro)
  const sortedLosses = losses.sort((a, b) => {
    const aVal = parseFloat(a.change.replace(/[^\d.,-]/g, '').replace(',', '.'));
    const bVal = parseFloat(b.change.replace(/[^\d.,-]/g, '').replace(',', '.'));
    return Math.abs(aVal) - Math.abs(bVal);
  }).slice(0, 5);

  return {
    currentKeywords,
    comparisonKeywords,
    gainsLosses: [
      {
        title: 'Maiores ganhos em palavras-chave',
        items: sortedGains,
      },
      {
        title: 'Maiores perdas em palavras-chave',
        items: sortedLosses,
      },
    ],
  };
}

function extractPeriodsFromFileName(fileName: string): Array<{ start: Date; end: Date; label: string }> {
  const periods: Array<{ start: Date; end: Date; label: string }> = [];
  
  // Procura por padrões de data no formato DD_MM_YYYY
  const datePattern = /(\d{2})_(\d{2})_(\d{4})/g;
  const matches = fileName.matchAll(datePattern);
  const dates: Date[] = [];
  
  for (const match of matches) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Mês é 0-indexed
    const year = parseInt(match[3], 10);
    dates.push(new Date(year, month, day));
  }
  
  // Agrupa datas em pares (início e fim)
  for (let i = 0; i < dates.length; i += 2) {
    if (i + 1 < dates.length) {
      const start = dates[i];
      const end = dates[i + 1];
      periods.push({
        start,
        end,
        label: `${formatDate(start)} a ${formatDate(end)}`,
      });
    }
  }
  
  return periods;
}

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function processMultiplePeriods(workbook: XLSX.WorkBook, periods: Array<{ start: Date; end: Date; label: string }>): ParsedGSCData[] {
  const results: ParsedGSCData[] = [];
  
  // Tenta encontrar planilhas separadas por período
  for (let i = 0; i < workbook.SheetNames.length && i < periods.length; i++) {
    const sheetName = workbook.SheetNames[i];
    const worksheet = workbook.Sheets[sheetName];
    const period = periods[i];
    
    try {
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: ''
      }) as any[][];
      
      if (jsonData.length > 0) {
        const result = processSheetData(jsonData, period);
        results.push(result);
      }
    } catch (error) {
      console.warn(`Erro ao processar planilha ${sheetName}:`, error);
    }
  }
  
  // Se não encontrou planilhas separadas, tenta separar por seções na mesma planilha
  if (results.length === 0 && workbook.SheetNames.length > 0) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    }) as any[][];
    
    // Procura por separadores de período na planilha
    const sections = findPeriodSections(jsonData, periods);
    
    for (const section of sections) {
      try {
        const result = processSheetData(section.data, section.period);
        results.push(result);
      } catch (error) {
        console.warn(`Erro ao processar seção do período ${section.period.label}:`, error);
      }
    }
  }
  
  return results;
}

function findPeriodSections(data: any[][], periods: Array<{ start: Date; end: Date; label: string }>): Array<{ data: any[][]; period: { start: Date; end: Date; label: string } }> {
  const sections: Array<{ data: any[][]; period: { start: Date; end: Date; label: string } }> = [];
  
  // Procura por cabeçalhos que indiquem início de um período
  let currentSectionStart = 0;
  let currentPeriodIndex = 0;
  
  for (let i = 0; i < data.length && currentPeriodIndex < periods.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const rowText = row.map((cell: any) => String(cell).toLowerCase()).join(' ');
    const period = periods[currentPeriodIndex];
    
    // Verifica se a linha contém informações do período
    const periodStartStr = formatDate(period.start).replace(/\//g, '');
    const periodEndStr = formatDate(period.end).replace(/\//g, '');
    
    if (rowText.includes(periodStartStr) || rowText.includes(periodEndStr) || 
        (rowText.includes('período') && currentPeriodIndex === 0)) {
      
      // Se já temos uma seção anterior, finaliza ela
      if (currentSectionStart < i && currentPeriodIndex > 0) {
        sections.push({
          data: data.slice(currentSectionStart, i),
          period: periods[currentPeriodIndex - 1],
        });
      }
      
      currentSectionStart = i;
      currentPeriodIndex++;
    }
  }
  
  // Adiciona a última seção
  if (currentSectionStart < data.length && currentPeriodIndex > 0) {
    sections.push({
      data: data.slice(currentSectionStart),
      period: periods[currentPeriodIndex - 1],
    });
  }
  
  // Se não encontrou seções separadas, retorna a planilha inteira para o primeiro período
  if (sections.length === 0) {
    sections.push({
      data,
      period: periods[0],
    });
  }
  
  return sections;
}

function processSinglePeriod(workbook: XLSX.WorkBook): ParsedGSCData {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: ''
  }) as any[][];
  
  return processSheetData(jsonData);
}

function processSheetData(jsonData: any[][], period?: { start: Date; end: Date; label: string }): ParsedGSCData {
  if (jsonData.length === 0) {
    throw new Error('Arquivo Excel vazio ou sem dados');
  }

  // Captura informações da primeira linha (geralmente contém resumo de dados)
  const firstLineInfo = extractFirstLineInfo(jsonData);

  // Encontra o cabeçalho
  const headerRow = findHeaderRow(jsonData);
  if (headerRow === -1) {
    throw new Error('Não foi possível encontrar o cabeçalho no arquivo');
  }

  const headers = jsonData[headerRow].map((h: any) => 
    String(h).toLowerCase().trim()
  );

  // Mapeia colunas
  const columnMap = mapColumns(headers);
  
  if (columnMap.query === -1) {
    throw new Error('Coluna de palavras-chave não encontrada. Procure por colunas como "Top consultas", "Query", "Palavra-chave" ou "Consulta". Verifique se o arquivo é do Google Search Console.');
  }

  // Processa dados
  const keywords: GSCKeyword[] = [];
  
  for (let i = headerRow + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const keyword = String(row[columnMap.query] || '').trim();
    if (!keyword) continue;

    const clicks = parseFloat(String(row[columnMap.clicks] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const impressions = parseFloat(String(row[columnMap.impressions] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const ctr = parseFloat(String(row[columnMap.ctr] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const position = parseFloat(String(row[columnMap.position] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

    keywords.push({
      keyword,
      clicks,
      impressions,
      ctr,
      position,
    });
  }

        // Calcula métricas agregadas
        // Cliques e Impressões: soma total
        const totalClicks = keywords.reduce((sum, k) => sum + k.clicks, 0);
        const totalImpressions = keywords.reduce((sum, k) => sum + k.impressions, 0);
        
        // CTR: média das porcentagens (não calcula como totalClicks/totalImpressions)
        const avgCTR = keywords.length > 0 && keywords.some(k => k.ctr > 0)
          ? keywords.filter(k => k.ctr > 0).reduce((sum, k) => sum + k.ctr, 0) / keywords.filter(k => k.ctr > 0).length
          : (totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0);
        
        // Posição média: média aritmética simples de todas as posições
        const avgPosition = keywords.length > 0 && keywords.some(k => k.position > 0)
          ? keywords.filter(k => k.position > 0).reduce((sum, k) => sum + k.position, 0) / keywords.filter(k => k.position > 0).length
          : 0;

        // Detecta filtros aplicados (Site vs Blog)
        const detectedFilter = detectFilterType(jsonData, headerRow);
        
        // Adiciona informações do período se fornecido
        if (period) {
          firstLineInfo.period = period.label;
        }

        // Formata números preservando valores exatos do GSC
        const formatNumber = (num: number, decimals: number = 0): string => {
          // Preserva valores exatos, apenas formata para exibição
          if (num >= 1000 && num < 1000000) {
            return (num / 1000).toFixed(decimals) + ' mil';
          } else if (num >= 1000000) {
            return (num / 1000000).toFixed(decimals) + ' mi';
          }
          return num.toFixed(decimals);
        };

        // Formata valores exatamente como aparecem no GSC
        const formatCTR = (ctr: number): string => {
          return ctr.toFixed(2) + '%';
        };

        const formatPosition = (pos: number): string => {
          return pos.toFixed(1);
        };

        const metrics: GSCMetric[] = [
          {
            label: 'Cliques',
            value: totalClicks.toLocaleString('pt-BR'), // Preserva número exato
            change: 0,
          },
          {
            label: 'Impressões',
            value: totalImpressions.toLocaleString('pt-BR'), // Preserva número exato
            change: 0,
          },
          {
            label: 'Posição média',
            value: formatPosition(avgPosition),
            change: 0,
          },
          {
            label: 'CTR médio',
            value: formatCTR(avgCTR),
            change: 0,
          },
        ];

        // Top palavras-chave
        const sortedByClicks = [...keywords]
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 20);

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
          keywords,
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
            keywordCount: keywords.length,
          },
          filters: detectedFilter,
          headerInfo: firstLineInfo,
        };
}

function findHeaderRow(data: any[][]): number {
  // Procura por linhas que contenham palavras-chave comuns do GSC
  const keywords = [
    'query', 
    'palavra', 
    'keyword', 
    'consulta', 
    'top consultas',
    'cliques', 
    'clicks', 
    'impressões', 
    'impressions',
    'ctr',
    'position',
    'posição'
  ];
  
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (!row) continue;
    
    const rowText = row.map((cell: any) => String(cell).toLowerCase().trim()).join(' ');
    const hasKeywords = keywords.some(kw => rowText.includes(kw.toLowerCase()));
    
    if (hasKeywords) {
      return i;
    }
  }
  
  return 0; // Retorna primeira linha se não encontrar
}

function mapColumns(headers: string[]): {
  query: number;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
} {
  const map: any = {
    query: -1,
    clicks: -1,
    impressions: -1,
    ctr: -1,
    position: -1,
  };

  headers.forEach((header, index) => {
    const h = header.toLowerCase().trim();
    
    // Mapeia coluna de palavras-chave (query)
    if (h.includes('query') || 
        h.includes('palavra') || 
        h.includes('keyword') || 
        h.includes('consulta') ||
        h.includes('top consultas') ||
        h === 'top consultas' ||
        h.includes('search query') ||
        h.includes('consulta de pesquisa')) {
      map.query = index;
    }
    
    // Mapeia coluna de cliques
    if (h.includes('cliques') || h.includes('clicks') || h.includes('clique')) {
      map.clicks = index;
    }
    
    // Mapeia coluna de impressões
    if (h.includes('impressões') || 
        h.includes('impressions') || 
        h.includes('exposições') ||
        h.includes('exposicoes')) {
      map.impressions = index;
    }
    
    // Mapeia coluna de CTR
    if (h.includes('ctr') || 
        h.includes('taxa de cliques') ||
        h.includes('click-through rate')) {
      map.ctr = index;
    }
    
    // Mapeia coluna de posição
    if (h.includes('posição') || 
        h.includes('position') || 
        h.includes('posicao') ||
        h.includes('pos.') ||
        h.includes('avg. position') ||
        h.includes('posição média')) {
      map.position = index;
    }
  });

  return map;
}

function extractFirstLineInfo(data: any[][]): { period?: string; clicks?: string; impressions?: string; ctr?: string; position?: string; rawLines?: string[] } {
  const info: any = { rawLines: [] };
  
  // Captura as primeiras linhas (geralmente 0-10) que podem conter informações de resumo
  // Aumentado para 10 para capturar melhor as informações de período
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const rowText = row.map((cell: any) => String(cell).trim()).filter(c => c).join(' | ');
    if (rowText) {
      info.rawLines.push(rowText);
    }
    
    // Tenta extrair informações específicas
    const lowerText = rowText.toLowerCase();
    
    // Procura por período/data (mais abrangente)
    if ((lowerText.includes('período') || 
         lowerText.includes('periodo') || 
         lowerText.includes('data') ||
         lowerText.includes('de') && lowerText.includes('até') ||
         lowerText.includes('from') && lowerText.includes('to') ||
         /\d{1,2}\/\d{1,2}\/\d{4}/.test(rowText)) && !info.period) {
      info.period = rowText;
    }
    
    // Procura por informações de cliques
    if (lowerText.includes('cliques') || lowerText.includes('clicks')) {
      info.clicks = rowText;
    }
    
    // Procura por impressões
    if (lowerText.includes('impressões') || lowerText.includes('impressions')) {
      info.impressions = rowText;
    }
    
    // Procura por CTR
    if (lowerText.includes('ctr')) {
      info.ctr = rowText;
    }
    
    // Procura por posição
    if (lowerText.includes('posição') || lowerText.includes('position')) {
      info.position = rowText;
    }
  }
  
  return info;
}

function detectFilterType(data: any[][], headerRow: number): { type?: 'site' | 'blog' | 'all'; detectedFrom?: string } {
  // Procura por indicadores de filtro nas primeiras linhas ou no nome da planilha
  const searchTerms = {
    blog: ['blog', '/blog', 'blog/', 'artigo', 'post'],
    site: ['site', 'página', 'page', 'home', 'principal'],
  };

  // Verifica nas primeiras linhas
  for (let i = 0; i < Math.min(5, headerRow); i++) {
    const row = data[i];
    if (!row) continue;
    
    const rowText = row.map((cell: any) => String(cell).toLowerCase()).join(' ');
    
    if (searchTerms.blog.some(term => rowText.includes(term))) {
      return { type: 'blog', detectedFrom: `Linha ${i + 1}` };
    }
    if (searchTerms.site.some(term => rowText.includes(term))) {
      return { type: 'site', detectedFrom: `Linha ${i + 1}` };
    }
  }

  // Verifica nas palavras-chave (se muitas contêm /blog, é blog)
  const blogKeywords = data.slice(headerRow + 1, headerRow + 100)
    .filter(row => row && row[0] && String(row[0]).toLowerCase().includes('blog')).length;
  
  if (blogKeywords > 10) {
    return { type: 'blog', detectedFrom: 'Palavras-chave com "blog"' };
  }

  return { type: 'all', detectedFrom: 'Não detectado' };
}
