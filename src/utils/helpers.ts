import { TodoPriority, TodoStatus } from '../types';
import { colors } from '../theme/colors';

// Date formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Adesso';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min fa`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} giorni fa`;

  return formatDate(dateString);
};

// Status helpers
export const getStatusColors = (status: TodoStatus): { bg: string; text: string } => {
  const statusColors: Record<TodoStatus, { bg: string; text: string }> = {
    pending: { bg: colors.warning[100], text: colors.warning[700] },
    in_progress: { bg: colors.primary[100], text: colors.primary[700] },
    completed: { bg: colors.success[100], text: colors.success[700] },
  };
  return statusColors[status];
};

export const getStatusLabel = (status: TodoStatus): string => {
  const labels: Record<TodoStatus, string> = {
    pending: 'In attesa',
    in_progress: 'In corso',
    completed: 'Completato',
  };
  return labels[status];
};

// Priority helpers
export const getPriorityColors = (priority: TodoPriority): { bg: string; text: string } => {
  const priorityColors: Record<TodoPriority, { bg: string; text: string }> = {
    low: { bg: colors.secondary[100], text: colors.secondary[700] },
    medium: { bg: colors.warning[100], text: colors.warning[700] },
    high: { bg: colors.danger[100], text: colors.danger[700] },
  };
  return priorityColors[priority];
};

export const getPriorityLabel = (priority: TodoPriority): string => {
  const labels: Record<TodoPriority, string> = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
  };
  return labels[priority];
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// String helpers
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const getInitials = (name: string | null): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Error handling
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Si è verificato un errore imprevisto';
};

// UUID validation
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Due date helpers
export const isDueSoon = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffInHours > 0 && diffInHours <= 24;
};

export const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  return due < new Date();
};
