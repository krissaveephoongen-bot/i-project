import { NextApiRequest, NextApiResponse } from 'next';
import { handleCostById } from './';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid cost ID' });
  }
  
  return handleCostById(req, res, id);
}
