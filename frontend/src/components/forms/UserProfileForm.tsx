// frontend/src/components/forms/UserProfileForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define the schema for user profile data using Zod
const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid URL for avatar.').optional().or(z.literal('')),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  initialData: UserProfileFormData;
  onSubmit: (data: Partial<UserProfileFormData>) => void;
  isSubmitting: boolean;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = (data: UserProfileFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Email (read-only for now) */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} disabled />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Department */}
      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register('department')} />
        {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
      </div>

      {/* Position */}
      <div>
        <Label htmlFor="position">Position</Label>
        <Input id="position" {...register('position')} />
        {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register('phone')} />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      {/* Avatar URL */}
      <div>
        <Label htmlFor="avatar">Avatar URL</Label>
        <Input id="avatar" {...register('avatar')} placeholder="e.g., https://example.com/avatar.jpg" />
        {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? (
          <span className="flex items-center">
            <LoadingSpinner size={16} className="mr-2" /> Saving...
          </span>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
};
