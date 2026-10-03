import { useState, useEffect, useCallback } from 'react';
import { computeAvatarState, type AvatarMood, type AvatarState } from '@/lib/avatarMood';
import { getTasks, getStatsOverview, getReminders, getGoals, type Task, type StatsOverview, type Goal } from '@/lib/api';

export function useAvatarTrigger() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [justCompletedTask, setJustCompletedTask] = useState(false);
  const [forcedMood, setForcedMood] = useState<AvatarMood | null>(null);

  const [avatarState, setAvatarState] = useState<AvatarState>({
    mood: 'idle',
    message: 'Ready to forge today’s plan, Haripriya?'
  });

  const loadLiveData = useCallback(async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [tData, sData, , gData] = await Promise.all([
        getTasks(todayStr),
        getStatsOverview(),
        getReminders(),
        getGoals()
      ]);
      setTasks(tData);
      setStats(sData);
      setGoals(gData);
    } catch (err) {
      console.warn('Failed to load avatar live data:', err);
    }
  }, []);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  // Re-compute Avatar state whenever tasks, stats, justCompletedTask, or forcedMood changes
  useEffect(() => {
    const mainGoal = goals.find((g) => !g.completed)?.title;
    const computed = computeAvatarState(
      tasks,
      stats,
      [], // Missed alarms
      justCompletedTask,
      forcedMood,
      'Haripriya',
      mainGoal
    );
    setAvatarState(computed);
  }, [tasks, stats, justCompletedTask, forcedMood, goals]);

  const triggerTaskComplete = (_taskTitle?: string) => {
    setJustCompletedTask(true);
    setTimeout(() => {
      setJustCompletedTask(false);
    }, 4000);
  };

  const triggerAllCompleted = () => {
    setJustCompletedTask(true);
    setTimeout(() => {
      setJustCompletedTask(false);
    }, 4000);
  };

  const refreshAvatarMessage = () => {
    const mainGoal = goals.find((g) => !g.completed)?.title;
    const computed = computeAvatarState(
      tasks,
      stats,
      [],
      justCompletedTask,
      forcedMood,
      'Haripriya',
      mainGoal
    );
    setAvatarState(computed);
  };

  return {
    mood: avatarState.mood,
    message: avatarState.message,
    quickActionLabel: avatarState.quickActionLabel,
    quickActionPath: avatarState.quickActionPath,
    forcedMood,
    setForcedMood,
    triggerTaskComplete,
    triggerAllCompleted,
    refreshAvatarMessage,
    reloadLiveData: loadLiveData
  };
}


