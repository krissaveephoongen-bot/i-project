import React, { useState } from 'react';
import { Download, FileText, Table2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { exportToCSV, exportToJSON, exportToPrint } from '@/lib/export';

export interface ExportableItem {
  id: number;
  [key: string]: any;
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportableItem[];
  filename: string;
  title?: string;
}

export function ExportDialog({
  isOpen,
  onClose,
  data,
  filename,
  title = 'Export Data',
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      exportToCSV(data, filename);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      exportToJSON(data, filename);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleExportPrint = async () => {
    setIsExporting(true);
    try {
      exportToPrint(data, title);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export {data.length} item{data.length !== 1 ? 's' : ''} in your preferred format
          </p>

          <div className="space-y-2">
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="w-full justify-start"
              variant="outline"
            >
              <Table2 className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
              Open in Excel, Google Sheets, or any spreadsheet app
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
              Perfect for integration with other tools
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleExportPrint}
              disabled={isExporting}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Print / Save as PDF
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
              Use your browser's print to PDF feature
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
