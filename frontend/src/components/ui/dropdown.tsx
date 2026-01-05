import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  disabled = false,
  align = 'start',
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-block w-full', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'hover:border-gray-400 hover:shadow-sm',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
          'transition-all duration-200',
          'h-10', // Fixed height for consistency
          'bg-white' // Ensure solid white background
        )}
      >
        <span className={cn('truncate', !selectedOption ? 'text-gray-400' : 'text-gray-900')}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown 
          className={cn('ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-200', {
            'text-gray-400': disabled,
            'text-gray-500': !disabled,
            'rotate-180': open,
          })} 
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200',
            'focus:outline-none',
            'bg-white', // Ensure solid white background
            {
              'left-0': align === 'start',
              'left-1/2 -translate-x-1/2': align === 'center',
              'right-0': align === 'end',
            }
          )}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="max-h-60 overflow-auto rounded-md py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className={cn(
                  'flex w-full items-center px-4 py-2 text-sm',
                  'hover:bg-blue-200 focus:bg-blue-200 focus:outline-none', // Darker blue on hover/focus
                  'transition-colors duration-150',
                  'bg-blue-50', // Light blue background for all options
                  {
                    'bg-blue-100 text-blue-900': value === option.value, // Slightly darker for selected item
                    'text-gray-800': value !== option.value, // Darker text for better contrast
                  }
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="flex-1 text-left">{option.label}</span>
                {value === option.value && (
                  <Check className="ml-2 h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { Dropdown };
