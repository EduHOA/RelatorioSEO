import { ReportConfig, ReportSection } from '../types/report';

const defaultKpiMetrics = [
  { label: 'Cliques', value: '—', change: 0, changeType: 'neutral' as const },
  { label: 'Impressões', value: '—', change: 0, changeType: 'neutral' as const },
  { label: 'Posição média', value: '—', change: 0, changeType: 'neutral' as const },
  { label: 'CTR médio', value: '—', change: 0, changeType: 'neutral' as const },
  { label: 'Sessões orgânicas', value: '—', change: 0, changeType: 'neutral' as const },
];

const trafficLlmKpiMetrics = [
  { label: 'Sessões', value: '—', change: 0, changeType: 'neutral' as const },
  { label: 'Novos usuários', value: '—', change: 0, changeType: 'neutral' as const },
  { label: 'Total de usuários', value: '—', change: 0, changeType: 'neutral' as const },
  { label: 'Taxa de engajamento', value: '—', change: 0, changeType: 'neutral' as const },
];

const defaultGainsLosses = [
  { title: 'Maiores ganhos em palavras-chave', items: [] },
  { title: 'Maiores perdas em palavras-chave', items: [] },
];

const defaultMetaSEO = {
  description: 'A meta definida abaixo é válida para o período. Ao final desse ciclo, será realizado um novo levantamento para reavaliação dos resultados.',
  metas: [
    { label: 'Sessões orgânicas', target: '—', growth: '—', current: '—', percentage: 0 },
    { label: 'Impressões (Acumulado)', target: '—', growth: '—', current: '—', percentage: 0, color: 'gray' as const },
  ],
  analysis: '',
};

const defaultCompetitorBarGroups = [
  { label: 'Tráfego orgânico dos concorrentes', competitors: [], subtitle: '' },
  { label: 'Total de palavras-chave no Top 3', competitors: [], subtitle: '' },
  { label: 'Total de palavras-chave no Top 4-10', competitors: [], subtitle: '' },
  { label: 'Autoridade de domínio (DR)', competitors: [], subtitle: '' },
];

function buildSections(clientName: string, period: string, hasBlog: boolean): ReportSection[] {
  let order = 0;
  const sections: ReportSection[] = [];

  // 1. Header
  sections.push({
    id: 'header-1',
    type: 'header',
    visible: true,
    order: order++,
    data: {
      clientName,
      domain: '',
      periodInfo: period,
      comparisonPeriod: 'Ano anterior',
      logo: '',
    },
  });

  // 2. Meta SEO
  sections.push({
    id: 'meta-seo-1',
    type: 'metaSEO',
    title: 'Meta SEO',
    visible: true,
    order: order++,
    data: { metaSEO: defaultMetaSEO },
  });

  // 3. Grid de KPIs
  sections.push({
    id: 'kpi-grid-1',
    type: 'kpiGrid',
    title: 'Principais Métricas do Site',
    visible: true,
    order: order++,
    data: { comparisonPeriod: 'periodo_anterior', metrics: [...defaultKpiMetrics] },
  });

  // 4. Palavras-chave e URLs
  sections.push({
    id: 'gains-losses-1',
    type: 'gainsLosses',
    title: 'Palavras-chave e URLs',
    visible: true,
    order: order++,
    data: { gainsLosses: JSON.parse(JSON.stringify(defaultGainsLosses)) },
  });

  // 5. Análise
  sections.push({
    id: 'analysis-1',
    type: 'analysis',
    title: 'Análise',
    visible: true,
    order: order++,
    data: { title: 'Análise', analysis: '' },
  });

  // --- Bloco Blog (se cliente tem blog) ---
  if (hasBlog) {
    sections.push({
      id: 'kpi-grid-blog-1',
      type: 'kpiGrid',
      title: 'Principais Métricas do Blog',
      visible: true,
      order: order++,
      data: { comparisonPeriod: 'periodo_anterior', metrics: [...defaultKpiMetrics] },
    });
    sections.push({
      id: 'gains-losses-blog-1',
      type: 'gainsLosses',
      title: 'Palavras-chave e URLs do blog',
      visible: true,
      order: order++,
      data: { gainsLosses: JSON.parse(JSON.stringify(defaultGainsLosses)) },
    });
    sections.push({
      id: 'analysis-blog-1',
      type: 'analysis',
title: 'Análise do blog',
    visible: true,
    order: order++,
    data: { title: 'Análise do blog', analysis: '' },
    });
  }

  // 6. Tráfego por LLMs – Grid de KPIs
  sections.push({
    id: 'kpi-grid-traffic-llm-1',
    type: 'kpiGrid',
    title: 'Tráfego por LLMs',
    visible: true,
    order: order++,
    data: { comparisonPeriod: 'periodo_anterior', metrics: [...trafficLlmKpiMetrics] },
  });

  // 7. Tráfego por LLMs – Análise
  sections.push({
    id: 'analysis-traffic-llm-1',
    type: 'analysis',
    title: 'Análise (Tráfego por LLMs)',
    visible: true,
    order: order++,
    data: { title: 'Análise', analysis: '' },
  });

  // 8. Análise de concorrentes
  sections.push({
    id: 'competitor-1',
    type: 'competitorAnalysis',
    title: 'Análise de concorrentes',
    visible: true,
    order: order++,
    data: { barGroups: JSON.parse(JSON.stringify(defaultCompetitorBarGroups)) },
  });

  // 9. Análise
  sections.push({
    id: 'analysis-2',
    type: 'analysis',
    title: 'Análise',
    visible: true,
    order: order++,
    data: { title: 'Análise', analysis: '' },
  });

  // 10. Ações finalizadas
  sections.push({
    id: 'status-cards-1',
    type: 'statusCards',
    title: 'Ações finalizadas',
    visible: true,
    order: order++,
    data: { cards: [] },
  });

  // 11. Ações em andamento
  sections.push({
    id: 'actions-1',
    type: 'actions',
    title: 'Ações em andamento',
    visible: true,
    order: order++,
    data: { actions: [] },
  });

  // 12. Conclusão
  sections.push({
    id: 'analysis-conclusao-1',
    type: 'analysis',
    title: 'Conclusão',
    visible: true,
    order: order++,
    data: { title: 'Conclusão', analysis: '' },
  });

  return sections;
}

export const createDefaultReport = (clientName: string, period: string, hasBlog = false): ReportConfig => {
  return {
    id: `report-${Date.now()}`,
    name: `Relatório ${clientName} - ${period}`,
    clientName,
    period,
    logo: '',
    hasBlog,
    colors: {
      primary: '#ff9a05',
      secondary: '#ffb74d',
      accent: '#ff9a05',
      text: '#333333',
      background: '#f4f6f9',
    },
    sections: buildSections(clientName, period, hasBlog),
    images: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Equipe liveSEO',
    },
  };
};
