import React from 'react';
import { ReportSection, TableData } from '../../types/report';
import './SectionStyles.css';

interface TableSectionProps {
  section: ReportSection;
  colors: {
    primary: string;
  };
}

export const TableSection: React.FC<TableSectionProps> = ({ section, colors }) => {
  const tableData: TableData = section.data.table || {
    headers: [],
    rows: []
  };

  if (tableData.headers.length === 0 && tableData.rows.length === 0) {
    return (
      <section className="report-section table-section">
        {section.title && <h2 className="section-title">{section.title}</h2>}
        <div className="table-container">
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: 'var(--texto-secundario)',
            fontStyle: 'italic'
          }}>
            Sem dados para exibir
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="report-section table-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
          {tableData.footer && (
            <tfoot>
              <tr>
                {tableData.footer.map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};
