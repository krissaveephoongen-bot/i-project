import { NextApiRequest, NextApiResponse } from 'next';
import { handleCostStatusUpdate } from '../';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid cost ID' });
  }
  
  return handleCostStatusUpdate(req, res, 'approved');
}
