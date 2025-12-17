import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import {
  Trash2,
  Download,
  Archive,
  Copy,
  Mail,
  MoreVertical,
  Check,
  FileJson,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface BulkOperationsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  onEmail?: () => void;
  onDuplicate?: () => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onDelete,
  onArchive,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  onExportJSON,
  onEmail,
  onDuplicate,
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className={`flex items-center justify-between gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-all ${
      hasSelection ? 'opacity-100' : 'opacity-0 pointer-events-none h-0'
    }`}>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">
          {selectedCount} of {totalCount} selected
        </Badge>

        <div className="flex gap-2">
          {selectedCount < totalCount ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="text-sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Select All
            </Button>
          ) : null}

          {selectedCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-sm"
            >
              Clear Selection
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2">
        {/* Export Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportCSV}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportJSON}>
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <MoreVertical className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Selected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Email Selected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive Selected
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default BulkOperations;
