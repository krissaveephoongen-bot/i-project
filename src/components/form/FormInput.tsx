import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps<any>>(
  ({
    name,
    control,
    label,
    placeholder,
    type = 'text',
    required,
    disabled,
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
          <Input
            {...field}
            ref={ref}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
          />
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

FormInput.displayName = 'FormInput';
