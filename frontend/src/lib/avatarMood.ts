import type { Task, StatsOverview } from './api';

export type AvatarMood =
  | 'idle'
  | 'cheering'
  | 'celebrating'
  | 'encouraging'
  | 'worried'
  | 'sleeping'
  | 'sleepy'
  | 'comeback';

export interface AvatarState {
  mood: AvatarMood;
  message: string;
  quickActionLabel?: string;
  quickActionPath?: string;
}

// 15+ messages per mood referencing real data, warm, non-guilt-tripping
const MOOD_MESSAGES: Record<AvatarMood, (data: AvatarContextData) => string[]> = {
  celebrating: (data) => [
    `WOOHOO! Task "${data.latestTaskTitle || 'Focus Sprint'}" smashed! You're on fire today! 🔥`,
    `100% Day Completed! Unstoppable momentum, ${data.userName}! 🎉`,
    `Dance party time! Another win checked off your timetable! 🕺✨`,
    `Streak locked in! ${data.streakCount} days of pure consistency! 🔥`,
    `Look at that progress bar fill up! Outstanding work, ${data.userName}! 🌟`,
    `Crushed it! You're making tough tasks look effortless today! ⚡`,
    `Target hit! Keep that victory feeling glowing! 🏆`,
    `Superb focus! That's another key task done and dusted! ✨`,
    `Victory lap! ${data.completedTasksCount} of ${data.totalTasksCount} tasks completed! 🥳`,
    `Boom! High five, ${data.userName}! You're unstoppable today! 🙌`,
    `Goal milestone step unlocked! Excellent dedication! 🎯`,
    `Another priority task cleared! Enjoy that sweet accomplishment! 🌟`,
    `Consistency champion! ${data.streakCount} day streak going strong! ⚡`,
    `Task conquered! Taking care of business like a pro! 💼✨`,
    `Fantastic rhythm today! You're in peak focus mode! 🚀`
  ],

  cheering: (data) => [
    `Over 50% done today! Keep that fantastic rhythm going, ${data.userName}! 💪`,
    `More than half of your timetable crushed! You've got this! 🌟`,
    `You're in the groove! ${data.completedTasksCount} tasks down, just a few to go! ⚡`,
    `Halfway point passed! Finishing today strong! 🔥`,
    `Great pace today! ${data.remainingTasksCount} tasks left on your list! ✨`,
    `Momentum is high! You're making steady progress toward your goals! 🎯`,
    `Awesome effort! The finish line for today is in sight! 🏆`,
    `Keep shining, ${data.userName}! You're well past the halfway mark! 🌟`,
    `Steady and focused! You're tackling today like a master planner! ⏱️`,
    `Fantastic consistency! Your habit streak is loving this effort! 🔥`,
    `High energy today! Let's lock in the next focus task! 🚀`,
    `You're building serious daily momentum! Beautiful work! ✨`,
    `Halfway victory! Keep stepping forward, one task at a time! 👣`,
    `Your focus is inspiring today! Let's complete the next block! 💪`,
    `Crushing the afternoon timetable! Keep it up, ${data.userName}! 🌟`
  ],

  idle: (data) => [
    `Ready to forge today's plan, ${data.userName}? I'm here cheering you on! ✨`,
    `One small task at a time builds massive long-term success! 🎯`,
    `Your current login streak is ${data.streakCount} days strong! Keep it going! 🔥`,
    `What's next on your timetable? Let's check off the next focus task! ⏱️`,
    `Consistency is your superpower, ${data.userName}! ✨`,
    `Focus on the process and the progress will follow naturally! 🌟`,
    `Checking in! You have ${data.remainingTasksCount || 'some'} tasks scheduled for today. 🚀`,
    `Small steps every day lead to big goal achievements! 🏆`,
    `Standing by for your next focus win, ${data.userName}! 💪`,
    `Remember your main goal: "${data.mainGoalTitle || 'Keep grinding'}"! You're getting closer! 🎯`,
    `A clear timetable brings peace of mind. Let's execute! ⚡`,
    `Hope you're having a productive day, ${data.userName}! ✨`,
    `Ready when you are! Tap any task to check it off when completed! ✔️`,
    `Your daily habit streak is looking great! 🔥`,
    `Every completed task is a step toward your future self! 🌟`
  ],

  encouraging: (data) => [
    `Late afternoon push, ${data.userName}! Let's knock out one more task! 🌅`,
    `Evening approaches! A quick 20-minute focus session will feel amazing! ⚡`,
    `You still have time to finish today's key tasks strong! 💪`,
    `Don't worry about perfection — just tick off one task right now! ✨`,
    `The best time to start is right now! Let's tackle "${data.nextTaskTitle || 'next task'}"! ⏱️`,
    `Sun's setting soon! Let's get that satisfying checkmark before dinner! 🌇`,
    `You've got this, ${data.userName}! Finish strong and enjoy your evening! 🌟`,
    `One task done now means relaxing guilt-free tonight! ☕`,
    `Stand up, stretch, take a breath, and let's tackle the next block! 🧘`,
    `Push through the final stretch of the day! I'm right here with you! 🚀`,
    `Your future self will thank you for finishing this task tonight! 🏆`,
    `Keep your eyes on the goal: "${data.mainGoalTitle || 'Success'}"! 🎯`,
    `Almost there! A short burst of focus will wrap up today! ⚡`,
    `Evening energy boost! Let's complete "${data.nextTaskTitle || 'your task'}"! 🔥`,
    `Finish the day with pride, ${data.userName}! You can do it! 💪`
  ],

  worried: (data) => [
    `Oh no! Looks like an alarm was missed for "${data.latestTaskTitle || 'a task'}"! ⏰`,
    `Missed a scheduled task? No stress at all — let's reschedule or complete it now! 🔄`,
    `Don't worry about the past hour! Let's pick up momentum right now, ${data.userName}! 💪`,
    `Alarm went off! Tap the task to mark it done or move to a better time slot! ⏱️`,
    `Oops, time slipped by! Shall we catch up on "${data.nextTaskTitle || 'your task'}"? ✨`,
    `Missed beats happen! The secret is getting back on track without guilt! 🌟`,
    `Let's handle that pending alarm together! One quick tick fixes it! ✔️`,
    `No guilt, only fresh starts! Let's reset your timetable for tonight! 🌙`,
    `Pending alarm detected! Tap here to review your missed tasks! 🔔`,
    `Time for a gentle reset! Let's turn that missed alarm into a completed task! 🚀`,
    `Missed a deadline? Adjust the time and keep moving forward! 🔄`,
    `I'm looking out for you! Let's handle your missed alarm now! ⏰`,
    `Reset and refocus! You can check off "${data.nextTaskTitle || 'task'}" in 5 minutes! ⚡`,
    `Hey ${data.userName}, let's clear those alarm alerts so you feel clear-headed! 🧠`,
    `Quick fix: tick the task or adjust its start time! Easy peasy! ✨`
  ],

  sleeping: (data) => [
    `Wake me up by finishing one small task 😴`,
    `Taking a cozy catnap until your next focus session 💤`,
    `Sleeping on the job... tap me when you start your next task! 😴`,
    `Zzz... Resting until you check off your first task today... 💤`,
    `Quiet morning! Ready to wake up together and plan the day? 😴✨`,
    `Zzz... No active tasks running right now. Tap to wake me up! 💤`,
    `Recharging my batteries until your next productivity sprint! 🔌😴`,
    `Dozing off... Wake me up with a task checkmark! 😴✔️`,
    `Zzz... Dreams of completed tasks and broken streak records! 💤🏆`,
    `Sleeping deeply... Tap me for a quick stretch and giggle! 😴`,
    `Zzz... Waiting for ${data.userName} to start the first focus block! 💤`,
    `A quiet day so far! Whenever you're ready, let's begin! 😴✨`,
    `Zzz... Resting eyes... Wake me when you're ready to forge! 💤`,
    `Peaceful catnap mode activated 😴`,
    `Zzz... Tap the mascot to wake up and get an instant quote! 💤`
  ],

  sleepy: (data) => [
    `It's past 10 PM! Time to unwind and plan tomorrow while it's fresh 🌙`,
    `Rest is productive too, ${data.userName}! Let's lock in tomorrow's plan before bed 🛌`,
    `Late night! Great job today. Let's do a 2-minute plan for tomorrow 🌌`,
    `Yawn... Your brain worked hard today! Time to sleep well and recharge 😴`,
    `The night is fresh! Set up tomorrow's timetable so you wake up calm 🌙`,
    `Past 10 PM! Put away the heavy work and enjoy a quiet night, ${data.userName}! ☕`,
    `Bedtime reminder: Tomorrow is a fresh canvas waiting for you! 🎨`,
    `Great effort today! Plan tomorrow now so you can sleep like a log 🛌`,
    `Dimming the lights... You did wonderful today! 🌙✨`,
    `Rest up, hero! Tomorrow we conquer new goal milestones together! 🏆`,
    `Late hours! Don't forget to get good rest, ${data.userName}! 😴`,
    `Tomorrow fresh plan shortcut is ready! Lock it in before sleep 🌙`,
    `Night owl mode! Remember to give yourself credit for today's effort! 🌟`,
    `Sleep tight, ${data.userName}! Tomorrow brings fresh opportunities! 🌌`,
    `Winding down... See you bright and early tomorrow morning! 🌅`
  ],

  comeback: (data) => [
    `WELCOME BACK, ${data.userName}! Fresh start today, let's build a brand new streak! 👋✨`,
    `So glad you're back! No looking back — today is a beautiful new day! 🌟`,
    `Welcome back! Missed days don't matter; today's effort is what counts! 💪`,
    `Hey ${data.userName}! Excited to forge goals together with you again! 🚀`,
    `Fresh start energy! Let's pick a small 10-minute task to get momentum back! ⚡`,
    `Welcome back, hero! Let's turn the page and start a strong habit streak! 🔥`,
    `So happy to see you! Tap quick-add to schedule today's priority task! ✨`,
    `No guilt, only warm welcomes! Let's crush today's plan together! 🙌`,
    `You're back! Every comeback is stronger than the setback! 🏆`,
    `Welcome home to DayForge! Let's make today count, ${data.userName}! 🌟`,
    `Fresh day, fresh focus! I'm right here cheering for your comeback! 🎉`,
    `Great to see you! Let's lock in one focus task right now! ⏱️`,
    `Welcome back! Let's turn your daily habit streak back on! 🔥`,
    `New day, new victories! Let's check off your first task! ✔️`,
    `Glad you're here! Let's forge an awesome plan for today! 🚀`
  ]
};

