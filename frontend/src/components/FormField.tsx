import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required = false,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`
        w-full px-3 py-2 rounded-lg border
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        placeholder-gray-500 dark:placeholder-gray-400
        transition
        ${
          error
            ? 'border-red-500 dark:border-red-600 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-0
        ${className}
      `}
      {...props}
    />
  )
);
FormInput.displayName = 'FormInput';

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ error, className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`
      w-full px-3 py-2 rounded-lg border
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      placeholder-gray-500 dark:placeholder-gray-400
      transition
      ${
        error
          ? 'border-red-500 dark:border-red-600 focus:ring-red-500'
          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
      }
      focus:outline-none focus:ring-2 focus:ring-offset-0
      resize-none
      ${className}
    `}
    {...props}
  />
));
FormTextarea.displayName = 'FormTextarea';
