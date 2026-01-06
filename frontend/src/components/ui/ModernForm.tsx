import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertCircle, CheckCircle, Eye, EyeOff, Search, Calendar, User, Mail, Phone, MapPin } from 'lucide-react';

interface FormField {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'number' | 'tel' | 'file';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helper?: string;
  description?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  options?: Array<{ label: string; value: string | number }>;
}

interface FormSection {
  title: string;
  fields: FormField[];
  description?: string;
  className?: string;
}

interface FormProps {
  title: string;
  description?: string;
  sections: FormSection[];
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  submitLoading?: boolean;
  className?: string;
}

const ModernForm: React.FC<FormProps> = ({
  title,
  description,
  sections,
  onSubmit,
  submitText = 'ส่งงาน',
  submitLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} จำเป็นต้อง`;
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'รูปแบบอีเมล์ไม่ถูกต้อง';
      }
    }
    
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        return 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
      }
    }
    
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    sections.forEach(section => {
      section.fields.forEach(field => {
        const error = validateField(field, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({});
      setErrors({});
      // Success feedback
      console.log('Form submitted successfully:', formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ 
        submit: (error as string) || 'การส่งงานล้วลม กรุณากรุณอุมัติ กรุณากรุณอุมัติ',
        general: 'เกิดข้อผิดพลาดข้อมูล กรุณากรุณอุมัติ'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name];
    const isFocused = focusedField === field.name;
    const fieldId = `field-${field.name}`;

    return (
      <div key={fieldId} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.description && (
          <p className="text-sm text-gray-500 mb-2">{field.description}</p>
        )}

        <div className="relative">
          {field.icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {field.icon}
            </div>
          )}
          
          <div className="flex-1">
            {field.type === 'select' ? (
              <select
                id={fieldId}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                disabled={field.disabled}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  hasError && "border-red-500 focus:ring-red-500",
                  field.disabled && "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
              >
                {field.placeholder && (
                  <option value="">{field.placeholder}</option>
                )}
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={fieldId}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                rows={4}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none",
                  hasError && "border-red-500 focus:ring-red-500",
                  field.disabled && "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
              />
            ) : field.type === 'date' ? (
              <input
                type="date"
                id={fieldId}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  hasError && "border-red-500 focus:ring-red-500",
                  field.disabled && "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
              />
            ) : field.type === 'file' ? (
              <input
                type="file"
                id={fieldId}
                name={field.name}
                onChange={(e) => handleInputChange(field.name, e.target.files?.[0])}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                disabled={field.disabled}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  hasError && "border-red-500 focus:ring-red-500",
                  field.disabled && "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
              />
            ) : (
              <input
                type={field.type}
                id={fieldId}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  hasError && "border-red-500 focus:ring-red-500",
                  field.disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
                  field.type === 'password' && "pr-10"
                )}
              />
            )}
            
            {field.rightElement && (
              <div className="absolute right-3 top-1/2">
                {field.rightElement}
              </div>
            )}
          </div>

          {hasError && (
            <div className="absolute inset-y-0 right-0 pr-3">
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500">{errors[field.name]}</span>
              </div>
            </div>
          )}
        </div>

        {field.helper && (
          <p className="text-xs text-gray-500 mt-1">{field.helper}</p>
        )}
      </div>
    );
  };

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={section.className}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>
            {section.description && (
              <p className="text-gray-600 mb-4">{section.description}</p>
            )}
            
            <div className="space-y-6">
              {section.fields.map(renderField)}
            </div>
          </div>
        ))}
        
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>กำลงงาน...</span>
              </>
            ) : (
              <>
                <CheckCircle className="inline-block h-4 w-4 mr-2" />
                <span>{submitText}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ModernForm;
