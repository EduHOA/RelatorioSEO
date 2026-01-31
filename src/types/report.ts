// Tipos para o sistema de relatórios

export type SectionType = 
  | 'header'
  | 'summary'
  | 'metrics'
  | 'chart'
  | 'table'
  | 'image'
  | 'text'
  | 'footer'
  | 'metaSEO'
  | 'kpiGrid'
  | 'gainsLosses'
  | 'analysis'
  | 'competitorAnalysis'
  | 'actions'
  | 'statusCards';

export interface ReportImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface ReportSection {
  id: string;
  type: SectionType;
  title?: string;
  visible: boolean;
  order: number;
  data: Record<string, any>;
  style?: Record<string, string>;
}

export interface ReportConfig {
  id: string;
  name: string;
  clientName: string;
  period: string;
  logo?: string;
  /** Se true, o relatório inclui o bloco de seções do blog (Grid KPIs, Palavras-chave, Análise). */
  hasBlog?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  sections: ReportSection[];
  images: ReportImage[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  /** Usado quando comparisonPeriod === 'ambos': % vs. ano anterior */
  changeAnoAnterior?: number;
  /** Usado quando comparisonPeriod === 'ambos': tipo vs. ano anterior */
  changeTypeAnoAnterior?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
  footer?: string[];
}

export interface MetaSEOData {
  description?: string;
  metas: {
    label: string;
    target: string;
    growth: string;
    current: string;
    percentage: number;
    color?: string;
  }[];
  analysis?: string;
}

export interface GainsLossesData {
  title: string;
  items: {
    keyword: string;
    change: string;
    changeType: 'increase' | 'decrease';
    url?: string;
  }[];
}

export interface CompetitorBarData {
  label: string;
  competitors: {
    name: string;
    value: string;
    percentage: number;
    type: 'positive' | 'negative' | 'neutral';
    color?: string;
  }[];
  subtitle?: string;
}

export interface StatusCardData {
  title: string;
  description: string;
  status: 'critico' | 'alto' | 'medio' | 'normal';
}

export interface ActionItem {
  text: string;
  url?: string;
  status: 'andamento' | 'iniciar' | 'docs' | 'finalizadas' | 'backlog_priorizado';
}
