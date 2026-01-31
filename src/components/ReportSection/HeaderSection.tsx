import React from 'react';
import { ReportSection } from '../../types/report';
import './SectionStyles.css';

const LIVE_LOGO_URL = 'https://www.linx.com.br/app/uploads/2022/07/liveSEO-logo-aplicacao-principal-1-1.png';

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
  const clientName = (section.data.clientName ?? config.clientName) || 'Relatório';
  const domain = section.data.domain ?? '';
  const periodInfo = section.data.periodInfo ?? config.period;
  const comparisonPeriod = section.data.comparisonPeriod ?? '';
  const clientLogoUrl = (section.data.logo && String(section.data.logo).trim()) || config.logo || '';

  return (
    <header className="report-header">
      <div className="header-info">
        <h1>{clientName}</h1>
        <p>Relatório de desempenho do domínio {domain || ''}</p>
        <p>
          <b>Período de análise:</b> {periodInfo || '—'}
          {comparisonPeriod ? <> | <b>Período de comparação:</b> {comparisonPeriod}</> : null}
        </p>
      </div>
      <div className="header-logos">
        <img src={LIVE_LOGO_URL} alt="liveSEO" className="header-logo header-logo-live" />
        {clientLogoUrl ? (
          <img src={clientLogoUrl} alt={clientName} className="header-logo header-logo-client" />
        ) : null}
      </div>
    </header>
  );
};
