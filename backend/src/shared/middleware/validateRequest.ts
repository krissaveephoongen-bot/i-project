import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "../errors/AppError";
import { ErrorCode } from "../types/api-response";

export interface ValidateRequestOptions {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
  abortEarly?: boolean;
}

/**
 * Middleware for validating request body, query, and params
 * @param options - Schema definitions for body, query, and params
 */
export const validateRequest = (options: ValidateRequestOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Record<string, string[]> = {};

      // Validate body
      if (options.body) {
        const { error, value } = options.body.validate(req.body, {
          abortEarly: false,
        });
        if (error) {
          errors.body = error.details.map((d: any) => d.message);
          req.body = value; // Update with cleaned value
        } else {
          req.body = value;
        }
      }

      // Validate query
      if (options.query) {
        const { error, value } = options.query.validate(req.query, {
          abortEarly: false,
        });
        if (error) {
          errors.query = error.details.map((d: any) => d.message);
          (req as any).query = value;
        } else {
          (req as any).query = value;
        }
      }

      // Validate params
      if (options.params) {
        const { error, value } = options.params.validate(req.params, {
          abortEarly: false,
        });
        if (error) {
          errors.params = error.details.map((d: any) => d.message);
          (req as any).params = value;
        } else {
          (req as any).params = value;
        }
      }

      // If there are errors, throw
      if (Object.keys(errors).length > 0) {
        const appError = new AppError(
          "Validation failed",
          400,
          ErrorCode.VALIDATION_ERROR,
        );
        appError.details = errors;
        throw appError;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Shorthand for body-only validation
 */
export const validateBody = (schema: Joi.Schema) => {
  return validateRequest({ body: schema });
};

/**
 * Shorthand for query-only validation
 */
export const validateQuery = (schema: Joi.Schema) => {
  return validateRequest({ query: schema });
};

/**
 * Shorthand for params-only validation
 */
export const validateParams = (schema: Joi.Schema) => {
  return validateRequest({ params: schema });
};
