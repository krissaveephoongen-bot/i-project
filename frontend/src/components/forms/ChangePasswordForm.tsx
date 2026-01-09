// frontend/src/components/forms/ChangePasswordForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define the schema for changing password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password.'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match.",
  path: ['confirmNewPassword'], // Set the error on the confirm password field
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSubmit: (data: Omit<ChangePasswordFormData, 'confirmNewPassword'>) => void;
  isSubmitting: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleFormSubmit = (data: ChangePasswordFormData) => {
    onSubmit({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    reset(); // Clear form after submission
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Current Password */}
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" type="password" {...register('currentPassword')} />
        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
      </div>

      {/* New Password */}
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" type="password" {...register('newPassword')} />
        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
      </div>

      {/* Confirm New Password */}
      <div>
        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
        <Input id="confirmNewPassword" type="password" {...register('confirmNewPassword')} />
        {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center">
            <LoadingSpinner size={16} className="mr-2" /> Changing...
          </span>
        ) : (
          'Change Password'
        )}
      </Button>
    </form>
  );
};
