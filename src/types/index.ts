// =====================================================
// TYPE DEFINITIONS
// =====================================================

export type UserRole = 'user' | 'admin';
export type TodoStatus = 'pending' | 'in_progress' | 'completed';
export type TodoPriority = 'low' | 'medium' | 'high';

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  image_url: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// API Types
export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  due_date?: string;
  image_url?: string;
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string | null;
  image_url?: string | null;
}

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
}

// Auth Types
export interface SignUpCredentials {
  email: string;
  password: string;
  full_name?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

// Query Filters
export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  search?: string;
}

// Navigation Types
export type RootStackParamList = {
  '(auth)': undefined;
  '(app)': undefined;
  '(admin)': undefined;
};

// API Response Types
export interface ApiError {
  message: string;
  code?: string;
}

// Image Picker Types
export interface ImagePickerResult {
  uri: string;
  base64?: string;
  type?: string;
  fileName?: string;
}
