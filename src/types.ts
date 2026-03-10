export type UserRole = 'user' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  category?: string;
  notes?: string;
  dayOfWeek?: string;
  baseTaskId?: string;
}

export interface BaseTask {
  id: string;
  title: string;
  description?: string; // Mapeado para 'observacao' no Supabase
  icon?: string;
  color?: string; // Pode ser usado para estilização futura
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'success';
}
