function ExportButton({ data, filename, type = 'excel' }) {
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }

    let csv = '';
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        return typeof val === 'string' ? `"${val}"` : val;
      });
      csv += values.join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    alert('กำลังพัฒนาฟีเจอร์ Export PDF');
  };

  return (
    <div className="relative group">
      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
        <div className="icon-download text-lg"></div>
        <span>Export</span>
      </button>
      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
        <button 
          onClick={exportToExcel}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <div className="icon-file-text text-green-600"></div>
          <span>Excel (CSV)</span>
        </button>
        <button 
          onClick={exportToPDF}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <div className="icon-file text-red-600"></div>
          <span>PDF</span>
        </button>
      </div>
    </div>
  );
}