import React, { useState, useMemo } from 'react';
import { Card, Select, Typography } from 'antd';
import SCurveChart from './SCurveChart';

const { Title, Text } = Typography;
const { Option } = Select;

type Project = {
  id: string;
  name: string;
};

type SCurveDataPoint = {
  month: string;
  date: string;
  plannedPercentage: number;
  actualPercentage: number;
  plannedWeight: number;
  actualWeight: number;
};

interface ProjectSCurveChartProps {
  projects: Project[];
  projectData: Record<string, SCurveDataPoint[]>;
  isLoading?: boolean;
  onProjectChange?: (projectId: string) => void;
}

const ProjectSCurveChart: React.FC<ProjectSCurveChartProps> = ({ 
  projects, 
  projectData, 
  isLoading = false,
  onProjectChange
}) => {
  // Default to first project if available, otherwise 'all'
  const defaultProject = projects.length > 0 ? projects[0].id : 'all';
  const [selectedProject, setSelectedProject] = useState<string>(defaultProject);
  
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    if (onProjectChange) {
      onProjectChange(value);
    }
  };

  // Get data for the selected project or combine all projects
  const chartData = useMemo(() => {
    if (selectedProject === 'all') {
      // Combine data from all projects
      const combinedData: Record<string, SCurveDataPoint> = {};
      
      // Safely process all data points
      Object.values(projectData).flat().forEach((point: SCurveDataPoint) => {
        if (!point?.date) return; // Skip invalid data points
        
        if (!combinedData[point.date]) {
          combinedData[point.date] = {
            month: point.month || '',
            date: point.date,
            plannedPercentage: 0,
            actualPercentage: 0,
            plannedWeight: 0,
            actualWeight: 0,
          };
        }
        
        const currentData = combinedData[point.date];
        if (currentData) {
          currentData.plannedPercentage += point.plannedPercentage || 0;
          currentData.actualPercentage += point.actualPercentage || 0;
          currentData.plannedWeight += point.plannedWeight || 0;
          currentData.actualWeight += point.actualWeight || 0;
        }
      });

      // Average the percentages
      const projectCount = Object.keys(projectData).length;
      Object.values(combinedData).forEach(point => {
        if (point) {
          point.plannedPercentage = projectCount > 0 ? point.plannedPercentage / projectCount : 0;
          point.actualPercentage = projectCount > 0 ? point.actualPercentage / projectCount : 0;
        }
      });

      return Object.values(combinedData).filter(Boolean) as SCurveDataPoint[];
    }
    
    return projectData[selectedProject] || [];
  }, [selectedProject, projectData]);

  if (isLoading) {
    return (
      <Card style={{ width: '100%', height: '500px' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4}>Project Progress Overview</Title>
        </div>
        <div style={{ height: 'calc(100% - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">Loading S-Curve data...</Text>
        </div>
      </Card>
    );
  }

  const hasData = chartData && chartData.length > 0;
  const projectName = selectedProject === 'all' 
    ? 'All Projects' 
    : projects.find(p => p.id === selectedProject)?.name || 'Project';

  return (
    <Card
      style={{
        width: '100%',
        height: '100%',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      bodyStyle={{
        height: 'calc(100% - 64px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 24px'
      }}
      title={
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <Title level={4} className="mb-0">Project Progress S-Curve</Title>
          <div className="w-full md:w-64">
            <Select
              value={selectedProject}
              onChange={handleProjectChange}
              style={{ width: '100%' }}
              placeholder="Select a project"
            >
              <Option value="all">All Projects</Option>
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      }
    >
      {!hasData ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          background: '#fafafa'
        }}>
          <Text type="secondary" style={{ textAlign: 'center', padding: 16, fontSize: '16px' }}>
            กรุณาเลือกโครงการเพื่อแสดงกราฟ S-curve
          </Text>
        </div>
      ) : (
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <SCurveChart 
            data={chartData} 
            projectName={projectName}
          />
        </div>
      )}
    </Card>
  );
};

export default ProjectSCurveChart;
