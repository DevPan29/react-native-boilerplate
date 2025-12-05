import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import { Profile, UserRole, Todo } from '../types';

// Fetch all users (admin only)
export const useUsers = () => {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async (): Promise<Profile[]> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
    enabled: profile?.role === 'admin',
  });
};

// Fetch single user profile (admin only)
export const useUserProfile = (userId: string) => {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.profiles.detail(userId),
    queryFn: async (): Promise<Profile> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: profile?.role === 'admin' && !!userId,
  });
};

// Fetch user's todos (admin only)
export const useUserTodos = (userId: string) => {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: [...queryKeys.todos.all, 'user', userId],
    queryFn: async (): Promise<Todo[]> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: profile?.role === 'admin' && !!userId,
  });
};

// Update user role (admin only)
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }): Promise<Profile> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.detail(variables.userId),
      });
    },
  });
};

// Get dashboard statistics (admin only)
export const useAdminDashboardStats = () => {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.stats.dashboard(),
    queryFn: async () => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch todos with status breakdown
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('status');

      if (todosError) throw todosError;

      // Fetch admins count
      const { count: adminsCount, error: adminsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminsError) throw adminsError;

      return {
        totalUsers: usersCount ?? 0,
        totalAdmins: adminsCount ?? 0,
        totalTodos: todos.length,
        pendingTodos: todos.filter((t) => t.status === 'pending').length,
        inProgressTodos: todos.filter((t) => t.status === 'in_progress').length,
        completedTodos: todos.filter((t) => t.status === 'completed').length,
      };
    },
    enabled: profile?.role === 'admin',
  });
};

// Get users with their todo counts (admin only)
export const useUsersWithStats = () => {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: [...queryKeys.users.all, 'with-stats'],
    queryFn: async () => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // Fetch all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all todos
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('user_id, status');

      if (todosError) throw todosError;

      // Map users with their stats
      return users.map((user) => {
        const userTodos = todos.filter((t) => t.user_id === user.id);
        return {
          ...user,
          todoStats: {
            total: userTodos.length,
            completed: userTodos.filter((t) => t.status === 'completed').length,
          },
        };
      });
    },
    enabled: profile?.role === 'admin',
  });
};
