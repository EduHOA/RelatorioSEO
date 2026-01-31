import React from 'react';
import { ReportSection, ActionItem } from '../../types/report';
import { reportStrings, type ReportLocale } from '../../utils/reportStrings';
import './SectionStyles.css';

interface ActionsSectionProps {
  section: ReportSection;
  locale?: ReportLocale;
}

function getStatusLabel(status: string, locale?: ReportLocale): string {
  const s = locale ? reportStrings[locale] : null;
  if (status === 'andamento') return s ? s.actionInProgress : 'Em andamento';
  if (status === 'iniciar') return s ? s.actionToStart : 'A iniciar';
  if (status === 'docs') return s ? s.actionInDocs : 'Em documentação';
  if (status === 'finalizadas') return s ? s.actionCompleted : 'Finalizadas';
  if (status === 'backlog_priorizado') return s ? s.actionBacklogPrioritized : 'Backlog priorizado';
  return status || '—';
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({ section, locale }) => {
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
                {getStatusLabel(action.status ?? '', locale)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
