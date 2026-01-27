import OpenAI from 'openai';
import { ParsedGSCData, GSCKeyword, GSCMetric } from '../utils/xlsxParser';

export interface ExtractedPDFData {
  metrics: {
    clicks: { current: number; previous: number; change: number };
    impressions: { current: number; previous: number; change: number };
    ctr: { current: number; previous: number; change: number };
    position: { current: number; previous: number; change: number };
  };
  keywords: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    clicksDiff?: number;
    impressionsDiff?: number;
    positionDiff?: number;
  }>;
  pages: Array<{
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    clicksDiff?: number;
    impressionsDiff?: number;
    positionDiff?: number;
  }>;
}

/**
 * Agente de IA especializado em extrair dados estruturados de PDFs do Google Search Console
 */
export class PDFExtractionAgent {
  private client: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  /**
   * Extrai dados estruturados de um PDF usando ChatGPT como agente
   */
  async extractData(pdfText: string, fileName: string): Promise<ParsedGSCData> {
    try {
      // Primeira etapa: Análise e extração estruturada
      const extractedData = await this.extractStructuredData(pdfText);
      
      // Segunda etapa: Conversão para formato do sistema
      const parsedData = this.convertToParsedGSCData(extractedData, fileName);
      
      return parsedData;
    } catch (error: any) {
      console.error('Erro no agente de extração:', error);
      throw new Error(`Erro ao extrair dados do PDF: ${error.message || 'Erro desconhecido'}`);
    }
  }

  /**
   * Etapa 1: Extrai dados estruturados do texto do PDF
   */
  private async extractStructuredData(pdfText: string): Promise<ExtractedPDFData> {
    const systemPrompt = `Você é um agente especializado em extrair dados estruturados de relatórios PDF do Google Search Console.

Sua função é analisar o texto extraído de um PDF e retornar APENAS um JSON válido com todos os dados das 3 tabelas principais:
1. Visão Geral do Período (métricas de: Cliques, Impressões, CTR, Posição média e com comparação)
modelo: Métrica
Período Atual
Período Anterior
Variação (%)
2. Top 10 Palavras-chave por Cliques (palavra-chave, cliques, impressões, CTR, Posição média e com comparação)
3. Top 10 Páginas por Cliques (URL, cliques, impressões, CTR, Posição média e com comparação)

IMPORTANTE:
- Extraia valores EXATOS como aparecem no PDF
- Preserve números com pontos de milhar (ex: 43.300 = 43300)
- CTR pode estar em porcentagem (ex: 1,20% = 1.20)
- Posição pode estar em decimal (ex: 6,3 = 6.3)
- Mantenha a ordem exata das palavras-chave e páginas
- Se algum valor não estiver disponível, use null
- Retorne APENAS JSON válido, sem markdown, sem explicações`;

    const userPrompt = `Analise o texto abaixo extraído de um PDF do Google Search Console e extraia TODOS os dados das 3 tabelas principais:

1. **PRIMEIRA TABELA - Visão Geral do Período (Resultados Gerais)**
   - Total de Cliques (Período Atual e Período Anterior)
   - Total de Impressões (Período Atual e Período Anterior)
   - CTR Médio (Período Atual e Período Anterior)
   - Posição Média (Período Atual e Período Anterior)
   - Calcule as variações percentuais

2. **SEGUNDA TABELA - Top 10 Palavras-chave por Cliques**
   - Extraia TODAS as palavras-chave na ordem que aparecem
   - Para cada palavra-chave: Cliques, Impressões, CTR (%), Posição Média
   - Se houver diferenças/variações, inclua também
   - MANTENHA A ORDEM ORIGINAL do PDF

3. **TERCEIRA TABELA - Top 10 Páginas por Cliques**
   - Extraia TODAS as URLs/páginas na ordem que aparecem
   - Para cada página: Cliques, Impressões, CTR (%), Posição Média
   - Se houver variações, inclua também
   - MANTENHA A ORDEM ORIGINAL do PDF

TEXTO DO PDF:
${pdfText}

Retorne APENAS um JSON válido no seguinte formato:

{
  "metrics": {
    "clicks": {
      "current": 43300,
      "previous": 44000,
      "change": -1.59
    },
    "impressions": {
      "current": 3670000,
      "previous": 3450000,
      "change": 6.38
    },
    "ctr": {
      "current": 1.20,
      "previous": 1.30,
      "change": -7.69
    },
    "position": {
      "current": 6.3,
      "previous": 11.0,
      "change": 42.73
    }
  },
  "keywords": [
    {
      "keyword": "qualyteam",
      "clicks": 10100,
      "impressions": 19027,
      "ctr": 53.1,
      "position": 1.2,
      "clicksDiff": 2269,
      "impressionsDiff": -2119,
      "positionDiff": 0.1
    }
  ],
  "pages": [
    {
      "url": ".../pb/ (Home)",
      "clicks": 10794,
      "impressions": 34978,
      "ctr": 30.9,
      "position": 3.5,
      "clicksDiff": 2364,
      "impressionsDiff": -11262,
      "positionDiff": -4.7
    }
  ]
}`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3, // Temperatura baixa para respostas mais precisas
      response_format: { type: 'json_object' } // Força resposta em JSON
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse do JSON retornado
    try {
      let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Tenta encontrar o JSON mesmo se houver texto antes/depois
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const extractedData = JSON.parse(jsonText) as ExtractedPDFData;
      
      // Validação básica dos dados extraídos
      this.validateExtractedData(extractedData);
      
      return extractedData;
    } catch (e) {
      console.error('Erro ao parsear JSON do agente:', e);
      console.error('Resposta recebida:', responseText);
      throw new Error('O agente não retornou um JSON válido. Tente novamente.');
    }
  }

