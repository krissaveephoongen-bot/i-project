import { useState, useCallback, useEffect } from 'react';

export interface ProjectIssue {
  id: string;
  project_id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  reported_by: string;
  reported_date: string;
  resolved_date?: string;
  due_date?: string;
  impact_on_schedule: boolean;
  impact_on_budget: boolean;
  estimated_cost: number;
  root_cause: string;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
}

export interface IssueSummary {
  total_issues: number;
  open_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  closed_issues: number;
  critical_issues: number;
  high_priority_issues: number;
  schedule_impact_count: number;
  budget_impact_count: number;
  total_issue_cost: number;
}

interface UseProjectIssuesReturn {
  issues: ProjectIssue[];
  summary: IssueSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchIssues: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  createIssue: (data: Partial<ProjectIssue>) => Promise<ProjectIssue>;
  updateIssue: (issueId: string, data: Partial<ProjectIssue>) => Promise<ProjectIssue>;
  updateIssueStatus: (issueId: string, status: string) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
}

export function useProjectIssues(projectId: string): UseProjectIssuesReturn {
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [summary, setSummary] = useState<IssueSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/projects/${projectId}/issues`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch issues');

      const data = await response.json();
      setIssues(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error fetching issues:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, apiUrl]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiUrl}/projects/${projectId}/issues/summary`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch summary');

      const data = await response.json();
      setSummary(data.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, [projectId, apiUrl]);

  const createIssue = useCallback(
    async (data: Partial<ProjectIssue>): Promise<ProjectIssue> => {
      const response = await fetch(`${apiUrl}/projects/${projectId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create issue');

      const result = await response.json();
      return result.data;
    },
    [projectId, apiUrl]
  );

  const updateIssue = useCallback(
    async (issueId: string, data: Partial<ProjectIssue>): Promise<ProjectIssue> => {
      const response = await fetch(`${apiUrl}/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update issue');

      const result = await response.json();
      return result.data;
    },
    [apiUrl]
  );

  const updateIssueStatus = useCallback(
    async (issueId: string, status: string): Promise<void> => {
      const response = await fetch(`${apiUrl}/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');
    },
    [apiUrl]
  );

  const deleteIssue = useCallback(
    async (issueId: string): Promise<void> => {
      const response = await fetch(`${apiUrl}/issues/${issueId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete issue');
    },
    [apiUrl]
  );

  // Fetch data on mount
  useEffect(() => {
    if (projectId) {
      fetchIssues();
      fetchSummary();
    }
  }, [projectId, fetchIssues, fetchSummary]);

  return {
    issues,
    summary,
    isLoading,
    error,
    fetchIssues,
    fetchSummary,
    createIssue,
    updateIssue,
    updateIssueStatus,
    deleteIssue,
  };
}
