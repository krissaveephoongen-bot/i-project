/**
 * Export utilities for CSV and PDF generation
 */

export interface ExportableItem {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: ExportableItem[],
  filename: string,
  columns?: (keyof ExportableItem)[]
) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Determine columns to export
  const exportColumns = columns || Object.keys(data[0]) as (keyof ExportableItem)[];

  // Create CSV header
  const header = exportColumns.join(',');

  // Create CSV rows
  const rows = data.map((item) =>
    exportColumns
      .map((col) => {
        const value = item[col];
        // Escape quotes and wrap in quotes if contains comma
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      })
      .join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: ExportableItem[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a simple HTML table and print it
 */
export function exportToPrint(data: ExportableItem[], title: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const columns = Object.keys(data[0]) as (keyof ExportableItem)[];

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th { background-color: #f0f0f0; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; }
        td { border: 1px solid #ddd; padding: 12px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .meta { color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${String(col)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (item) => `
            <tr>
              ${columns.map((col) => `<td>${item[col] || ''}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div class="meta">
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=900,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
