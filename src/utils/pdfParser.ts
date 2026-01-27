import { ParsedGSCData } from './xlsxParser';
import { extractPDFDataWithAgent } from '../agents/pdfExtractionAgent';

/**
 * Processa um arquivo PDF do Google Search Console usando um agente de IA
 * Fluxo: PDF -> Extrai texto -> Agente de IA extrai dados -> Retorna dados estruturados
 */
export async function parsePDFData(file: File): Promise<ParsedGSCData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error('Erro ao ler o arquivo PDF'));
          return;
        }

        // Usa pdfjs-dist para extrair texto do PDF
        const pdfjsLib = await import('pdfjs-dist');
        
        // Configura worker usando arquivo local na pasta public
        // O arquivo pdf.worker.min.mjs deve estar em /public/
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        // Extrai texto de todas as páginas preservando estrutura de linhas
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Processa items agrupando por linha (Y coordenada)
          const items = textContent.items as any[];
          const linesMap = new Map<number, string[]>();
          
          for (const item of items) {
            const y = Math.round(item.transform[5]);
            if (!linesMap.has(y)) {
              linesMap.set(y, []);
            }
            linesMap.get(y)!.push(item.str);
          }
          
          // Ordena linhas por Y (de cima para baixo) e junta texto
          const sortedLines = Array.from(linesMap.entries())
            .sort((a, b) => b[0] - a[0]) // Ordem reversa (Y maior = mais acima)
            .map(([, texts]) => texts.join(' ').trim());
          
          fullText += sortedLines.join('\n') + '\n';
        }

        // Envia o texto para o agente de IA extrair os dados estruturados
        console.log('Enviando texto do PDF para o agente de IA extrair dados...');
        const result = await extractPDFDataWithAgent(fullText, file.name);
        console.log('Dados extraídos pelo agente:', result);
        resolve(result);
      } catch (error: any) {
        reject(new Error(`Erro ao processar PDF: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo PDF'));
    };

    reader.readAsArrayBuffer(file);
  });
}
