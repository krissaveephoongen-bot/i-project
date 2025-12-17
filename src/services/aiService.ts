import { toast } from 'react-hot-toast';
import { Task, Project, User } from './dataService';
import { APP_CONFIG, ERROR_CODES } from '../config/constants';

// AI Service for intelligent project management
class AIService {
  private apiTimeout: number;
  private retryCount: number;
  private confidenceThreshold: number;

  constructor() {
    // Initialize from configuration
    this.apiTimeout = APP_CONFIG.AI_SERVICE.TIMEOUT;
    this.retryCount = APP_CONFIG.AI_SERVICE.RETRY_COUNT;
    this.confidenceThreshold = APP_CONFIG.AI_SERVICE.CONFIDENCE_THRESHOLD;
  }

  // Enhanced AI API with error handling and retries
  private async callAIApi(prompt: string, data?: any, retryAttempt = 0): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error('AI API timeout:', prompt);
        reject(new Error(ERROR_CODES.NETWORK_ERROR));
      }, this.apiTimeout);

      try {
        // Simulate AI API call with potential failures
        setTimeout(() => {
          clearTimeout(timeoutId);

          // Simulate occasional failures for testing
          if (Math.random() < 0.05 && retryAttempt < this.retryCount) {
            console.warn(`AI API attempt ${retryAttempt + 1} failed, retrying...`);
            this.callAIApi(prompt, data, retryAttempt + 1)
              .then(resolve)
              .catch(reject);
            return;
          }

          console.log('AI Processing:', prompt);
          resolve(this.generateAIResponse(prompt, data));
        }, APP_CONFIG.ANIMATION_DURATIONS.NORMAL);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('AI API error:', error);
        reject(error instanceof Error ? error : new Error(ERROR_CODES.SERVER_ERROR));
      }
    });
  }

  private generateAIResponse(prompt: string, data?: any): any {
    // Mock AI responses based on prompt type
    if (prompt.includes('priority')) {
      return {
        recommendations: [
          { taskId: 'task-1', newPriority: 'high', reason: 'Critical path analysis shows this task is blocking 3 other tasks' },
          { taskId: 'task-2', newPriority: 'medium', reason: 'Task has flexible timeline and lower impact' }
        ],
        confidence: 0.92
      };
    }

    if (prompt.includes('resource allocation')) {
      return {
        recommendations: [
          { userId: 'user-1', taskId: 'task-1', reason: 'Best skill match and current workload allows' },
          { userId: 'user-2', taskId: 'task-2', reason: 'Specialist in required technology stack' }
        ],
        efficiencyScore: 0.88
      };
    }

    if (prompt.includes('risk assessment')) {
      return {
        risks: [
          { taskId: 'task-1', riskLevel: 'high', riskType: 'schedule', description: 'Task is 3 days behind schedule' },
          { taskId: 'task-2', riskLevel: 'medium', riskType: 'resource', description: 'Assigned resource is overloaded' }
        ],
        mitigationStrategies: [
          'Reallocate resources from lower priority tasks',
          'Extend timeline for non-critical path tasks'
        ]
      };
    }

    if (prompt.includes('time estimate')) {
      return {
        estimate: 18.5,
        confidenceInterval: { min: 16, max: 22 },
        factorsConsidered: ['task complexity', 'team experience', 'similar historical tasks']
      };
    }

    return { response: 'AI analysis completed', data: data || {} };
  }

  // AI-Powered Task Prioritization with enhanced error handling
  async analyzeTaskPriorities(tasks: Task[], projects: Project[]): Promise<any> {
    try {
      // Validate input
      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks provided for priority analysis');
      }

      if (!projects || projects.length === 0) {
        throw new Error('No projects provided for priority analysis');
      }

      const prompt = `Analyze and prioritize tasks based on project timelines, dependencies, and business impact. Tasks: ${JSON.stringify(tasks)}, Projects: ${JSON.stringify(projects)}`;
      const result = await this.callAIApi(prompt, { tasks, projects });

      // Validate AI response
      if (!result || !result.recommendations) {
        throw new Error('Invalid AI response format');
      }

      // Filter recommendations by confidence threshold
      const filteredRecommendations = result.recommendations.filter(
        (rec: any) => rec.confidence >= this.confidenceThreshold
      );

      toast.success('AI task prioritization analysis completed!');
      return {
        ...result,
        recommendations: filteredRecommendations,
        confidenceThreshold: this.confidenceThreshold
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to analyze task priorities';

      toast.error(errorMessage);
      console.error('AI Priority Analysis Error:', error);

      // Return fallback data for graceful degradation
      return {
        error: errorMessage,
        recommendations: [],
        confidence: 0,
        fallback: true
      };
    }
  }

  // Intelligent Resource Allocation
  async recommendResourceAllocation(tasks: Task[], users: User[]): Promise<any> {
    try {
      const prompt = `Recommend optimal resource allocation for tasks based on skills, workload, and project requirements. Tasks: ${JSON.stringify(tasks)}, Users: ${JSON.stringify(users)}`;
      const result = await this.callAIApi(prompt, { tasks, users });

      toast.success('AI resource allocation recommendations generated!');
      return result;
    } catch (error) {
      toast.error('Failed to generate resource allocation recommendations');
      console.error('AI Resource Allocation Error:', error);
      return { error: 'Failed to generate recommendations' };
    }
  }

  // Project Risk Assessment
  async assessProjectRisks(projects: Project[], tasks: Task[]): Promise<any> {
    try {
      const prompt = `Assess risks for projects and tasks including schedule, budget, and resource risks. Projects: ${JSON.stringify(projects)}, Tasks: ${JSON.stringify(tasks)}`;
      const result = await this.callAIApi(prompt, { projects, tasks });

      toast.success('Project risk assessment completed!');
      return result;
    } catch (error) {
      toast.error('Failed to assess project risks');
      console.error('AI Risk Assessment Error:', error);
      return { error: 'Failed to assess risks' };
    }
  }

  // Intelligent Time Estimation
  async estimateTaskDuration(taskDescription: string, historicalData?: any[]): Promise<number> {
    try {
      const prompt = `Estimate task duration in hours based on description and historical data. Task: "${taskDescription}", Historical: ${JSON.stringify(historicalData || [])}`;
      const result = await this.callAIApi(prompt, { taskDescription, historicalData });

      return result.estimate || 8; // Default 8 hours if no estimate
    } catch (error) {
      console.error('AI Time Estimation Error:', error);
      return 8; // Fallback default
    }
  }

  // Natural Language Task Creation
  async createTaskFromNaturalLanguage(input: string): Promise<Partial<Task>> {
    try {
      const prompt = `Parse natural language input and extract task details: "${input}"`;
      const result = await this.callAIApi(prompt, { input });

      // Mock parsing result
      const parsedTask: Partial<Task> = {
        title: result.title || 'New Task',
        description: result.description || input,
        estimatedHours: result.estimatedHours || 4,
        priority: result.priority || 'medium',
        tags: result.tags || []
      };

      return parsedTask;
    } catch (error) {
      console.error('Natural Language Processing Error:', error);
      return {
        title: 'New Task',
        description: input,
        estimatedHours: 4,
        priority: 'medium'
      };
    }
  }

  // Project Health Analysis
  async analyzeProjectHealth(project: Project, tasks: Task[]): Promise<any> {
    try {
      const prompt = `Analyze project health including schedule, budget, and quality metrics. Project: ${JSON.stringify(project)}, Tasks: ${JSON.stringify(tasks)}`;
      const result = await this.callAIApi(prompt, { project, tasks });

      toast.success('Project health analysis completed!');
      return result;
    } catch (error) {
      toast.error('Failed to analyze project health');
      console.error('AI Health Analysis Error:', error);
      return { error: 'Failed to analyze project health' };
    }
  }

  // Automated Task Scheduling
  async generateOptimalSchedule(tasks: Task[], constraints?: any): Promise<any> {
    try {
      const prompt = `Generate optimal task schedule considering dependencies, resources, and constraints. Tasks: ${JSON.stringify(tasks)}, Constraints: ${JSON.stringify(constraints || {})}`;
      const result = await this.callAIApi(prompt, { tasks, constraints });

      toast.success('Optimal task schedule generated!');
      return result;
    } catch (error) {
      toast.error('Failed to generate optimal schedule');
      console.error('AI Scheduling Error:', error);
      return { error: 'Failed to generate schedule' };
    }
  }
}

export const aiService = new AIService();