import { ReportConfig } from '../types/report';

export const createDefaultReport = (clientName: string, period: string): ReportConfig => {
  return {
    id: `report-${Date.now()}`,
    name: `Relatório ${clientName} - ${period}`,
    clientName,
    period,
    logo: 'https://www.linx.com.br/app/uploads/2022/07/liveSEO-logo-aplicacao-principal-1-1.png',
    colors: {
      primary: '#ff9a05',
      secondary: '#ffb74d',
      accent: '#ff9a05',
      text: '#333333',
      background: '#f4f6f9',
    },
    sections: [
      {
        id: 'header-1',
        type: 'header',
        visible: true,
        order: 0,
        data: {
          clientName,
          domain: '',
          periodInfo: period,
          comparisonPeriod: 'Ano anterior',
          logo: 'https://www.linx.com.br/app/uploads/2022/07/liveSEO-logo-aplicacao-principal-1-1.png',
        },
      },
      {
        id: 'meta-seo-1',
        type: 'metaSEO',
        title: 'Meta SEO',
        visible: true,
        order: 1,
        data: {
          metaSEO: {
            description: 'A meta definida abaixo é válida para o período. Ao final desse ciclo, será realizado um novo levantamento para reavaliação dos resultados.',
            metas: [
              {
                label: 'Sessões orgânicas',
                target: '1.728',
                growth: '16,36%',
                current: '1.3 mil sessões',
                percentage: 76,
              },
              {
                label: 'Impressões (Acumulado)',
                target: '136.089',
                growth: '9,32%',
                current: '68.0 mil',
                percentage: 50,
                color: 'gray',
              },
            ],
            analysis: 'O projeto apresenta desempenho sólido em sessões, atingindo 76% da meta conservadora.',
          },
        },
      },
      {
        id: 'kpi-grid-1',
        type: 'kpiGrid',
        title: 'Principais Métricas do Site',
        visible: true,
        order: 2,
        data: {
          comparisonPeriod: 'periodo_anterior',
          metrics: [
            {
              label: 'Cliques',
              value: '590',
              change: 34.09,
              changeType: 'increase',
            },
            {
              label: 'Impressões',
              value: '34,4 mil',
              change: -60.98,
              changeType: 'decrease',
            },
            {
              label: 'Posição média',
              value: '12,5',
              change: 72.41,
              changeType: 'increase',
            },
            {
              label: 'CTR médio',
              value: '1,7%',
              change: 240,
              changeType: 'increase',
            },
            {
              label: 'Sessões orgânicas',
              value: '895',
              change: 34.4,
              changeType: 'increase',
            },
            {
              label: 'Novos usuários orgânicos',
              value: '503',
              change: 36.3,
              changeType: 'increase',
            },
            {
              label: 'Tempo médio de sessão',
              value: '04:46 min',
              change: 0.3,
              changeType: 'increase',
            },
          ],
        },
      },
      {
        id: 'gains-losses-1',
        type: 'gainsLosses',
        title: 'Principais Métricas do Site',
        visible: true,
        order: 3,
        data: {
          gainsLosses: [
            {
              title: 'Maiores ganhos em palavras-chave',
              items: [
                {
                  keyword: 'gzv solutions',
                  change: '+622% cliques',
                  changeType: 'increase',
                },
                {
                  keyword: 'gzv',
                  change: '+33,3% cliques',
                  changeType: 'increase',
                },
                {
                  keyword: 'aluguel de celular',
                  change: '+5,07 Impressões',
                  changeType: 'increase',
                },
              ],
            },
            {
              title: 'Maiores perdas em palavras-chave',
              items: [
                {
                  keyword: 'locação de impressora multifuncional',
                  change: '-100% cliques',
                  changeType: 'decrease',
                },
                {
                  keyword: 'locação de multifuncional',
                  change: '-100% cliques',
                  changeType: 'decrease',
                },
                {
                  keyword: 'gzv suprimentos',
                  change: '-100% cliques',
                  changeType: 'decrease',
                },
              ],
            },
          ],
        },
      },
      {
        id: 'analysis-1',
        type: 'analysis',
        visible: true,
        order: 4,
        data: {
          title: 'Análise',
          analysis: 'No último trimestre, observamos um crescimento de 34% nos cliques e uma melhora expressiva no posicionamento médio.',
        },
      },
      {
        id: 'competitor-1',
        type: 'competitorAnalysis',
        title: 'Análise de concorrentes',
        visible: true,
        order: 5,
        data: {
          barGroups: [
            {
              label: 'Tráfego orgânico dos concorrentes',
              competitors: [
                { name: 'GZV', value: '+30,95%', percentage: 100, type: 'positive' },
                { name: 'Selbetti', value: '-26,30%', percentage: 60, type: 'negative' },
                { name: 'Simpress', value: '-12,66%', percentage: 45, type: 'negative' },
                { name: 'Tecnoset', value: '-63,83%', percentage: 90, type: 'negative' },
              ],
              subtitle: 'Comparação de outubro a dezembro de 2025 vs. mesmo período de 2024',
            },
            {
              label: 'Total de palavras-chave no Top 3',
              competitors: [
                { name: 'GZV', value: '15 (+150%)', percentage: 100, type: 'positive' },
                { name: 'Selbetti', value: '346 (+62,44%)', percentage: 70, type: 'positive' },
                { name: 'Simpress', value: '756 (+60,85%)', percentage: 65, type: 'positive' },
                { name: 'Tecnoset', value: '157 (+101,28%)', percentage: 40, type: 'positive' },
              ],
            },
            {
              label: 'Total de palavras-chave no Top 4-10',
              competitors: [
                { name: 'GZV', value: '65 (+165%)', percentage: 100, type: 'positive' },
                { name: 'Selbetti', value: '337 (-36,42%)', percentage: 25, type: 'negative' },
                { name: 'Simpress', value: '3310 (+41,57%)', percentage: 100, type: 'positive' },
                { name: 'Tecnoset', value: '365 (+26,30%)', percentage: 40, type: 'positive' },
              ],
            },
            {
              label: 'Autoridade de domínio (DR)',
              competitors: [
                { name: 'GZV', value: '0,5', percentage: 5, type: 'neutral' },
                { name: 'Tecnoset', value: '28', percentage: 28, type: 'neutral' },
                { name: 'Selbetti', value: '41', percentage: 41, type: 'neutral' },
                { name: 'Simpress', value: '35', percentage: 35, type: 'neutral' },
              ],
            },
          ],
        },
      },
      {
        id: 'status-cards-1',
        type: 'statusCards',
        title: 'Ações finalizadas de destaque',
        visible: true,
        order: 6,
        data: {
          cards: [
            {
              title: 'Implementação de Dados Estruturados e FAQ',
              description: 'Finalizamos a inserção de dados estruturados de Organization e a implementação de FAQs na home.',
              status: 'medio',
            },
            {
              title: 'Organização e Otimização Técnica do Blog',
              description: 'Realizamos a separação do blog por categorias, facilitando a navegação do usuário.',
              status: 'medio',
            },
          ],
        },
      },
      {
        id: 'actions-1',
        type: 'actions',
        title: 'Ações em andamento',
        visible: true,
        order: 7,
        data: {
          actions: [
            {
              text: 'Disponibilizar anchors de categoria do blog no menu',
              url: 'https://cliente.liveseo.com.br',
              status: 'andamento',
            },
            {
              text: 'Produção de blog posts',
              status: 'andamento',
            },
            {
              text: 'Correção do texto da página',
              status: 'iniciar',
            },
          ],
        },
      },
    ],
    images: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Equipe liveSEO',
    },
  };
};
