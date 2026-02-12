import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body);
      
      if (error) {
        const errorMessage = error.details.map((detail: any) => detail.message).join(', ');
        throw new AppError(errorMessage, 400);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
