// frontend/src/pages/UserProfilePage.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileForm } from '@/components/forms/UserProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
}

const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored here
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }
  return response.json();
};

const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user profile');
  }
  return response.json();
};

const changeUserPassword = async (userId: string, data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
  const response = await fetch(`/api/users/${userId}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to change password');
  }
  return response.json();
};

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth(); // Get current user from auth context
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading, isError, error } = useQuery<UserProfile, Error>({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user?.id, // Only run query if user ID is available
  });

  // Mutation for updating user profile
  const updateProfileMutation = useMutation<UserProfile, Error, Partial<UserProfile>>({
    mutationFn: (data) => updateUserProfile(user!.id, data),
    onSuccess: (updatedProfile) => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      // Optionally update auth context if name/avatar changes
      // queryClient.setQueryData(['auth', 'me'], updatedProfile);
    },
    onError: (err) => {
      toast.error(`Error updating profile: ${err.message}`);
    },
  });

  // Mutation for changing password
  const changePasswordMutation = useMutation<{ message: string }, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: (data) => changeUserPassword(user!.id, data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      // Optionally force re-login for security after password change
    },
    onError: (err) => {
      toast.error(`Error changing password: ${err.message}`);
    },
  });


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>Error loading profile: {error?.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>User profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfileForm
              initialData={profile}
              onSubmit={updateProfileMutation.mutate}
              isSubmitting={updateProfileMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <ChangePasswordForm 
              onSubmit={changePasswordMutation.mutate}
              isSubmitting={changePasswordMutation.isPending}
            />
            
            <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Two-factor authentication is currently disabled.
            </p>
            {/* Add button to enable/disable 2FA */}
            {/* <Button variant="outline" className="mt-4">Enable 2FA</Button> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
