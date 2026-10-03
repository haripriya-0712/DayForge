const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Habit {
  id: number;
  name: string;
  category: string;
  frequency_type: string;
  target_days: number;
  start_date: string;
  active: boolean;
  goal_id?: number;
}

export interface HabitStats {
  habit_id: number;
  name: string;
  category: string;
  current_streak: number;
  longest_streak: number;
  completion_rate_30: number;
  heatmap: { date: string; completed: boolean }[];
  weekly_data: { day: string; date: string; completed: number }[];
}

export interface StatsOverview {
  login_current_streak: number;
  login_longest_streak: number;
  login_heatmap: { date: string; completed: boolean }[];
  total_active_habits: number;
  avg_habit_completion_30: number;
  habits: {
    id: number;
    name: string;
    category: string;
    target_days: number;
    current_streak: number;
    longest_streak: number;
    completion_rate_30: number;
  }[];
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

export async function loginPing() {
  try {
    return await fetchWithAuth('/stats/login-ping', { method: 'POST' });
  } catch (err) {
    console.error('Login ping failed:', err);
  }
}

export async function login() {
  try {
    const formData = new URLSearchParams();
    formData.append('username', 'haripriya');
    formData.append('password', 'password');

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      await loginPing();
      return true;
    }
  } catch (err) {
    console.warn('Auto-login failed or backend unreachable:', err);
  }
  return false;
}

export async function getHabits(): Promise<Habit[]> {
  return fetchWithAuth('/habits');
}

export async function createHabit(habitData: Partial<Habit>): Promise<Habit> {
  return fetchWithAuth('/habits', {
    method: 'POST',
    body: JSON.stringify(habitData)
  });
}

export async function deleteHabit(habitId: number) {
  return fetchWithAuth(`/habits/${habitId}`, { method: 'DELETE' });
}

export async function getHabitStats(habitId: number): Promise<HabitStats> {
  return fetchWithAuth(`/habits/${habitId}/stats`);
}

export async function getStatsOverview(): Promise<StatsOverview> {
  return fetchWithAuth('/stats/overview');
}

export interface Milestone {
  id: number;
  title: string;
  goal_id: number;
  due_date?: string;
  completed: boolean;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  start_date: string;
  target_date: string;
  completed: boolean;
  color?: string;
  milestones: Milestone[];
  linked_habits: Habit[];
  progress_percentage: number;
  days_total: number;
  days_elapsed: number;
}

export async function getGoals(): Promise<Goal[]> {
  return fetchWithAuth('/goals');
}

export async function createGoal(goalData: {
  title: string;
  description?: string;
  category?: string;
  start_date: string;
  target_date: string;
  color?: string;
}): Promise<Goal> {
  return fetchWithAuth('/goals', {
    method: 'POST',
    body: JSON.stringify(goalData)
  });
}

export async function updateGoal(goalId: number, goalData: Partial<Goal>): Promise<Goal> {
  return fetchWithAuth(`/goals/${goalId}`, {
    method: 'PATCH',
    body: JSON.stringify(goalData)
  });
}

export async function deleteGoal(goalId: number) {
  return fetchWithAuth(`/goals/${goalId}`, { method: 'DELETE' });
}

export async function addMilestone(goalId: number, milestoneData: { title: string; due_date?: string }): Promise<Milestone> {
  return fetchWithAuth(`/goals/${goalId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(milestoneData)
  });
}

export async function toggleMilestone(milestoneId: number): Promise<Milestone> {
  return fetchWithAuth(`/milestones/${milestoneId}`, { method: 'PATCH' });
}

export async function deleteMilestone(milestoneId: number) {
  return fetchWithAuth(`/milestones/${milestoneId}`, { method: 'DELETE' });
}

export interface Task {
  id: number;
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
  category: string;
  priority: number;
  notes?: string;
  alarm_enabled: boolean;
  alarm_offset_min: number;
  recurrence_rule?: string;
  habit_id?: number;
  goal_id?: number;
  completed: boolean;
  completed_at?: string;
}

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  category: string;
  priority: number;
  completed: boolean;
  alarm_offset_min: number;
}

export interface AvatarResponse {
  mood: 'idle' | 'cheering' | 'celebrating' | 'encouraging' | 'sleepy';
  message: string;
  context: string;
}

export async function getTasks(dateStr: string): Promise<Task[]> {
  return fetchWithAuth(`/tasks?date=${dateStr}`);
}

export async function updateTask(taskId: number, updates: Partial<Task>): Promise<Task> {
  return fetchWithAuth(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function getReminders(): Promise<Reminder[]> {
  return fetchWithAuth('/reminders');
}

export async function getAvatarMessage(context: string = 'greeting', taskTitle?: string, streak?: number): Promise<AvatarResponse> {
  const params = new URLSearchParams({ context });
  if (taskTitle) params.append('task_title', taskTitle);
  if (streak !== undefined) params.append('streak', streak.toString());
  return fetchWithAuth(`/avatar/message?${params.toString()}`);
}

export async function exportUserData(): Promise<any> {
  return fetchWithAuth('/data/export');
}

export async function importUserData(data: any): Promise<any> {
  return fetchWithAuth('/data/import', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}




