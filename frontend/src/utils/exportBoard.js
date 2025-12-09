// Export board as JSON
export const exportAsJSON = (board, lists, cards) => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    board: {
      id: board.id,
      title: board.title,
      background: board.background,
      createdAt: board.created_at
    },
    lists: Object.values(lists).map(list => ({
      id: list.id,
      title: list.title,
      position: list.position,
      cards: (list.cardIds || []).map(cardId => {
        const card = cards[cardId];
        return card ? {
          id: card.id,
          title: card.title,
          description: card.description,
          labels: card.labels,
          dueDate: card.due_date,
          position: card.position
        } : null;
      }).filter(Boolean)
    }))
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(blob, `${board.title.replace(/[^a-z0-9]/gi, '_')}_export.json`);
};

// Export board as PDF (uses browser print)
export const exportAsPDF = (board, lists, cards) => {
  // Create a printable HTML document
  const html = generatePrintableHTML(board, lists, cards);
  
  // Open print preview in new window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  // Trigger print after content loads
  printWindow.onload = () => {
    printWindow.print();
  };
};

// Generate printable HTML
const generatePrintableHTML = (board, lists, cards) => {
  const listHTML = Object.values(lists).map(list => {
    const listCards = (list.cardIds || []).map(cardId => cards[cardId]).filter(Boolean);
    
    const cardsHTML = listCards.map(card => `
      <div style="background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(card.title)}</div>
        ${card.description ? `<div style="font-size: 12px; color: #666;">${escapeHtml(card.description)}</div>` : ''}
        ${card.labels?.length ? `
          <div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
            ${card.labels.map(label => `
              <span style="background: ${label.color || '#dc2626'}; color: white; font-size: 10px; padding: 2px 8px; border-radius: 4px;">
                ${escapeHtml(label.name)}
              </span>
            `).join('')}
          </div>
        ` : ''}
        ${card.due_date ? `
          <div style="margin-top: 8px; font-size: 11px; color: #888;">
            Due: ${new Date(card.due_date).toLocaleDateString()}
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <div style="background: #e5e5e5; border-radius: 12px; padding: 16px; min-width: 280px; max-width: 300px; flex-shrink: 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; display: flex; justify-content: space-between;">
          ${escapeHtml(list.title)}
          <span style="background: #d5d5d5; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${listCards.length}</span>
        </h3>
        ${cardsHTML || '<p style="color: #888; font-size: 12px;">No cards</p>'}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(board.title)} - Flowboard Export</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e5e5;
        }
        .header h1 {
          margin: 0 0 8px 0;
          color: #171717;
        }
        .header .meta {
          color: #888;
          font-size: 12px;
        }
        .lists-container {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: flex-start;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 ${escapeHtml(board.title)}</h1>
        <div class="meta">
          Exported from Flowboard on ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      <div class="lists-container">
        ${listHTML}
      </div>
    </body>
    </html>
  `;
};

// Helper function to escape HTML
const escapeHtml = (text) => {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Helper function to download file
const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import board from JSON
export const importFromJSON = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.board || !data.lists) {
          throw new Error('Invalid export file format');
        }
        resolve(data);
      } catch (err) {
        reject(new Error('Failed to parse import file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

