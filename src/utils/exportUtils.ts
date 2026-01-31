import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Aguarda o browser terminar layout e paint (2 frames). */
function afterLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export const exportToPDF = async (elementId: string, filename: string = 'relatorio.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento não encontrado');
  }

  // Garantir que o elemento está visível e layout concluído (evita PDF em branco)
  element.scrollIntoView({ behavior: 'instant', block: 'start' });
  await afterLayout();

  const singlePageClass = 'report-pdf-single-page';
  try {
    // Compactar levemente o texto para caber em 1 folha sem distorcer a fonte
    element.classList.add(singlePageClass);
    await afterLayout();

    // Escala 1.5: captura para 1 folha com fonte legível (não reduzir demais)
    const captureScale = 1.5;
    const canvas = await html2canvas(element, {
      scale: captureScale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const pageH = 297;

    // Proporção do conteúdo (mesma do canvas)
    const contentAspect = canvas.width / canvas.height;
    const pageAspect = pageW / pageH;

    // Caber em 1 página: escala uniforme, sem distorcer a fonte
    let drawW: number;
    let drawH: number;
    if (contentAspect >= pageAspect) {
      drawW = pageW;
      drawH = pageW / contentAspect;
    } else {
      drawH = pageH;
      drawW = pageH * contentAspect;
    }

    // Centralizar na folha
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);
    pdf.save(filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  } finally {
    element.classList.remove(singlePageClass);
  }
};

export const exportToHTML = (htmlContent: string, filename: string = 'relatorio.html') => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
