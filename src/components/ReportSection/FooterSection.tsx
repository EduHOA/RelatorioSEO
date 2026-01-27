import React from 'react';
import { ReportSection } from '../../types/report';
import './SectionStyles.css';

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
}

export const FooterSection: React.FC<FooterSectionProps> = ({ section, config }) => {
  return (
    <footer 
      className="report-footer"
      style={{ 
        backgroundColor: config.colors.primary,
        color: config.colors.text 
      }}
    >
      <div className="footer-content">
        <p className="footer-text">
          {section.data.text || 'Relatório gerado pela LiveSEO'}
        </p>
        <p className="footer-meta">
          Criado por {config.metadata.createdBy} em {new Date(config.metadata.createdAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </footer>
  );
};
