import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import {
  SignInCredentials,
  SignUpCredentials,
  UpdateProfileInput,
} from '../types';

// Sign In
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignInCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.current() });
    },
  });
};

// Sign Up
export const useSignUp = () => {
  return useMutation({
    mutationFn: async (credentials: SignUpCredentials) => {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name || '',
          },
        },
      });

      if (error) throw error;
      return data;
    },
  });
};

// Sign Out
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const signOut = useAuthStore((state) => state.signOut);

  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      // Clear all queries on sign out
      queryClient.clear();
    },
  });
};

// Update Profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(input)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.current() });
    },
  });
};

// Password Reset Request
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'todoapp://reset-password',
      });

      if (error) throw error;
    },
  });
};

// Update Password
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
  });
};
