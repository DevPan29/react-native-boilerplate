import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilters,
  TodoStatus,
} from '../types';

// Fetch all todos for current user
export const useTodos = (filters?: TodoFilters) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.todos.list(filters ?? {}),
    queryFn: async (): Promise<Todo[]> => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!user,
  });
};

// Fetch single todo by ID
export const useTodo = (id: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.todos.detail(id),
    queryFn: async (): Promise<Todo> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Todo;
    },
    enabled: !!user && !!id,
  });
};

// Create todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: CreateTodoInput): Promise<Todo> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('todos')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
    },
  });
};

// Update todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: UpdateTodoInput): Promise<Todo> => {
      if (!user) throw new Error('User not authenticated');

      const { id, ...updateData } = input;

      const { data, error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.detail(data.id),
      });
    },
  });
};

// Delete todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
    },
  });
};

// Toggle todo status (quick action)
export const useToggleTodoStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      id,
      currentStatus,
    }: {
      id: string;
      currentStatus: TodoStatus;
    }): Promise<Todo> => {
      if (!user) throw new Error('User not authenticated');

      const newStatus: TodoStatus =
        currentStatus === 'completed' ? 'pending' : 'completed';

      const { data, error } = await supabase
        .from('todos')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onMutate: async ({ id, currentStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.lists() });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(
        queryKeys.todos.list({})
      );

      // Optimistically update
      if (previousTodos) {
        const newStatus: TodoStatus =
          currentStatus === 'completed' ? 'pending' : 'completed';

        queryClient.setQueryData<Todo[]>(
          queryKeys.todos.list({}),
          previousTodos.map((todo) =>
            todo.id === id ? { ...todo, status: newStatus } : todo
          )
        );
      }

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(
          queryKeys.todos.list({}),
          context.previousTodos
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
    },
  });
};

// Get todo statistics
export const useTodoStats = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...queryKeys.todos.all, 'stats'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('todos')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter((t) => t.status === 'pending').length,
        in_progress: data.filter((t) => t.status === 'in_progress').length,
        completed: data.filter((t) => t.status === 'completed').length,
      };

      return stats;
    },
    enabled: !!user,
  });
};
