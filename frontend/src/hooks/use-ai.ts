import { useState } from 'react';
import { aiService } from '../services/aiService';
import { Task, Project, User } from '../services/dataService';

export function useAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeTaskPriorities = async (tasks: Task[], projects: Project[]) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await aiService.analyzeTaskPriorities(tasks, projects);
      setAiResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze task priorities');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recommendResourceAllocation = async (tasks: Task[], users: User[]) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await aiService.recommendResourceAllocation(tasks, users);
      setAiResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate resource allocation recommendations');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const assessProjectRisks = async (projects: Project[], tasks: Task[]) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await aiService.assessProjectRisks(projects, tasks);
      setAiResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assess project risks');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const estimateTaskDuration = async (taskDescription: string, historicalData?: any[]) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const estimate = await aiService.estimateTaskDuration(taskDescription, historicalData);
      setAiResults({ estimate });
      return estimate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to estimate task duration');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createTaskFromNaturalLanguage = async (input: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const taskData = await aiService.createTaskFromNaturalLanguage(input);
      setAiResults(taskData);
      return taskData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task from natural language');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeProjectHealth = async (project: Project, tasks: Task[]) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await aiService.analyzeProjectHealth(project, tasks);
      setAiResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze project health');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOptimalSchedule = async (tasks: Task[], constraints?: any) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await aiService.generateOptimalSchedule(tasks, constraints);
      setAiResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate optimal schedule');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    aiResults,
    error,
    analyzeTaskPriorities,
    recommendResourceAllocation,
    assessProjectRisks,
    estimateTaskDuration,
    createTaskFromNaturalLanguage,
    analyzeProjectHealth,
    generateOptimalSchedule,
  };
}