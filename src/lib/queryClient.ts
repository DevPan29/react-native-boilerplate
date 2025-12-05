import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query Keys Factory
export const queryKeys = {
  // Todos
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.todos.lists(), filters] as const,
    details: () => [...queryKeys.todos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.todos.details(), id] as const,
  },
  // Profiles
  profiles: {
    all: ['profiles'] as const,
    details: () => [...queryKeys.profiles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.profiles.details(), id] as const,
    current: () => [...queryKeys.profiles.all, 'current'] as const,
  },
  // Users (admin)
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
  },
  // Stats (admin)
  stats: {
    all: ['stats'] as const,
    dashboard: () => [...queryKeys.stats.all, 'dashboard'] as const,
  },
};
