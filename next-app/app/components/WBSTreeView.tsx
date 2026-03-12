"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types";

export interface TreeNode extends Task {
  children?: TreeNode[];
}

interface WBSTreeViewProps {
  tasks: TreeNode[];
  onTaskSelect?: (task: Task) => void;
  onTaskCreate?: (parentId?: string, level?: number) => void;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "in_progress":
      return <Clock className="w-4 h-4 text-blue-600" />;
    case "in_review":
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "done":
      return "text-green-600 bg-green-50";
    case "in_progress":
      return "text-blue-600 bg-blue-50";
    case "in_review":
      return "text-yellow-600 bg-yellow-50";
    case "cancelled":
      return "text-red-600 bg-red-50 line-through";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function TreeNode({ node, level = 0, onTaskSelect, onTaskCreate }: {
  node: TreeNode;
  level?: number;
  onTaskSelect?: (task: Task) => void;
  onTaskCreate?: (parentId?: string, level?: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors",
          "border-l-2 border-transparent hover:border-blue-400"
        )}
        style={{ paddingLeft: `${12 + level * 20}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div onClick={() => onTaskSelect?.(node)} className="flex-1 flex items-center gap-3">
          {getStatusIcon(node.status)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {node.wbsCode && (
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {node.wbsCode}
                </span>
              )}
              <span className={cn("font-medium text-sm truncate", getStatusColor(node.status))}>
                {node.title}
              </span>
            </div>
            {node.description && (
              <p className="text-xs text-gray-500 truncate">{node.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {node.estimatedHours && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {node.estimatedHours}h
            </span>
          )}
          {node.progressActual !== undefined && (
            <div className="flex items-center gap-1">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${node.progressActual}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">{node.progressActual}%</span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onTaskSelect={onTaskSelect}
              onTaskCreate={onTaskCreate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WBSTreeView({ tasks, onTaskSelect, onTaskCreate }: WBSTreeViewProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <div className="text-center">
          <p className="font-medium mb-2">No tasks found</p>
          <p className="text-sm">Create the first task to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-4 bg-white rounded-lg border border-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Work Breakdown Structure</h3>
        <button
          onClick={() => onTaskCreate?.()}
          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          + Add Task
        </button>
      </div>
      <div className="space-y-0">
        {tasks.map((task) => (
          <TreeNode
            key={task.id}
            node={task}
            onTaskSelect={onTaskSelect}
            onTaskCreate={onTaskCreate}
          />
        ))}
      </div>
    </div>
  );
}
