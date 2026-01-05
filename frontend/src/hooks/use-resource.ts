import { useState } from 'react';
import { resourceService } from '../services/resourceService';
import { Task, Project, User } from '../services/dataService';

export function useResource() {
  const [isLoading, setIsLoading] = useState(false);
  const [resourceData, setResourceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeResourceAllocation = async (projects: Project[], tasks: Task[], users: User[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const analysis = await resourceService.analyzeResourceAllocation(projects, tasks, users);
      setResourceData(analysis);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resource allocation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeResourceAllocation = async (projects: Project[], tasks: Task[], users: User[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const optimization = await resourceService.optimizeResourceAllocation(projects, tasks, users);
      setResourceData(optimization);
      return optimization;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resource allocation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const allocateBySkills = async (tasks: Task[], users: User[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const skillAllocation = await resourceService.allocateBySkills(tasks, users);
      setResourceData(skillAllocation);
      return skillAllocation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform skill-based allocation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const balanceWorkload = async (tasks: Task[], users: User[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const workloadBalance = await resourceService.balanceWorkload(tasks, users);
      setResourceData(workloadBalance);
      return workloadBalance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze workload balance');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const forecastResourceNeeds = async (projects: Project[], tasks: Task[], users: User[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const forecast = await resourceService.forecastResourceNeeds(projects, tasks, users);
      setResourceData(forecast);
      return forecast;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to forecast resource needs');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const planTeamCapacity = async (projects: Project[], users: User[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const capacityPlan = await resourceService.planTeamCapacity(projects, users);
      setResourceData(capacityPlan);
      return capacityPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to plan team capacity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    resourceData,
    error,
    analyzeResourceAllocation,
    optimizeResourceAllocation,
    allocateBySkills,
    balanceWorkload,
    forecastResourceNeeds,
    planTeamCapacity,
  };
}