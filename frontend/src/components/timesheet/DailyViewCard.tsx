/**
 * Daily View Card Component
 * Shows timesheet entries for a specific day
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Check, Plus } from 'lucide-react';
import { DailyBreakdown, TimeEntry } from '@/types/timesheet';

interface DailyViewCardProps {
  dayData: DailyBreakdown;
  onAddEntry: (date: string) => void;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
}

const statusColors = {
  draft: 'border-l-4 border-l-gray-400 bg-gray-50',
  submitted: 'border-l-4 border-l-blue-400 bg-blue-50',
  approved: 'border-l-4 border-l-green-400 bg-green-50',
  rejected: 'border-l-4 border-l-red-400 bg-red-50',
};

const statusBadges = {
  draft: 'bg-gray-200 text-gray-800',
  submitted: 'bg-blue-200 text-blue-800',
  approved: 'bg-green-200 text-green-800',
  rejected: 'bg-red-200 text-red-800',
};

export function DailyViewCard({
  dayData,
  onAddEntry,
  onEdit,
  onDelete,
  onApprove,
}: DailyViewCardProps) {
  const isComplete = dayData.status === 'approved';
  const dayDate = new Date(dayData.date);
  const isToday =
    dayDate.toDateString() === new Date().toDateString();

  return (
    <Card className={`overflow-hidden transition ${isComplete ? 'border-green-200' : ''}`}>
      <CardHeader className={`pb-3 ${isToday ? 'bg-blue-50 border-b-2 border-blue-200' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {dayData.dayOfWeek} - {dayData.date}
              {isToday && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Today</span>}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {dayData.entries.length} {dayData.entries.length === 1 ? 'entry' : 'entries'} • {dayData.totalHours}h total
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadges[dayData.status]}`}
            >
              {dayData.status}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {dayData.entries.length > 0 ? (
          <div className="space-y-3">
            {dayData.entries.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg ${statusColors[entry.status as keyof typeof statusColors]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {entry.projectName || 'Unknown Project'}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${statusBadges[entry.status]}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.taskName || 'No task'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>⏰ {entry.startTime} - {entry.endTime}</span>
                      <span className="font-semibold text-blue-600">
                        {entry.hours.toFixed(2)}h
                      </span>
                      {entry.type !== 'regular' && (
                        <span className="text-orange-600 font-medium">
                          ({entry.type})
                        </span>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-xs text-gray-600 mt-2">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {entry.status === 'submitted' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onApprove(entry.id)}
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {entry.status === 'draft' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(entry)}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(entry.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-3">No entries for this day</p>
            <Button
              size="sm"
              onClick={() => onAddEntry(dayData.date)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
