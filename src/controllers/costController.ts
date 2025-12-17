import { Request, Response } from 'express';
import { Cost, CostApproval, CostSummary } from '@/types/cost';

// In-memory storage (replace with database in production)
let costs: Cost[] = [];
let costIdCounter = 1;

// Helper function to find a cost by ID
const findCostById = (id: string): Cost | undefined => {
  return costs.find(cost => cost.id === id);
};

export const costController = {
  // Get all costs (with optional projectId filter)
  getCosts: (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      
      let filteredCosts = [...costs];
      
      if (projectId) {
        filteredCosts = filteredCosts.filter(cost => cost.projectId === projectId);
      }
      
      res.json(filteredCosts);
    } catch (error) {
      console.error('Error fetching costs:', error);
      res.status(500).json({ error: 'Failed to fetch costs' });
    }
  },

  // Get a single cost by ID
  getCostById: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cost = findCostById(id);
      
      if (!cost) {
        return res.status(404).json({ error: 'Cost not found' });
      }
      
      res.json(cost);
    } catch (error) {
      console.error('Error fetching cost:', error);
      res.status(500).json({ error: 'Failed to fetch cost' });
    }
  },

  // Create a new cost
  createCost: (req: Request, res: Response) => {
    try {
      const newCost: Cost = {
        id: `cost-${costIdCounter++}`,
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      costs.push(newCost);
      res.status(201).json(newCost);
    } catch (error) {
      console.error('Error creating cost:', error);
      res.status(500).json({ error: 'Failed to create cost' });
    }
  },

  // Update an existing cost
  updateCost: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const costIndex = costs.findIndex(cost => cost.id === id);
      
      if (costIndex === -1) {
        return res.status(404).json({ error: 'Cost not found' });
      }
      
      const updatedCost = {
        ...costs[costIndex],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      
      costs[costIndex] = updatedCost;
      res.json(updatedCost);
    } catch (error) {
      console.error('Error updating cost:', error);
      res.status(500).json({ error: 'Failed to update cost' });
    }
  },

  // Delete a cost
  deleteCost: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const costIndex = costs.findIndex(cost => cost.id === id);
      
      if (costIndex === -1) {
        return res.status(404).json({ error: 'Cost not found' });
      }
      
      costs.splice(costIndex, 1);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting cost:', error);
      res.status(500).json({ error: 'Failed to delete cost' });
    }
  },

  // Approve a cost
  approveCost: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const costIndex = costs.findIndex(cost => cost.id === id);
      
      if (costIndex === -1) {
        return res.status(404).json({ error: 'Cost not found' });
      }
      
      const approvedCost: Cost = {
        ...costs[costIndex],
        status: 'approved',
        approvedBy: req.user?.id || 'system',
        updatedAt: new Date().toISOString(),
      };
      
      costs[costIndex] = approvedCost;
      
      // Create approval record
      const approval: CostApproval = {
        id: `approval-${Date.now()}`,
        costId: id,
        status: 'approved',
        approvedBy: req.user?.id || 'system',
        comment: comment || '',
        approvedAt: new Date().toISOString(),
      };
      
      res.json({
        cost: approvedCost,
        approval,
      });
    } catch (error) {
      console.error('Error approving cost:', error);
      res.status(500).json({ error: 'Failed to approve cost' });
    }
  },

  // Reject a cost
  rejectCost: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const costIndex = costs.findIndex(cost => cost.id === id);
      
      if (costIndex === -1) {
        return res.status(404).json({ error: 'Cost not found' });
      }
      
      const rejectedCost: Cost = {
        ...costs[costIndex],
        status: 'rejected',
        updatedAt: new Date().toISOString(),
      };
      
      costs[costIndex] = rejectedCost;
      
      // Create rejection record
      const approval: CostApproval = {
        id: `rejection-${Date.now()}`,
        costId: id,
        status: 'rejected',
        approvedBy: req.user?.id || 'system',
        comment: reason || 'Rejected without reason',
        approvedAt: new Date().toISOString(),
      };
      
      res.json({
        cost: rejectedCost,
        approval,
      });
    } catch (error) {
      console.error('Error rejecting cost:', error);
      res.status(500).json({ error: 'Failed to reject cost' });
    }
  },

  // Get cost summary for a project
  getCostSummary: (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;
      
      const projectCosts = costs.filter(cost => {
        if (cost.projectId !== projectId) return false;
        
        if (startDate && new Date(cost.date) < new Date(startDate as string)) {
          return false;
        }
        
        if (endDate && new Date(cost.date) > new Date(endDate as string)) {
          return false;
        }
        
        return true;
      });
      
      const total = projectCosts.reduce((sum, cost) => sum + cost.amount, 0);
      const byCategory = projectCosts.reduce((acc, cost) => {
        acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
        return acc;
      }, {} as Record<string, number>);
      
      const summary: CostSummary = {
        projectId,
        total,
        byCategory,
        count: projectCosts.length,
        startDate: startDate as string || new Date(0).toISOString(),
        endDate: endDate as string || new Date().toISOString(),
      };
      
      res.json(summary);
    } catch (error) {
      console.error('Error generating cost summary:', error);
      res.status(500).json({ error: 'Failed to generate cost summary' });
    }
  },
};
