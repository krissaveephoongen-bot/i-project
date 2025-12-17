import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
  className?: string;
  helperText?: string;
}

export const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps<any>>(
  ({
    name,
    control,
    label,
    placeholder = 'Select...',
    required,
    disabled,
    options,
    className,
    helperText,
  }, ref) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2" ref={ref}>
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(
              error && 'border-red-500',
              className
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

FormSelect.displayName = 'FormSelect';
