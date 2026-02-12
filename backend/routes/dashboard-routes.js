import express from 'express';
import prisma from '../lib/prisma.ts';

const router = express.Router();

// GET /api/dashboard/kpi - Get KPI data
router.get('/kpi', async (req, res) => {
  try {
    // Get total portfolio value from all projects
    const projects = await prisma.project.findMany({
      select: {
        budget: true,
        status: true,
        spi: true,
      },
    });

    const totalValue = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
    const avgSpi = projects.length > 0 
      ? projects.reduce((sum, p) => sum + Number(p.spi || 1), 0) / projects.length 
      : 1;

    // Get active issues (risks)
    const activeIssues = await prisma.risk.count({
      where: {
        status: {
          in: ['open', 'in_progress'],
        },
      },
    });

    // Get billing forecast for current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const milestones = await prisma.milestone.findMany({
      where: {
        dueDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        amount: true,
      },
    });

    const billingForecast = milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);

    res.json({
      totalValue,
      activeIssues,
      billingForecast,
      avgSpi,
    });
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    res.status(500).json({ error: 'Failed to fetch KPI data' });
  } finally {
    await prisma.$disconnect();
  }
});

// GET /api/dashboard/projects - Get projects health data
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        progress: true,
        progressPlan: true,
        spi: true,
        riskLevel: true,
        status: true,
        manager: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get risk count per project
    const risks = await prisma.risk.findMany({
      where: {
        status: {
          in: ['open', 'in_progress'],
        },
      },
      select: {
        project_id: true,
      },
    });

    const risksPerProject = risks.reduce((acc, risk) => {
      acc[risk.project_id] = (acc[risk.project_id] || 0) + 1;
      return acc;
    }, {});

    // Augment projects with risk count
    const projectsWithRisk = projects.map(p => ({
      ...p,
      client: p.manager?.name || 'Unassigned',
      progress_plan: p.progressPlan,
      progress_actual: p.progress,
      spi: p.spi || 1,
      risk_level: p.riskLevel || 'Low',
      risk_count: risksPerProject[p.id] || 0,
    }));

    res.json(projectsWithRisk);
  } catch (error) {
    console.error('Error fetching projects health:', error);
    res.status(500).json({ error: 'Failed to fetch projects data' });
  } finally {
    await prisma.$disconnect();
  }
});

// GET /api/dashboard/financial - Get financial data
router.get('/financial', async (req, res) => {
  try {
    const financialData = await prisma.financialData.findMany({
      orderBy: {
        month: 'asc',
      },
    });

    const formattedData = financialData.map(d => ({
      ...d,
      month: new Date(d.month).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Number(d.revenue),
      cost: Number(d.cost),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  } finally {
    await prisma.$disconnect();
  }
});

// GET /api/dashboard/teamload - Get team load data
router.get('/teamload', async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // Sunday = 0, Monday = 1, etc.
    const monday = new Date(today);
    monday.setUTCDate(today.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = sunday.toISOString().split('T')[0];

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        date: {
          gte: new Date(weekStart),
          lte: new Date(weekEnd),
        },
      },
      select: {
        hours: true,
        date: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const userHours = {};
    
    timeEntries.forEach(entry => {
      if (!entry.user) return;

      if (!userHours[entry.user.id]) {
        userHours[entry.user.id] = { name: entry.user.name, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };
      }
      
      const day = new Date(entry.date).getUTCDay();
      // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayKey = dayMap[day];

      if (dayKey && dayKey !== 'sun' && dayKey !== 'sat') {
        userHours[entry.user.id][dayKey] += Number(entry.hours);
      }
    });

    res.json(Object.values(userHours));
  } catch (error) {
    console.error('Error fetching team load:', error);
    res.status(500).json({ error: 'Failed to fetch team load data' });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
