import React from 'react';
import { ReportConfig } from '../types/report';
import { HeaderSection } from './ReportSection/HeaderSection';
import { SummarySection } from './ReportSection/SummarySection';
import { MetricsSection } from './ReportSection/MetricsSection';
import { ChartSection } from './ReportSection/ChartSection';
import { TableSection } from './ReportSection/TableSection';
import { ImageSection } from './ReportSection/ImageSection';
import { TextSection } from './ReportSection/TextSection';
import { ComparisonSection } from './ReportSection/ComparisonSection';
import { FooterSection } from './ReportSection/FooterSection';
import { MetaSEOSection } from './ReportSection/MetaSEOSection';
import { KPIGridSection } from './ReportSection/KPIGridSection';
import { GainsLossesSection } from './ReportSection/GainsLossesSection';
import { AnalysisSection } from './ReportSection/AnalysisSection';
import { CompetitorAnalysisSection } from './ReportSection/CompetitorAnalysisSection';
import { StatusCardsSection } from './ReportSection/StatusCardsSection';
import { ActionsSection } from './ReportSection/ActionsSection';
import './ReportRenderer.css';

interface ReportRendererProps {
  config: ReportConfig;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ config }) => {
  // Ordena as seções visíveis por ordem
  const visibleSections = [...config.sections]
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: typeof visibleSections[0]) => {
    const commonProps = { section, colors: config.colors };

    switch (section.type) {
      case 'header':
        return (
          <HeaderSection
            key={section.id}
            section={section}
            config={{
              clientName: config.clientName,
              period: config.period,
              logo: config.logo,
              colors: config.colors,
            }}
          />
        );

      case 'summary':
        return <SummarySection key={section.id} section={section} />;

      case 'metrics':
        return <MetricsSection key={section.id} {...commonProps} />;

      case 'chart':
        return <ChartSection key={section.id} {...commonProps} />;

      case 'table':
        return <TableSection key={section.id} {...commonProps} />;

      case 'image':
        return <ImageSection key={section.id} section={section} />;

      case 'text':
        return <TextSection key={section.id} section={section} />;

      case 'comparison':
        return <ComparisonSection key={section.id} {...commonProps} />;

      case 'footer':
        return (
          <FooterSection
            key={section.id}
            section={section}
            config={{
              colors: config.colors,
              metadata: config.metadata,
            }}
          />
        );

      case 'metaSEO':
        return <MetaSEOSection key={section.id} section={section} />;

      case 'kpiGrid':
        return <KPIGridSection key={section.id} section={section} />;

      case 'gainsLosses':
        return <GainsLossesSection key={section.id} section={section} />;

      case 'analysis':
        return <AnalysisSection key={section.id} section={section} />;

      case 'competitorAnalysis':
        return <CompetitorAnalysisSection key={section.id} section={section} />;

      case 'statusCards':
        return <StatusCardsSection key={section.id} section={section} />;

      case 'actions':
        return <ActionsSection key={section.id} section={section} />;

      default:
        return null;
    }
  };

  if (visibleSections.length === 0) {
    return (
      <div className="report-container">
        <div className="report-content">
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            color: '#666' 
          }}>
            <h2>Nenhuma seção visível</h2>
            <p>Adicione seções ao relatório ou torne algumas seções visíveis para visualizar o conteúdo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="report-container"
      id="report-export"
    >
      <div className="report-content">
        {visibleSections.map(renderSection)}
      </div>
    </div>
  );
};
