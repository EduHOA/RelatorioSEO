import React from 'react';
import { ReportSection } from '../../types/report';
import './SectionStyles.css';

interface HeaderSectionProps {
  section: ReportSection;
  config: {
    clientName: string;
    period: string;
    logo?: string;
    colors: {
      primary: string;
      text: string;
    };
  };
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ section, config }) => {
  const domain = section.data.domain || '';
  const periodInfo = section.data.periodInfo || config.period;
  const comparisonPeriod = section.data.comparisonPeriod || '';

  return (
    <header className="report-header">
      <div className="header-info">
        <h1>{config.clientName}</h1>
        <p>Relatório de desempenho do domínio {domain && <span>{domain}</span>}</p>
        <p>
          <b>Período de análise:</b> {periodInfo}
          {comparisonPeriod && <> | <b>Período de comparação:</b> {comparisonPeriod}</>}
        </p>
      </div>
      {config.logo && (
        <img src={config.logo} alt="liveSEO" className="header-logo" />
      )}
    </header>
  );
};
