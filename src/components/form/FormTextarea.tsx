import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  helperText?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps<any>>(
  ({
    name,
    control,
    label,
    placeholder,
    required,
    disabled,
    rows = 4,
    maxLength,
    className,
    helperText,
  }, ref) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          {label && (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="relative">
            <textarea
              {...field}
              ref={ref}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                error && 'border-red-500 focus:ring-red-500',
                disabled && 'bg-gray-100 cursor-not-allowed',
                className
              )}
            />
            {maxLength && (
              <p className="text-xs text-gray-500 mt-1">
                {field.value?.length || 0} / {maxLength}
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-500">{error.message}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    />
  )
);

FormTextarea.displayName = 'FormTextarea';
