import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { formatCurrency } from './currency';

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  budget: number;
  spent: number;
  clientName: string;
  projectManager: string;
  startDate: string;
  endDate: string;
  tasksCount: number;
  completedTasks: number;
  teamMembers: string[];
}

/**
 * Export projects to CSV format
 */
export const exportToCSV = (projects: Project[]) => {
  const headers = [
    'Code',
    'Name',
    'Client',
    'Status',
    'Priority',
    'Progress',
    'Budget',
    'Spent',
    'Budget Utilized',
    'PM',
    'Team Size',
    'Start Date',
    'End Date',
    'Tasks Completed'
  ];

  const rows = projects.map(p => [
    p.code,
    p.name,
    p.clientName,
    p.status,
    p.priority,
    `${p.progress}%`,
    formatCurrency(p.budget),
    formatCurrency(p.spent),
    `${p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0}%`,
    p.projectManager,
    p.teamMembers.length,
    new Date(p.startDate).toLocaleDateString(),
    new Date(p.endDate).toLocaleDateString(),
    `${p.completedTasks}/${p.tasksCount}`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `projects-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export projects to Excel format
 */
export const exportToExcel = (projects: Project[]) => {
  const data = projects.map(p => ({
    Code: p.code,
    Name: p.name,
    Client: p.clientName,
    Status: p.status,
    Priority: p.priority,
    Progress: `${p.progress}%`,
    Budget: formatCurrency(p.budget),
    Spent: formatCurrency(p.spent),
    'Budget Utilized': `${p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0}%`,
    'Project Manager': p.projectManager,
    'Team Size': p.teamMembers.length,
    'Start Date': new Date(p.startDate).toLocaleDateString(),
    'End Date': new Date(p.endDate).toLocaleDateString(),
    'Tasks Completed': `${p.completedTasks}/${p.tasksCount}`,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Projects');

  // Auto-adjust column widths
  const colWidths = [
    { wch: 12 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `projects-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export projects to PDF format
 */
export const exportToPDF = (projects: Project[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Title
  doc.setFontSize(16);
  doc.text('Project Report', margin, 15);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, 22);
  doc.text(`Total Projects: ${projects.length}`, margin, 28);

  let yPosition = 35;

  projects.forEach((project, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 15;
    }

    // Project header
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${project.name} (${project.code})`, margin, yPosition);
    yPosition += 7;

    // Project details
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    const details = [
      `Status: ${project.status} | Priority: ${project.priority} | Progress: ${project.progress}%`,
      `Client: ${project.clientName} | PM: ${project.projectManager}`,
      `Budget: ${formatCurrency(project.budget)} | Spent: ${formatCurrency(project.spent)} (${Math.round((project.spent / project.budget) * 100)}%)`,
      `Timeline: ${new Date(project.startDate).toLocaleDateString()} to ${new Date(project.endDate).toLocaleDateString()}`,
      `Tasks: ${project.completedTasks}/${project.tasksCount} | Team: ${project.teamMembers.length} members`
    ];

    details.forEach(detail => {
      doc.text(detail, margin + 2, yPosition);
      yPosition += 5;
    });

    yPosition += 3;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  for (let i = 1; i <= doc.internal.pages.length - 1; i++) {
    doc.setPage(i);
    doc.text(`Page ${i}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  doc.save(`projects-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export single project details to PDF
 */
export const exportProjectToPDF = (project: Project) => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.text(project.name, margin, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(project.code, margin, 28);

  // Title sections
  const addSection = (title: string, yPos: number) => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin, yPos);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
    return yPos + 10;
  };

  let y = 35;

  // Overview
  y = addSection('Overview', y);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const overviewData = [
    ['Status:', project.status],
    ['Priority:', project.priority],
    ['Client:', project.clientName],
    ['Project Manager:', project.projectManager],
  ];

  overviewData.forEach(([key, value]) => {
    doc.text(key, margin, y);
    doc.text(value, margin + 50, y);
    y += 6;
  });

  y += 5;

  // Progress
  y = addSection('Progress & Performance', y);
  const progressData = [
    ['Overall Progress:', `${project.progress}%`],
    ['Budget Utilization:', `${Math.round((project.spent / project.budget) * 100)}%`],
    ['Tasks Completed:', `${project.completedTasks} of ${project.tasksCount}`],
  ];

  progressData.forEach(([key, value]) => {
    doc.text(key, margin, y);
    doc.text(value, margin + 50, y);
    y += 6;
  });

  y += 5;

  // Budget
  y = addSection('Budget Information', y);
  const budgetData = [
    ['Total Budget:', formatCurrency(project.budget)],
    ['Amount Spent:', formatCurrency(project.spent)],
    ['Remaining:', formatCurrency(project.budget - project.spent)],
  ];

  budgetData.forEach(([key, value]) => {
    doc.text(key, margin, y);
    doc.text(value, margin + 50, y);
    y += 6;
  });

  y += 5;

  // Timeline
  y = addSection('Timeline', y);
  const timelineData = [
    ['Start Date:', new Date(project.startDate).toLocaleDateString()],
    ['End Date:', new Date(project.endDate).toLocaleDateString()],
    ['Duration:', `${Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`],
  ];

  timelineData.forEach(([key, value]) => {
    doc.text(key, margin, y);
    doc.text(value, margin + 50, y);
    y += 6;
  });

  y += 5;

  // Team
  y = addSection('Project Team', y);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Team Size: ${project.teamMembers.length} members`, margin, y);
  y += 8;

  project.teamMembers.forEach((member, index) => {
    doc.text(`• ${member}`, margin + 5, y);
    y += 5;
  });

  doc.save(`${project.code}-${project.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Export projects summary statistics to PDF
 */
export const exportSummaryToPDF = (
  projects: Project[],
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    totalSpent: number;
    averageProgress: number;
  }
) => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text('Project Management Summary', margin, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, 28);

  // KPIs
  let y = 40;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Key Performance Indicators', margin, y);

  y += 12;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const kpis = [
    [`Total Projects:`, `${stats.totalProjects}`],
    [`Active Projects:`, `${stats.activeProjects}`],
    [`Completed Projects:`, `${stats.completedProjects}`],
    [`Total Budget:`, `${formatCurrency(stats.totalBudget)}`],
    [`Total Spent:`, `${formatCurrency(stats.totalSpent)}`],
    [`Average Progress:`, `${Math.round(stats.averageProgress)}%`],
  ];

  kpis.forEach(([key, value]) => {
    doc.text(key, margin + 5, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(value, margin + 100, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    y += 8;
  });

  doc.save(`project-summary-${new Date().toISOString().split('T')[0]}.pdf`);
};
