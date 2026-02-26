const ExportUtils = {
  // Export to Excel (CSV format)
  exportToExcel: (data, filename) => {
    if (!data || data.length === 0) {
      alert("ไม่มีข้อมูลสำหรับ Export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  },

  // Export to PDF (using browser print)
  exportToPDF: (elementId, filename) => {
    const element = document.getElementById(elementId);
    if (!element) {
      alert("ไม่พบข้อมูลสำหรับ Export");
      return;
    }

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f4f4f4; font-weight: 600; }
                    h1 { color: #0056D2; margin-bottom: 10px; }
                    .header { margin-bottom: 20px; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${filename}</h1>
                    <p>วันที่สร้างรายงาน: ${new Date().toLocaleDateString("th-TH")}</p>
                </div>
                ${element.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 100);
                    }
                </script>
            </body>
            </html>
        `);
    printWindow.document.close();
  },
};
