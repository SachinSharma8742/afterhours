/**
 * Exports an array of objects as a downloadable CSV file
 * @param {Array<Object>} data 
 * @param {string} filename 
 */
export function exportToCSV(data, filename = "afterhours_export.csv") {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(","));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? "" : row[header];
      const escaped = ("" + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
