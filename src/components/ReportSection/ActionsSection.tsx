import React from 'react';
import { ReportSection, ActionItem } from '../../types/report';
import './SectionStyles.css';

interface ActionsSectionProps {
  section: ReportSection;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({ section }) => {
  const actions: ActionItem[] = section.data.actions || [];

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="data-card">
        <ul className="item-list-acao">
          {actions.map((action, index) => (
            <li key={index}>
              <span>
                {action.url ? (
                  <a href={action.url} target="_blank" rel="noopener noreferrer">
                    {action.text}
                  </a>
                ) : (
                  action.text
                )}
              </span>
              <span className={`status-tag ${action.status}`}>
                {action.status === 'andamento' ? 'Em andamento' :
                 action.status === 'iniciar' ? 'A iniciar' :
                 action.status === 'docs' ? 'Em documentação' :
                 action.status === 'finalizadas' ? 'Finalizadas' :
                 action.status === 'backlog_priorizado' ? 'Backlog priorizado' :
                 action.status || '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
