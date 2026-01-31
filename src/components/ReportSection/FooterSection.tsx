import React from 'react';
import { ReportSection } from '../../types/report';
import { reportStrings, type ReportLocale } from '../../utils/reportStrings';
import './SectionStyles.css';

const DATE_LOCALE_MAP: Record<ReportLocale, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };

interface FooterSectionProps {
  section: ReportSection;
  config: {
    colors: {
      primary: string;
      text: string;
    };
    metadata: {
      createdAt: string;
      createdBy: string;
    };
  };
  locale?: ReportLocale;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ section, config, locale }) => {
  const s = locale ? reportStrings[locale] : null;
  const defaultFooter = s ? s.footerGeneratedBy : 'Relatório gerado pela liveSEO';
  const createdByLabel = s ? s.footerCreatedBy : 'Criado por';
  const onLabel = s ? s.footerOn : ' em ';
  const dateLocale = locale ? DATE_LOCALE_MAP[locale] : 'pt-BR';
  return (
    <footer 
      className="report-footer"
      style={{ 
        backgroundColor: 'transparent',
        color: config.colors.primary 
      }}
    >
      <div className="footer-content">
        <p className="footer-text">
          {section.data.text || defaultFooter}
        </p>
        <p className="footer-meta">
          {createdByLabel} {config.metadata.createdBy}{onLabel}{new Date(config.metadata.createdAt).toLocaleDateString(dateLocale)}
        </p>
      </div>
    </footer>
  );
};
