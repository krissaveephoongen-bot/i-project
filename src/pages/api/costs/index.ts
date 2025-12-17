import { NextApiRequest, NextApiResponse } from 'next';
import { Cost, CostApproval, CostSummary } from '@/types/cost';
import { getSession } from 'next-auth/react';

// In-memory storage (replace with database in production)
let costs: Cost[] = [];
let costIdCounter = 1;

// Helper function to find a cost by ID
const findCostById = (id: string): Cost | undefined => {
  return costs.find(cost => cost.id === id);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { projectId } = req.query;
        let filteredCosts = [...costs];
        
        if (projectId) {
          filteredCosts = filteredCosts.filter(
            cost => cost.projectId === projectId
          );
        }
        
        return res.status(200).json(filteredCosts);
      }
      
      case 'POST': {
        const newCost: Cost = {
          id: `cost-${costIdCounter++}`,
          ...req.body,
          status: 'pending',
          submittedBy: session.user?.id || 'unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        costs.push(newCost);
        return res.status(201).json(newCost);
      }
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Helper function to handle cost approval/rejection
const handleCostStatusUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  status: 'approved' | 'rejected'
) => {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.query;
    const cost = findCostById(id as string);
    
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }
    
    const updatedCost: Cost = {
      ...cost,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    if (status === 'approved') {
      updatedCost.approvedBy = session.user?.id || 'system';
    }
    
    // Update the cost in the array
    costs = costs.map(c => (c.id === id ? updatedCost : c));
    
    // Create approval record
    const approval: CostApproval = {
      id: `${status}-${Date.now()}`,
      costId: id as string,
      status,
      approvedBy: session.user?.id || 'system',
      comment: status === 'approved' 
        ? req.body.comment || '' 
        : req.body.reason || 'No reason provided',
      approvedAt: new Date().toISOString(),
    };
    
    return res.status(200).json({
      cost: updatedCost,
      approval,
    });
  } catch (error) {
    console.error(`Error ${status} cost:`, error);
    return res.status(500).json({ 
      error: `Failed to ${status} cost`,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Individual cost endpoints
const handleCostById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  costId: string
) => {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const cost = findCostById(costId);
    
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    switch (req.method) {
      case 'GET':
        return res.status(200).json(cost);
        
      case 'PUT':
        const updatedCost: Cost = {
          ...cost,
          ...req.body,
          updatedAt: new Date().toISOString(),
        };
        
        costs = costs.map(c => (c.id === costId ? updatedCost : c));
        return res.status(200).json(updatedCost);
        
      case 'DELETE':
        costs = costs.filter(c => c.id !== costId);
        return res.status(204).end();
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling cost:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Export named handlers for dynamic routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export { handleCostStatusUpdate, handleCostById };
