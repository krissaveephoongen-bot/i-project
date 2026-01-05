/**
 * useUsers Hook
 * Complete CRUD operations for user management with React Query integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUserProfile,
  getUserByEmail,
  bulkCreateUsers,
  bulkUpdateUserRoles,
  deactivateUsers,
  getUserStats,
  exportUsers,
  type User,
  type CreateUserInput,
  type UpdateUserInput
} from '@/services/userService';

/**
 * Hook for managing user operations
 */
export function useUsers() {
  const queryClient = useQueryClient();

  // Fetch all users
  const useGetUsers = (limit?: number, offset?: number, role?: string, search?: string) => {
    return useQuery({
      queryKey: ['users', limit, offset, role, search],
      queryFn: () => getUsers(limit, offset, role, search),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  // Fetch single user
  const useGetUser = (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => getUserById(id),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
  };

  // Fetch current user
  const useGetCurrentUser = () => {
    return useQuery({
      queryKey: ['currentUser'],
      queryFn: () => getCurrentUser(),
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60, // 60 minutes
    });
  };

  // Create user
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Update user
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['user', data.id], data);
    }
  });

  // Update current user profile
  const updateCurrentUserMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => updateCurrentUserProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Bulk create users
  const bulkCreateUsersMutation = useMutation({
    mutationFn: (users: CreateUserInput[]) => bulkCreateUsers(users),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Bulk update roles
  const bulkUpdateRolesMutation = useMutation({
    mutationFn: ({ userIds, role }: { userIds: string[]; role: 'admin' | 'manager' | 'member' }) =>
      bulkUpdateUserRoles(userIds, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Deactivate users
  const deactivateUsersMutation = useMutation({
    mutationFn: (userIds: string[]) => deactivateUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  return {
    useGetUsers,
    useGetUser,
    useGetCurrentUser,
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    updateCurrentUser: updateCurrentUserMutation.mutate,
    updateCurrentUserAsync: updateCurrentUserMutation.mutateAsync,
    isUpdatingCurrentUser: updateCurrentUserMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
    bulkCreateUsers: bulkCreateUsersMutation.mutate,
    bulkCreateUsersAsync: bulkCreateUsersMutation.mutateAsync,
    isCreatingBulk: bulkCreateUsersMutation.isPending,
    bulkUpdateRoles: bulkUpdateRolesMutation.mutate,
    bulkUpdateRolesAsync: bulkUpdateRolesMutation.mutateAsync,
    isUpdatingRoles: bulkUpdateRolesMutation.isPending,
    deactivateUsers: deactivateUsersMutation.mutate,
    deactivateUsersAsync: deactivateUsersMutation.mutateAsync,
    isDeactivating: deactivateUsersMutation.isPending,
  };
}

/**
 * Hook for user statistics
 */
export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: () => getUserStats(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 120, // 2 hours
  });
}

/**
 * Hook for exporting users
 */
export function useExportUsers() {
  return useMutation({
    mutationFn: (format?: 'csv' | 'json') => exportUsers(format),
    onSuccess: (blob, format) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users.${format === 'json' ? 'json' : 'csv'}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * Hook for searching users by email
 */
export function useSearchUserByEmail(email: string) {
  return useQuery({
    queryKey: ['userByEmail', email],
    queryFn: () => getUserByEmail(email),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
    enabled: !!email && email.length > 2,
  });
}