export interface AvatarContextData {
  userName: string;
  totalTasksCount: number;
  completedTasksCount: number;
  remainingTasksCount: number;
  completedPct: number;
  streakCount: number;
  latestTaskTitle?: string;
  nextTaskTitle?: string;
  mainGoalTitle?: string;
  missedAlarmCount: number;
  isAfter10PM: boolean;
  isLateAfternoon: boolean;
}

export function computeAvatarState(
  tasks: Task[],
  stats: StatsOverview | null,
  missedAlarms: Task[] = [],
  justCompletedTask: boolean = false,
  forcedMood: AvatarMood | null = null,
  userName: string = 'Haripriya',
  mainGoalTitle?: string
): AvatarState {
  // If forced mood from Dev Panel exists, use it!
  if (forcedMood) {
    const dummyData: AvatarContextData = {
      userName,
      totalTasksCount: tasks.length || 5,
      completedTasksCount: tasks.filter((t) => t.completed).length || 3,
      remainingTasksCount: tasks.filter((t) => !t.completed).length || 2,
      completedPct: tasks.length ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 60,
      streakCount: stats?.login_current_streak || 5,
      latestTaskTitle: tasks[0]?.title || 'DSA Practice',
      nextTaskTitle: tasks.find((t) => !t.completed)?.title || 'Project Sprint',
      mainGoalTitle: mainGoalTitle || 'Career Goal',
      missedAlarmCount: missedAlarms.length,
      isAfter10PM: false,
      isLateAfternoon: false
    };
    const messages = MOOD_MESSAGES[forcedMood](dummyData);
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return {
      mood: forcedMood,
      message: `[DEV PREVIEW: ${forcedMood.toUpperCase()}] ${msg}`,
      quickActionLabel: forcedMood === 'sleepy' ? 'Plan Tomorrow' : 'Start Next Task',
      quickActionPath: forcedMood === 'sleepy' ? '/planner' : '/planner'
    };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const isAfter10PM = currentHour >= 22 || currentHour < 5;
  const isLateAfternoon = currentHour >= 15 && currentHour < 22;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const completedPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const streak = stats?.login_current_streak || 1;
  const nextTask = tasks.find((t) => !t.completed);
  const latestTask = tasks[tasks.length - 1];

  const contextData: AvatarContextData = {
    userName,
    totalTasksCount: totalTasks,
    completedTasksCount: completedTasks,
    remainingTasksCount: remainingTasks,
    completedPct,
    streakCount: streak,
    latestTaskTitle: latestTask?.title,
    nextTaskTitle: nextTask?.title,
    mainGoalTitle,
    missedAlarmCount: missedAlarms.length,
    isAfter10PM,
    isLateAfternoon
  };

  let mood: AvatarMood = 'idle';
  let quickActionLabel: string | undefined = undefined;
  let quickActionPath: string | undefined = undefined;

  // 1. Celebrating (Just completed task, 100% completed day, or streak milestone)
  if (justCompletedTask || (totalTasks > 0 && completedPct === 100)) {
    mood = 'celebrating';
    quickActionLabel = 'View Consistency Stats';
    quickActionPath = '/stats';
  }
  // 2. Worried (Missed alarm)
  else if (missedAlarms.length > 0) {
    mood = 'worried';
    quickActionLabel = 'Review Missed Alarms';
    quickActionPath = '/planner';
  }
  // 3. Sleepy (Late night after 10 PM)
  else if (isAfter10PM) {
    mood = 'sleepy';
    quickActionLabel = 'Plan Tomorrow ✨';
    quickActionPath = '/planner';
  }
  // 4. Cheering (Day in progress & >= 50% completed)
  else if (completedPct >= 50 && totalTasks > 0) {
    mood = 'cheering';
    quickActionLabel = nextTask ? `Complete "${nextTask.title}"` : 'View Planner';
    quickActionPath = '/planner';
  }
  // 5. Encouraging (Late afternoon/evening & pending tasks)
  else if (isLateAfternoon && remainingTasks > 0) {
    mood = 'encouraging';
    quickActionLabel = nextTask ? `Start "${nextTask.title}"` : 'Add Task';
    quickActionPath = '/planner';
  }
  // 6. Sleeping (No tasks completed or nothing planned today)
  else if (totalTasks === 0 || completedTasks === 0) {
    mood = 'sleeping';
    quickActionLabel = totalTasks === 0 ? 'Add First Task' : nextTask ? `Start "${nextTask.title}"` : 'Open Planner';
    quickActionPath = '/planner';
  }
  // 7. Idle (Default active state)
  else {
    mood = 'idle';
    quickActionLabel = nextTask ? `Next: ${nextTask.title}` : 'Open Planner';
    quickActionPath = '/planner';
  }

  const messages = MOOD_MESSAGES[mood](contextData);
  // Select message deterministically based on date/task length or random index
  const msgIndex = (completedTasks + streak + currentHour) % messages.length;
  const message = messages[msgIndex];

  return {
    mood,
    message,
    quickActionLabel,
    quickActionPath
  };
}
