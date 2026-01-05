export interface ReportData {
    summary: {
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        totalTasks: number;
        completedTasks: number;
        teamMembers: number;
    };
    projects: Array<{
        id: string;
        name: string;
        status: string;
        progress: number;
        budget: number;
        teamSize: number;
        endDate: string;
    }>;
    tasks: Array<{
        id: string;
        title: string;
        project: string;
        status: string;
        priority: string;
        assignee: string | null;
        dueDate: string;
    }>;
    team: Array<{
        id: string;
        name: string;
        role: string;
        workload: number;
        activeProjects: number;
        completedTasks: number;
    }>;
}

export interface DateRange {
    start: Date;
    end: Date;
}

class ExportService {
    /**
     * Generates a report with project, task, and team data
     * @returns A promise that resolves to the report data
     */
    async generateReport(): Promise<ReportData> {
        try {
            const response = await fetch('/api/reports/data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch report data from database');
            }

            const reportData = await response.json();
            return reportData;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    async exportToPDF(data: ReportData): Promise<void> {
        try {
            const response = await fetch('/api/reports/export/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to export PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            throw error;
        }
    }

    async exportToCSV(data: ReportData): Promise<void> {
        try {
            const response = await fetch('/api/reports/export/csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to export CSV');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
    }

    async exportToJSON(data: ReportData): Promise<void> {
        try {
            const response = await fetch('/api/reports/export/json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to export JSON');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            throw error;
        }
    }

    async shareReport(reportId: string, emails: string[]): Promise<void> {
        try {
            const response = await fetch('/api/reports/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ reportId, emails }),
            });

            if (!response.ok) {
                throw new Error('Failed to share report');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sharing report:', error);
            throw error;
        }
    }
}

export const exportService = new ExportService();