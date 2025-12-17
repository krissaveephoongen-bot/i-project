import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface MobileFABProps {
  className?: string;
}

const quickActions = [];

const MobileFAB = ({ className }: MobileFABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className={cn('fixed bottom-20 right-4 z-40', className)}>
      {/* Action buttons */}
      <div className={cn(
        'flex flex-col space-y-3 mb-4 transition-all duration-300 ease-in-out',
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.path}
              className={cn(
                'flex items-center transition-all duration-200 delay-75',
                isOpen 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-4'
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 mr-3 min-w-[120px]">
                <span className="text-sm font-medium text-gray-900">{action.title}</span>
              </div>
              <Button
                size="icon"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg text-white border-2 border-white',
                  action.color
                )}
                onClick={() => handleAction(action.path)}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg text-white transition-all duration-200',
          'bg-blue-600 hover:bg-blue-700 border-2 border-white',
          isOpen ? 'rotate-45' : 'rotate-0'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
      
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MobileFAB;