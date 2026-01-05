import { Task, Project, User } from './dataService';

// Comprehensive Testing and Validation Service
class ValidationService {
  // Validate project data
  async validateProjectData(project: Project): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Basic validation
      if (!project.name || project.name.trim().length === 0) {
        errors.push('Project name is required');
      }

      if (!project.description || project.description.trim().length === 0) {
        errors.push('Project description is required');
      }

      // Date validation
      if (!project.startDate || isNaN(new Date(project.startDate).getTime())) {
        errors.push('Invalid start date');
      }

      if (!project.endDate || isNaN(new Date(project.endDate).getTime())) {
        errors.push('Invalid end date');
      } else if (new Date(project.endDate) < new Date(project.startDate)) {
        errors.push('End date cannot be before start date');
      }

      // Budget validation
      if (project.budget !== undefined && (isNaN(project.budget) || project.budget < 0)) {
        errors.push('Budget must be a positive number');
      }

      // Progress validation
      if (project.progress !== undefined && (isNaN(project.progress) || project.progress < 0 || project.progress > 100)) {
        errors.push('Progress must be between 0 and 100');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Project Validation Error:', error);
      return {
        valid: false,
        errors: ['Failed to validate project data']
      };
    }
  }

  // Validate task data
  async validateTaskData(task: Task): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Basic validation
      if (!task.title || task.title.trim().length === 0) {
        errors.push('Task title is required');
      }

      if (!task.projectId || task.projectId.trim().length === 0) {
        errors.push('Project ID is required');
      }

      // Date validation
      if (!task.startDate || isNaN(new Date(task.startDate).getTime())) {
        errors.push('Invalid start date');
      }

      if (!task.dueDate || isNaN(new Date(task.dueDate).getTime())) {
        errors.push('Invalid due date');
      } else if (new Date(task.dueDate) < new Date(task.startDate)) {
        errors.push('Due date cannot be before start date');
      }

      // Priority validation
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(task.priority)) {
        errors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
      }

      // Status validation
      const validStatuses = ['todo', 'in-progress', 'review', 'completed'];
      if (!validStatuses.includes(task.status)) {
        errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Estimated hours validation
      if (task.estimatedHours !== undefined && (isNaN(task.estimatedHours) || task.estimatedHours <= 0)) {
        errors.push('Estimated hours must be a positive number');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Task Validation Error:', error);
      return {
        valid: false,
        errors: ['Failed to validate task data']
      };
    }
  }

  // Validate user data
  async validateUserData(user: User): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Basic validation
      if (!user.name || user.name.trim().length === 0) {
        errors.push('User name is required');
      }

      if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push('Valid email is required');
      }

      // Role validation
      const validRoles = ['admin', 'manager', 'developer', 'designer'];
      if (!validRoles.includes(user.role)) {
        errors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      // Workload validation
      if (user.workload !== undefined && (isNaN(user.workload) || user.workload < 0 || user.workload > 100)) {
        errors.push('Workload must be between 0 and 100');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('User Validation Error:', error);
      return {
        valid: false,
        errors: ['Failed to validate user data']
      };
    }
  }

  // Validate project consistency
  async validateProjectConsistency(project: Project, tasks: Task[]): Promise<{ valid: boolean; warnings: string[]; errors: string[] }> {
    try {
      const warnings: string[] = [];
      const errors: string[] = [];

      // Check task consistency
      const projectTasks = tasks.filter(t => t.projectId === project.id);

      // Check for tasks with invalid status for project status
      if (project.status === 'completed') {
        const incompleteTasks = projectTasks.filter(t => t.status !== 'completed');
        if (incompleteTasks.length > 0) {
          warnings.push(`Project marked as completed but has ${incompleteTasks.length} incomplete tasks`);
        }
      }

      // Check for overdue tasks
      const overdueTasks = projectTasks.filter(t =>
        t.status !== 'completed' && new Date(t.dueDate) < new Date()
      );
      if (overdueTasks.length > 0) {
        warnings.push(`Project has ${overdueTasks.length} overdue tasks`);
      }

      // Check progress consistency
      if (project.progress === 100 && project.status !== 'completed') {
        warnings.push('Project shows 100% progress but is not marked as completed');
      }

      // Check timeline consistency
      const now = new Date();
      if (new Date(project.endDate) < now && project.status !== 'completed') {
        warnings.push('Project end date has passed but project is not completed');
      }

      return {
        valid: errors.length === 0,
        warnings,
        errors
      };
    } catch (error) {
      console.error('Project Consistency Validation Error:', error);
      return {
        valid: false,
        warnings: [],
        errors: ['Failed to validate project consistency']
      };
    }
  }

  // Validate data integrity
  async validateDataIntegrity(data: any, schema: any): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Simple schema validation
      for (const [field, rules] of Object.entries(schema)) {
        const typedRules = rules as {
          required?: boolean;
          type?: string;
          min?: number;
          max?: number;
          pattern?: string;
          enum?: string[];
        };

        if (typedRules.required && (data[field] === undefined || data[field] === null || data[field] === '')) {
          errors.push(`${field} is required`);
          continue;
        }

        if (data[field] !== undefined) {
          if (typedRules.type && typeof data[field] !== typedRules.type) {
            errors.push(`${field} must be of type ${typedRules.type}`);
          }

          if (typedRules.min !== undefined && data[field] < typedRules.min) {
            errors.push(`${field} must be at least ${typedRules.min}`);
          }

          if (typedRules.max !== undefined && data[field] > typedRules.max) {
            errors.push(`${field} must be at most ${typedRules.max}`);
          }

          if (typedRules.pattern && !new RegExp(typedRules.pattern).test(String(data[field]))) {
            errors.push(`${field} does not match required pattern`);
          }

          if (typedRules.enum && !typedRules.enum.includes(data[field])) {
            errors.push(`${field} must be one of: ${typedRules.enum.join(', ')}`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Data Integrity Validation Error:', error);
      return {
        valid: false,
        errors: ['Failed to validate data integrity']
      };
    }
  }

  // Run comprehensive system validation
  async runSystemValidation(): Promise<{ valid: boolean; issues: any[]; recommendations: string[] }> {
    try {
      const issues: any[] = [];
      const recommendations: string[] = [];

      // Mock system validation checks
      const validationChecks = [
        {
          name: 'Database Connectivity',
          status: 'pass',
          details: 'Database connection successful'
        },
        {
          name: 'API Endpoints',
          status: 'pass',
          details: 'All API endpoints responding'
        },
        {
          name: 'Authentication System',
          status: 'pass',
          details: 'Authentication working correctly'
        },
        {
          name: 'Data Consistency',
          status: 'warning',
          details: 'Minor data consistency issues detected'
        },
        {
          name: 'Performance Metrics',
          status: 'pass',
          details: 'Performance within acceptable ranges'
        }
      ];

      // Check for failed validations
      const failedChecks = validationChecks.filter(check => check.status === 'fail');
      if (failedChecks.length > 0) {
        issues.push(...failedChecks.map(check => ({
          type: 'critical',
          message: `System validation failed: ${check.name}`,
          details: check.details
        })));
      }

      // Check for warnings
      const warningChecks = validationChecks.filter(check => check.status === 'warning');
      if (warningChecks.length > 0) {
        issues.push(...warningChecks.map(check => ({
          type: 'warning',
          message: `System validation warning: ${check.name}`,
          details: check.details
        })));
      }

      // Generate recommendations
      if (failedChecks.length > 0) {
        recommendations.push(
          'Address critical system validation failures immediately',
          'Review system logs for detailed error information',
          'Consider system restart if issues persist'
        );
      } else if (warningChecks.length > 0) {
        recommendations.push(
          'Review system validation warnings',
          'Monitor affected systems for potential issues',
          'Schedule maintenance if warnings persist'
        );
      } else {
        recommendations.push(
          'System validation passed successfully',
          'Continue regular monitoring',
          'Schedule periodic validation checks'
        );
      }

      return {
        valid: failedChecks.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('System Validation Error:', error);
      return {
        valid: false,
        issues: [{ type: 'error', message: 'System validation failed', details: error instanceof Error ? error.message : 'Unknown error' }],
        recommendations: ['Investigate system validation failure', 'Check system logs', 'Contact support if needed']
      };
    }
  }

  // Validate workflow consistency
  async validateWorkflowConsistency(projects: Project[], tasks: Task[]): Promise<{ valid: boolean; issues: any[] }> {
    try {
      const issues: any[] = [];

      // Check for tasks without projects
      const orphanedTasks = tasks.filter(task => !projects.some(p => p.id === task.projectId));
      if (orphanedTasks.length > 0) {
        issues.push({
          type: 'error',
          message: `${orphanedTasks.length} tasks are not associated with any project`,
          affectedTasks: orphanedTasks.map(t => t.id)
        });
      }

      // Check for projects with no tasks
      const emptyProjects = projects.filter(project => !tasks.some(t => t.projectId === project.id));
      if (emptyProjects.length > 0) {
        issues.push({
          type: 'warning',
          message: `${emptyProjects.length} projects have no associated tasks`,
          affectedProjects: emptyProjects.map(p => p.id)
        });
      }

      // Check for inconsistent task statuses
      projects.forEach(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const completedTasks = projectTasks.filter(t => t.status === 'completed');

        if (project.status === 'completed' && completedTasks.length !== projectTasks.length) {
          issues.push({
            type: 'warning',
            message: `Project ${project.name} marked as completed but has incomplete tasks`,
            projectId: project.id,
            incompleteTasks: projectTasks.length - completedTasks.length
          });
        }
      });

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Workflow Consistency Validation Error:', error);
      return {
        valid: false,
        issues: [{ type: 'error', message: 'Failed to validate workflow consistency', details: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  // Validate security compliance
  async validateSecurityCompliance(): Promise<{ compliant: boolean; issues: any[]; score: number }> {
    try {
      const issues: any[] = [];

      // Mock security compliance checks
      const complianceChecks = [
        {
          name: 'Password Policy',
          compliant: true,
          details: 'All users have strong passwords'
        },
        {
          name: 'Data Encryption',
          compliant: true,
          details: 'All sensitive data is encrypted'
        },
        {
          name: 'Access Control',
          compliant: true,
          details: 'Role-based access control is properly configured'
        },
        {
          name: 'Audit Logging',
          compliant: true,
          details: 'Security events are being logged'
        },
        {
          name: 'Session Management',
          compliant: true,
          details: 'Session management is secure'
        }
      ];

      // Check for non-compliant items
      const nonCompliant = complianceChecks.filter(check => !check.compliant);
      if (nonCompliant.length > 0) {
        issues.push(...nonCompliant.map(check => ({
          type: 'security',
          severity: 'high',
          message: `Security compliance issue: ${check.name}`,
          details: check.details
        })));
      }

      // Calculate compliance score
      const compliantCount = complianceChecks.filter(check => check.compliant).length;
      const complianceScore = parseFloat(((compliantCount / complianceChecks.length) * 100).toFixed(2));

      return {
        compliant: nonCompliant.length === 0,
        issues,
        score: complianceScore
      };
    } catch (error) {
      console.error('Security Compliance Validation Error:', error);
      return {
        compliant: false,
        issues: [{ type: 'error', message: 'Failed to validate security compliance', details: error instanceof Error ? error.message : 'Unknown error' }],
        score: 0
      };
    }
  }

  // Validate performance metrics
  async validatePerformanceMetrics(): Promise<{ valid: boolean; metrics: any; recommendations: string[] }> {
    try {
      // Mock performance metrics
      const performanceMetrics = {
        loadTime: Math.random() * 2000 + 500, // 500-2500ms
        apiResponseTime: Math.random() * 1000 + 200, // 200-1200ms
        memoryUsage: Math.random() * 50 + 100, // 100-150MB
        cpuUsage: Math.random() * 30 + 10, // 10-40%
        concurrentUsers: Math.floor(Math.random() * 50) + 10 // 10-60 users
      };

      const recommendations: string[] = [];
      let valid = true;

      // Analyze metrics
      if (performanceMetrics.loadTime > 2000) {
        recommendations.push('Page load time is high - consider optimization');
        valid = false;
      }

      if (performanceMetrics.apiResponseTime > 1000) {
        recommendations.push('API response time is high - review backend performance');
        valid = false;
      }

      if (performanceMetrics.memoryUsage > 150) {
        recommendations.push('Memory usage is high - check for memory leaks');
        valid = false;
      }

      if (performanceMetrics.cpuUsage > 30) {
        recommendations.push('CPU usage is high - review resource-intensive operations');
        valid = false;
      }

      if (!recommendations.length) {
        recommendations.push('Performance metrics are within acceptable ranges');
      }

      return {
        valid,
        metrics: performanceMetrics,
        recommendations
      };
    } catch (error) {
      console.error('Performance Validation Error:', error);
      return {
        valid: false,
        metrics: {},
        recommendations: ['Failed to validate performance metrics', 'Check system monitoring tools']
      };
    }
  }

  // Validate data quality
  async validateDataQuality(data: any[]): Promise<{ valid: boolean; qualityScore: number; issues: any[] }> {
    try {
      const issues: any[] = [];
      let qualityScore = 100;

      // Mock data quality checks
      if (data.length === 0) {
        issues.push({
          type: 'error',
          message: 'No data provided for quality validation'
        });
        qualityScore = 0;
      } else {
        // Check for missing required fields
        const missingFields = data.filter(item => !item.id || !item.name);
        if (missingFields.length > 0) {
          issues.push({
            type: 'warning',
            message: `${missingFields.length} items are missing required fields`,
            affectedItems: missingFields.map(item => item.id)
          });
          qualityScore -= 20;
        }

        // Check for duplicate IDs
        const ids = data.map(item => item.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
          issues.push({
            type: 'error',
            message: 'Duplicate IDs detected in data',
            duplicateCount: ids.length - uniqueIds.size
          });
          qualityScore -= 30;
        }

        // Check for invalid values
        const invalidItems = data.filter(item =>
          (item.progress !== undefined && (item.progress < 0 || item.progress > 100)) ||
          (item.priority && !['low', 'medium', 'high', 'urgent'].includes(item.priority))
        );

        if (invalidItems.length > 0) {
          issues.push({
            type: 'error',
            message: `${invalidItems.length} items have invalid values`,
            affectedItems: invalidItems.map(item => item.id)
          });
          qualityScore -= 25;
        }
      }

      // Ensure quality score is within bounds
      qualityScore = Math.max(0, Math.min(100, qualityScore));

      return {
        valid: qualityScore >= 80,
        qualityScore,
        issues
      };
    } catch (error) {
      console.error('Data Quality Validation Error:', error);
      return {
        valid: false,
        qualityScore: 0,
        issues: [{ type: 'error', message: 'Failed to validate data quality', details: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  // Run comprehensive validation suite
  async runComprehensiveValidation(projects: Project[], tasks: Task[], users: User[]): Promise<{
    overallValid: boolean;
    projectValidation: any;
    taskValidation: any;
    userValidation: any;
    systemValidation: any;
    securityValidation: any;
    performanceValidation: any;
    recommendations: string[];
  }> {
    try {
      const results: any = {
        projectValidation: [],
        taskValidation: [],
        userValidation: [],
        systemValidation: [],
        securityValidation: [],
        performanceValidation: [],
        recommendations: []
      };

      let overallValid = true;

      // Validate projects
      for (const project of projects) {
        const validation = await this.validateProjectData(project);
        results.projectValidation.push({
          projectId: project.id,
          projectName: project.name,
          ...validation
        });

        if (!validation.valid) {
          overallValid = false;
          results.recommendations.push(`Review project "${project.name}" - ${validation.errors.length} validation errors`);
        }
      }

      // Validate tasks
      for (const task of tasks) {
        const validation = await this.validateTaskData(task);
        results.taskValidation.push({
          taskId: task.id,
          taskTitle: task.title,
          ...validation
        });

        if (!validation.valid) {
          overallValid = false;
        }
      }

      // Validate users
      for (const user of users) {
        const validation = await this.validateUserData(user);
        results.userValidation.push({
          userId: user.id,
          userName: user.name,
          ...validation
        });

        if (!validation.valid) {
          overallValid = false;
        }
      }

      // System validation
      const systemValidation = await this.runSystemValidation();
      results.systemValidation = systemValidation;
      if (!systemValidation.valid) {
        overallValid = false;
        results.recommendations.push(...systemValidation.recommendations);
      }

      // Security validation
      const securityValidation = await this.validateSecurityCompliance();
      results.securityValidation = securityValidation;
      if (!securityValidation.compliant) {
        overallValid = false;
        results.recommendations.push('Address security compliance issues immediately');
      }

      // Performance validation
      const performanceValidation = await this.validatePerformanceMetrics();
      results.performanceValidation = performanceValidation;
      if (!performanceValidation.valid) {
        overallValid = false;
        results.recommendations.push(...performanceValidation.recommendations);
      }

      // Add general recommendations
      results.recommendations.push(
        'Run validation checks regularly',
        'Address validation issues promptly',
        'Monitor system health continuously'
      );

      return {
        overallValid,
        ...results
      };
    } catch (error) {
      console.error('Comprehensive Validation Error:', error);
      return {
        overallValid: false,
        projectValidation: [],
        taskValidation: [],
        userValidation: [],
        systemValidation: [],
        securityValidation: [],
        performanceValidation: [],
        recommendations: [
          'Comprehensive validation failed',
          'Check system logs for details',
          'Contact support if issue persists'
        ]
      };
    }
  }

  // Generate validation report
  async generateValidationReport(validationResults: any): Promise<string> {
    try {
      // Format validation results into a report
      const reportLines: string[] = [
        '=== COMPREHENSIVE VALIDATION REPORT ===',
        `Generated: ${new Date().toISOString()}`,
        `Overall Status: ${validationResults.overallValid ? 'PASS' : 'FAIL'}`,
        '',
        '=== PROJECT VALIDATION ==='
      ];

      validationResults.projectValidation.forEach((project: any) => {
        reportLines.push(`Project: ${project.projectName} (${project.projectId})`);
        reportLines.push(`  Status: ${project.valid ? 'PASS' : 'FAIL'}`);
        if (!project.valid) {
          reportLines.push(`  Errors: ${project.errors.length}`);
          project.errors.forEach((error: string) => {
            reportLines.push(`    - ${error}`);
          });
        }
      });

      reportLines.push('', '=== TASK VALIDATION ===');
      validationResults.taskValidation.forEach((task: any) => {
        reportLines.push(`Task: ${task.taskTitle} (${task.taskId})`);
        reportLines.push(`  Status: ${task.valid ? 'PASS' : 'FAIL'}`);
        if (!task.valid) {
          reportLines.push(`  Errors: ${task.errors.length}`);
          task.errors.forEach((error: string) => {
            reportLines.push(`    - ${error}`);
          });
        }
      });

      // Add more sections as needed...

      const report = reportLines.join('\n');
      return report;
    } catch (error) {
      console.error('Report Generation Error:', error);
      return 'Failed to generate validation report';
    }
  }
}

export const validationService = new ValidationService();