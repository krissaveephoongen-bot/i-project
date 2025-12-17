import { useToast as useShadcnToast } from './toast';

export const useToast = () => {
  const { toast } = useShadcnToast();
  
  return {
    toast: (props: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      toast({
        title: props.title,
        description: props.description,
        variant: props.variant,
      });
    },
  };
};
