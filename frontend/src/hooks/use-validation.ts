import { useState } from 'react';
import { validationService } from '../services/validationService';
import { Task, Project, User } from '../services/dataService';

export function useValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const validateProjectData = async (project: Project) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateProjectData(project);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate project data');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validateTaskData = async (task: Task) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateTaskData(task);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate task data');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validateUserData = async (user: User) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateUserData(user);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate user data');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validateProjectConsistency = async (project: Project, tasks: Task[]) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateProjectConsistency(project, tasks);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate project consistency');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validateDataIntegrity = async (data: any, schema: any) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateDataIntegrity(data, schema);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate data integrity');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const runSystemValidation = async () => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.runSystemValidation();
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run system validation');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validateWorkflowConsistency = async (projects: Project[], tasks: Task[]) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateWorkflowConsistency(projects, tasks);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate workflow consistency');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validateSecurityCompliance = async () => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateSecurityCompliance();
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate security compliance');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validatePerformanceMetrics = async () => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validatePerformanceMetrics();
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate performance metrics');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const validateDataQuality = async (data: any[]) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.validateDataQuality(data);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate data quality');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const runComprehensiveValidation = async (projects: Project[], tasks: Task[], users: User[]) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validationService.runComprehensiveValidation(projects, tasks, users);
      setValidationResults(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run comprehensive validation');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  const generateValidationReport = async (validationResults: any) => {
    try {
      setIsValidating(true);
      setError(null);

      const report = await validationService.generateValidationReport(validationResults);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate validation report');
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    validationResults,
    error,
    validateProjectData,
    validateTaskData,
    validateUserData,
    validateProjectConsistency,
    validateDataIntegrity,
    runSystemValidation,
    validateWorkflowConsistency,
    validateSecurityCompliance,
    validatePerformanceMetrics,
    validateDataQuality,
    runComprehensiveValidation,
    generateValidationReport,
  };
}