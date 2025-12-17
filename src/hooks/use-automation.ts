import { useState } from 'react';
import { automationService } from '../services/automationService';
import { Task, Project, User } from '../services/dataService';

export function useAutomation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [automationResults, setAutomationResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createTasksFromTemplate = async (projectId: string, templateName: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const taskIds = await automationService.createTasksFromTemplate(projectId, templateName);
      setAutomationResults({ taskIds, templateName });
      return taskIds;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tasks from template');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const autoPrioritizeTasks = async (tasks: Task[], projects: Project[]) => {
    try {
      setIsProcessing(true);
      setError(null);

      const prioritizedTasks = await automationService.autoPrioritizeTasks(tasks, projects);
      setAutomationResults({ prioritizedTasks });
      return prioritizedTasks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-prioritize tasks');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const autoAllocateResources = async (tasks: Task[], users: User[]) => {
    try {
      setIsProcessing(true);
      setError(null);

      const allocation = await automationService.autoAllocateResources(tasks, users);
      setAutomationResults({ allocation });
      return allocation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-allocate resources');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const autoUpdateTaskStatuses = async (tasks: Task[]) => {
    try {
      setIsProcessing(true);
      setError(null);

      const updatedTasks = await automationService.autoUpdateTaskStatuses(tasks);
      setAutomationResults({ updatedTasks });
      return updatedTasks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-update task statuses');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const monitorProjectHealth = async (projects: Project[], tasks: Task[]) => {
    try {
      setIsProcessing(true);
      setError(null);

      const healthReports = await automationService.monitorProjectHealth(projects, tasks);
      setAutomationResults({ healthReports });
      return healthReports;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to monitor project health');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const executeWorkflow = async (workflowName: string, params: any = {}) => {
    try {
      setIsProcessing(true);
      setError(null);

      const result = await automationService.executeWorkflow(workflowName, params);
      setAutomationResults({ workflow: workflowName, result });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const setupRecurringWorkflows = () => {
    try {
      setError(null);
      automationService.setupRecurringWorkflows();
      setAutomationResults({ message: 'Recurring workflows scheduled successfully' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup recurring workflows');
      throw err;
    }
  };

  const sendAutomatedNotifications = async (projects: Project[], tasks: Task[], users: User[]) => {
    try {
      setIsProcessing(true);
      setError(null);

      await automationService.sendAutomatedNotifications(projects, tasks, users);
      setAutomationResults({ message: 'Automated notifications sent successfully' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send automated notifications');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    automationResults,
    error,
    createTasksFromTemplate,
    autoPrioritizeTasks,
    autoAllocateResources,
    autoUpdateTaskStatuses,
    monitorProjectHealth,
    executeWorkflow,
    setupRecurringWorkflows,
    sendAutomatedNotifications,
  };
}