  /**
   * Valida os dados extraídos pelo agente
   */
  private validateExtractedData(data: ExtractedPDFData): void {
    if (!data.metrics) {
      throw new Error('Dados de métricas não encontrados na resposta do agente');
    }
    
    if (!data.keywords || !Array.isArray(data.keywords)) {
      throw new Error('Dados de palavras-chave não encontrados na resposta do agente');
    }
    
    if (!data.pages || !Array.isArray(data.pages)) {
      throw new Error('Dados de páginas não encontrados na resposta do agente');
    }
  }

  /**
   * Etapa 2: Converte dados extraídos para formato ParsedGSCData
   */
  private convertToParsedGSCData(
    data: ExtractedPDFData,
    fileName: string
  ): ParsedGSCData {
    // Converte métricas
    const metrics: GSCMetric[] = [
      {
        label: 'Cliques',
        value: data.metrics.clicks.current.toLocaleString('pt-BR'),
        change: data.metrics.clicks.change,
      },
      {
        label: 'Impressões',
        value: data.metrics.impressions.current.toLocaleString('pt-BR'),
        change: data.metrics.impressions.change,
      },
      {
        label: 'Posição média',
        value: data.metrics.position.current.toFixed(1),
        change: data.metrics.position.change,
      },
      {
        label: 'CTR médio',
        value: data.metrics.ctr.current.toFixed(2) + '%',
        change: data.metrics.ctr.change,
      },
    ];

    // Converte palavras-chave (mantém ordem original)
    const keywords: GSCKeyword[] = data.keywords.map(k => ({
      keyword: k.keyword,
      clicks: k.clicks,
      impressions: k.impressions,
      ctr: k.ctr, // Já está em porcentagem
      position: k.position,
    }));

    // Calcula gains/losses
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
        totalClicks: data.metrics.clicks.current,
        totalImpressions: data.metrics.impressions.current,
        avgCTR: data.metrics.ctr.current,
        avgPosition: data.metrics.position.current,
        keywordCount: keywords.length,
        pages: data.pages, // Armazena páginas extraídas
      } as any,
      filters: {
        type: 'all',
        detectedFrom: `Arquivo PDF: ${fileName}`,
      },
      headerInfo: {
        period: 'Período do PDF',
        clicks: String(data.metrics.clicks.current),
        impressions: String(data.metrics.impressions.current),
        ctr: data.metrics.ctr.current.toFixed(2) + '%',
        position: data.metrics.position.current.toFixed(1),
        rawLines: [`Arquivo: ${fileName}`],
      },
    };
  }
}

/**
 * Factory function para criar uma instância do agente
 */
export function createPDFExtractionAgent(apiKey: string): PDFExtractionAgent {
  return new PDFExtractionAgent(apiKey);
}

/**
 * Função helper para obter a API key do .env e criar o agente
 */
export async function extractPDFDataWithAgent(
  pdfText: string,
  fileName: string
): Promise<ParsedGSCData> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'VITE_OPENAI_API_KEY não configurada. Adicione no .env: VITE_OPENAI_API_KEY=sua_chave'
    );
  }

  const agent = createPDFExtractionAgent(apiKey);
  return agent.extractData(pdfText, fileName);
}
