import React from 'react';
import { useForm, UseFormProps, FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodSchema } from 'zod';

/**
 * Enhanced useForm hook with Zod schema validation
 * Simplifies form setup with built-in validation
 */
export const useFormWithValidation = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  schema: ZodSchema,
  options?: Omit<UseFormProps<TFieldValues, TContext>, 'resolver'>
): UseFormReturn<TFieldValues, TContext> => {
  return useForm<TFieldValues, TContext>({
    resolver: zodResolver(schema),
    mode: 'onBlur', // Validate on blur by default
    ...options,
  });
};

/**
 * Custom validation hook for async operations
 */
export const useValidation = <T,>(schema: ZodSchema) => {
  const validate = async (data: unknown): Promise<{ success: boolean; data?: T; errors?: string[] }> => {
    try {
      const result = await schema.parseAsync(data);
      return { success: true, data: result as T };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  };

  return { validate };
  };

/**
 * Hook for form field error display
 */
export const useFormFieldError = (fieldError: any) => {
  return {
    hasError: !!fieldError,
    errorMessage: fieldError?.message || '',
    className: fieldError ? 'border-red-500' : '',
  };
};

/**
 * Hook for debounced form validation (useful for async validation)
 */
export const useDebouncedValidation = <T,>(
  schema: ZodSchema,
  delay: number = 500
) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const validate = async (data: unknown): Promise<{ success: boolean; data?: T; errors?: string[] }> => {
    return new Promise((resolve) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await schema.parseAsync(data);
          resolve({ success: true, data: result as T });
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errors = error.errors.map((err) => {
              const path = err.path.join('.');
              return `${path}: ${err.message}`;
            });
            resolve({ success: false, errors });
          } else {
            resolve({ success: false, errors: ['Validation failed'] });
          }
        }
      }, delay);
    });
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { validate };
};
