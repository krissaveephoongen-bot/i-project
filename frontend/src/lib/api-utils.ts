import { NextApiResponse } from 'next';

export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown, res: NextApiResponse) => {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ 
      success: false, 
      error: error.message 
    });
  }
  
  if (error instanceof Error) {
    return res.status(500).json({ 
      success: false, 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal Server Error' 
    });
  }
  
  return res.status(500).json({ 
    success: false, 
    error: 'An unknown error occurred' 
  });
};

export const validateRequest = (req: any, requiredFields: string[] = []) => {
  for (const field of requiredFields) {
    if (!req.body[field]) {
      throw new ApiError(400, `${field} is required`);
    }
  }
};

export const apiHandler = (handler: Function) => 
  async (req: any, res: NextApiResponse) => {
    try {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      // Handle the actual request
      await handler(req, res);
    } catch (error) {
      handleApiError(error, res);
    }
  };
