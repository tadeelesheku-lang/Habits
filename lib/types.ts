export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  notes: string | null;
  priority: Priority;
  done: boolean;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Habit {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface HabitWithChecks extends Habit {
  checks: string[]; // ISO date strings (YYYY-MM-DD)
}

export interface Note {
  id: number;
  body: string;
  updated_at: string;
}

export interface Stats {
  tasksTotal: number;
  tasksDone: number;
  tasksOpen: number;
  habitsTotal: number;
  checksToday: number;
}
