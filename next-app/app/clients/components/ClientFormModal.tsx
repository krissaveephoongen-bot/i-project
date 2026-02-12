
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/Dialog';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { createClient, updateClient, Client } from '@/app/lib/clients';
import { Label } from '@/app/components/ui/label';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess: () => void;
}

export default function ClientFormModal({ isOpen, onClose, client, onSuccess }: ClientFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<Client>>();

  useEffect(() => {
    if (client) {
      setValue('name', client.name);
      setValue('email', client.email);
      setValue('phone', client.phone);
      setValue('address', client.address);
      setValue('taxId', client.taxId);
      setValue('notes', client.notes);
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        notes: ''
      });
    }
  }, [client, isOpen, reset, setValue]);

  const onSubmit = async (data: Partial<Client>) => {
    try {
      setLoading(true);
      if (client?.id) {
        await updateClient(client.id, data);
        toast.success('Client updated successfully');
      } else {
        await createClient(data);
        toast.success('Client created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'New Client'}</DialogTitle>
          <DialogDescription>
            {client ? 'Update client details.' : 'Add a new client organization to the system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name <span className="text-red-500">*</span></Label>
            <Input 
              id="name" 
              {...register('name', { required: 'Name is required' })} 
              placeholder="Company Name Co., Ltd."
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                {...register('email')} 
                placeholder="contact@company.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                {...register('phone')} 
                placeholder="02-xxx-xxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input 
              id="taxId" 
              {...register('taxId')} 
              placeholder="1234567890123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              {...register('address')} 
              placeholder="123 Street, City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              {...register('notes')} 
              placeholder="Additional information..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (client ? 'Save Changes' : 'Create Client')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
