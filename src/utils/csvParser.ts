import { ParsedGSCData, GSCKeyword, GSCMetric } from './xlsxParser';

/**
 * Processa um arquivo CSV do Google Search Console
 */
export async function parseCSVData(file: File): Promise<ParsedGSCData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error('Erro ao ler o arquivo CSV'));
          return;
        }

        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          reject(new Error('Arquivo CSV muito pequeno ou vazio'));
          return;
        }

        // Encontra cabeçalho
        const headerLine = lines[0];
        const headers = parseCSVLine(headerLine);
        const headerMap = mapCSVColumns(headers);

        if (headerMap.query === -1) {
          reject(new Error('Coluna de palavras-chave não encontrada no CSV. Procure por colunas como "Top consultas", "Query", "Palavra-chave" ou "Consulta".'));
          return;
        }

        // Processa linhas de dados
        const keywords: GSCKeyword[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const row = parseCSVLine(line);
          if (row.length === 0) continue;

          const keyword = String(row[headerMap.query] || '').trim();
          if (!keyword) continue;

          const clicks = parseFloat(String(row[headerMap.clicks] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const impressions = parseFloat(String(row[headerMap.impressions] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const ctr = parseFloat(String(row[headerMap.ctr] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const position = parseFloat(String(row[headerMap.position] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

          keywords.push({
            keyword,
            clicks,
            impressions,
            ctr,
            position,
          });
        }

        // Calcula métricas agregadas
        const totalClicks = keywords.reduce((sum, k) => sum + k.clicks, 0);
        const totalImpressions = keywords.reduce((sum, k) => sum + k.impressions, 0);
        
        // CTR: média das porcentagens
        const avgCTR = keywords.length > 0 && keywords.some(k => k.ctr > 0)
          ? keywords.filter(k => k.ctr > 0).reduce((sum, k) => sum + k.ctr, 0) / keywords.filter(k => k.ctr > 0).length
          : (totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0);
        
        // Posição média: média aritmética simples
        const avgPosition = keywords.length > 0 && keywords.some(k => k.position > 0)
          ? keywords.filter(k => k.position > 0).reduce((sum, k) => sum + k.position, 0) / keywords.filter(k => k.position > 0).length
          : 0;

        const metrics: GSCMetric[] = [
          {
            label: 'Cliques',
            value: totalClicks.toLocaleString('pt-BR'),
            change: 0,
          },
          {
            label: 'Impressões',
            value: totalImpressions.toLocaleString('pt-BR'),
            change: 0,
          },
          {
            label: 'Posição média',
            value: avgPosition.toFixed(1),
            change: 0,
          },
          {
            label: 'CTR médio',
            value: avgCTR.toFixed(2) + '%',
            change: 0,
          },
        ];

        // Top palavras-chave
        const sortedByClicks = [...keywords]
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

        // Tenta extrair período do nome do arquivo
        const fileName = file.name;
        const periodMatch = fileName.match(/(\d{1,2})[\/\-_](\d{1,2})[\/\-_](\d{4})/g);
        const period = periodMatch ? periodMatch[0] : 'Período do arquivo';

        const result: ParsedGSCData = {
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
          filters: {
            type: 'all',
            detectedFrom: `Arquivo CSV: ${fileName}`,
          },
          headerInfo: {
            period,
            clicks: String(totalClicks),
            impressions: String(totalImpressions),
            ctr: avgCTR.toFixed(2) + '%',
            position: avgPosition.toFixed(1),
            rawLines: [`Arquivo: ${fileName}`, `Período: ${period}`],
          },
        };

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo CSV'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parse uma linha CSV, lidando com vírgulas dentro de aspas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Mapeia colunas do CSV para os campos esperados
 */
function mapCSVColumns(headers: string[]): {
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
    
    // Mapeia coluna de palavras-chave
    if (h.includes('query') || 
        h.includes('palavra') || 
        h.includes('keyword') || 
        h.includes('consulta') ||
        h.includes('top consultas') ||
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
