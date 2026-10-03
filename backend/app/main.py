import bcrypt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from datetime import date as date_type, timedelta, datetime, timezone
import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.database import create_db_and_tables, get_session
from app.models import (
    User, Task, TaskCreate, TaskUpdate, 
    Habit, HabitCreate, HabitLog, LoginLog, 
    Goal, GoalCreate, GoalUpdate, Milestone, MilestoneCreate,
    Reminder, ReminderCreate, ReminderUpdate
)

app = FastAPI(title="DayForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
SECRET_KEY = "super-secret-key-for-local-app"
ALGORITHM = "HS256"

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Auth dependencies
def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not bcrypt.checkpw(form_data.password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}


# Helper for calculating streaks
def calculate_streaks(completed_dates: set[date_type]):
    if not completed_dates:
        return 0, 0
    
    sorted_dates = sorted(completed_dates)
    today = date_type.today()
    
    # Current streak calculation
    current_streak = 0
    check_date = today
    if check_date not in completed_dates:
        check_date = today - timedelta(days=1)
    
    while check_date in completed_dates:
        current_streak += 1
        check_date -= timedelta(days=1)
        
    # Longest streak calculation
    longest_streak = 0
    temp_streak = 0
    prev_date = None
    
    for d in sorted_dates:
        if prev_date is None or d == prev_date + timedelta(days=1):
            temp_streak += 1
        elif d > prev_date:
            temp_streak = 1
        prev_date = d
        if temp_streak > longest_streak:
            longest_streak = temp_streak
            
    return current_streak, longest_streak

# Tasks Endpoints
@app.get("/tasks", response_model=List[Task])
def get_tasks(date: date_type, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    tasks = session.exec(select(Task).where(Task.user_id == current_user.id).where(Task.date == date).order_by(Task.start_time)).all()
    return tasks

@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_task = Task.model_validate(task, update={"user_id": current_user.id})
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    
    # If created directly as completed and tied to a habit
    if db_task.completed and db_task.habit_id:
        habit_log = session.exec(
            select(HabitLog)
            .where(HabitLog.habit_id == db_task.habit_id)
            .where(HabitLog.user_id == current_user.id)
            .where(HabitLog.date == db_task.date)
        ).first()
        if not habit_log:
            habit_log = HabitLog(
                habit_id=db_task.habit_id,
                user_id=current_user.id,
                date=db_task.date,
                completed=True,
                source_task_id=db_task.id
            )
            session.add(habit_log)
            session.commit()
            
    return db_task

@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_update: TaskUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    if 'completed' in update_data:
        is_completed = update_data['completed']
        if is_completed and not db_task.completed:
            update_data['completed_at'] = datetime.now(timezone.utc)
        elif not is_completed:
            update_data['completed_at'] = None

    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    session.add(db_task)
    
    # Sync with HabitLog if habit_id exists
    if db_task.habit_id:
        habit_log = session.exec(
            select(HabitLog)
            .where(HabitLog.habit_id == db_task.habit_id)
            .where(HabitLog.user_id == current_user.id)
            .where(HabitLog.date == db_task.date)
        ).first()
        if db_task.completed:
            if not habit_log:
                habit_log = HabitLog(
                    habit_id=db_task.habit_id,
                    user_id=current_user.id,
                    date=db_task.date,
                    completed=True,
                    source_task_id=db_task.id
                )
                session.add(habit_log)
            else:
                habit_log.completed = True
                habit_log.source_task_id = db_task.id
                session.add(habit_log)
        else:
            if habit_log and (habit_log.source_task_id == db_task.id or habit_log.source_task_id is None):
                habit_log.completed = False
                session.add(habit_log)

    session.commit()
    session.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(db_task)
    session.commit()
    return {"ok": True}

@app.post("/tasks/copy")
def copy_yesterday_tasks(date: date_type, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    yesterday = date - timedelta(days=1)
    past_tasks = session.exec(
        select(Task)
        .where(Task.user_id == current_user.id)
        .where(Task.date == yesterday)
        .where(Task.completed == False)
    ).all()
    
    copied = 0
    for task in past_tasks:
        new_task = Task(
            title=task.title,
            date=date,
            start_time=task.start_time,
            end_time=task.end_time,
            category=task.category,
            priority=task.priority,
            notes=task.notes,
            alarm_enabled=task.alarm_enabled,
            alarm_offset_min=task.alarm_offset_min,
            habit_id=task.habit_id,
            goal_id=task.goal_id,
            user_id=current_user.id
        )
        session.add(new_task)
        copied += 1
        
    session.commit()
    return {"copied": copied}

# Stats & Login Ping Endpoints
@app.post("/stats/login-ping")
def login_ping(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    today = date_type.today()
    existing = session.exec(
        select(LoginLog)
        .where(LoginLog.user_id == current_user.id)
        .where(LoginLog.date == today)
    ).first()
    if not existing:
        log = LoginLog(user_id=current_user.id, date=today, timestamp=datetime.now(timezone.utc))
        session.add(log)
        session.commit()
        return {"status": "logged", "date": today.isoformat()}
    return {"status": "already_logged", "date": today.isoformat()}

# Habit Endpoints
@app.get("/habits", response_model=List[Habit])
def get_habits(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    habits = session.exec(select(Habit).where(Habit.user_id == current_user.id)).all()
    return habits

@app.post("/habits", response_model=Habit)
def create_habit(habit: HabitCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_habit = Habit.model_validate(habit, update={"user_id": current_user.id})
    session.add(db_habit)
    session.commit()
    session.refresh(db_habit)
    return db_habit

@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_habit = session.get(Habit, habit_id)
    if not db_habit or db_habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")
    session.delete(db_habit)
    session.commit()
    return {"ok": True}

@app.get("/habits/{habit_id}/stats")
def get_habit_stats(habit_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    logs = session.exec(
        select(HabitLog)
        .where(HabitLog.habit_id == habit_id)
        .where(HabitLog.completed == True)
    ).all()
    
    completed_dates = {log.date for log in logs}
    current_streak, longest_streak = calculate_streaks(completed_dates)
    
    today = date_type.today()
    thirty_days_ago = today - timedelta(days=29)
    completed_last_30 = sum(1 for d in completed_dates if thirty_days_ago <= d <= today)
    completion_rate_30 = round((completed_last_30 / 30) * 100)
    
    # 60 day Heatmap
    heatmap = []
    start_date = today - timedelta(days=59)
    curr = start_date
    while curr <= today:
        heatmap.append({
            "date": curr.isoformat(),
            "completed": curr in completed_dates
        })
        curr += timedelta(days=1)
        
    # Weekly data (last 7 days)
    weekly_data = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        weekly_data.append({
            "day": d.strftime("%a"),
            "date": d.isoformat(),
            "completed": 1 if d in completed_dates else 0
        })
        
    return {
        "habit_id": habit.id,
        "name": habit.name,
        "category": habit.category,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "completion_rate_30": completion_rate_30,
        "heatmap": heatmap,
        "weekly_data": weekly_data
    }

@app.get("/stats/overview")
def get_stats_overview(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Login stats
    login_logs = session.exec(
        select(LoginLog)
        .where(LoginLog.user_id == current_user.id)
    ).all()
    login_dates = {l.date for l in login_logs}
    current_login_streak, longest_login_streak = calculate_streaks(login_dates)
    
    today = date_type.today()
    login_heatmap = []
    curr = today - timedelta(days=59)
    while curr <= today:
        login_heatmap.append({
            "date": curr.isoformat(),
            "completed": curr in login_dates
        })
        curr += timedelta(days=1)
        
    # Habit stats summary
    habits = session.exec(
        select(Habit)
        .where(Habit.user_id == current_user.id)
    ).all()
    
    habit_summaries = []
    total_rate = 0
    for h in habits:
        h_logs = session.exec(
            select(HabitLog)
            .where(HabitLog.habit_id == h.id)
            .where(HabitLog.completed == True)
        ).all()
        h_dates = {l.date for l in h_logs}
        curr_streak, max_streak = calculate_streaks(h_dates)
        
        thirty_days_ago = today - timedelta(days=29)
        c30 = sum(1 for d in h_dates if thirty_days_ago <= d <= today)
        rate_30 = round((c30 / 30) * 100)
        total_rate += rate_30
        
        habit_summaries.append({
            "id": h.id,
            "name": h.name,
            "category": h.category,
            "target_days": h.target_days,
            "current_streak": curr_streak,
            "longest_streak": max_streak,
            "completion_rate_30": rate_30
        })
        
    avg_rate = round(total_rate / len(habits)) if habits else 0
    
    return {
        "login_current_streak": current_login_streak,
        "login_longest_streak": longest_login_streak,
        "login_heatmap": login_heatmap,
        "total_active_habits": len(habits),
        "avg_habit_completion_30": avg_rate,
        "habits": habit_summaries
    }

# Goals & Milestones Endpoints
@app.get("/goals")
def get_goals(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    goals = session.exec(
        select(Goal)
        .where(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
    ).all()
    
    result = []
    today = date_type.today()
    
    for g in goals:
        milestones = session.exec(
            select(Milestone)
            .where(Milestone.goal_id == g.id)
            .where(Milestone.user_id == current_user.id)
        ).all()
        
        linked_habits = session.exec(
            select(Habit)
            .where(Habit.goal_id == g.id)
            .where(Habit.user_id == current_user.id)
        ).all()
        
        completed_milestones = sum(1 for m in milestones if m.completed)
        total_milestones = len(milestones)
        progress_pct = round((completed_milestones / total_milestones) * 100) if total_milestones > 0 else (100 if g.completed else 0)
        
        days_total = max(1, (g.target_date - g.start_date).days)
        days_elapsed = max(0, min(days_total, (today - g.start_date).days))
        
        result.append({
            "id": g.id,
            "title": g.title,
            "description": g.description,
            "category": g.category,
            "start_date": g.start_date.isoformat(),
            "target_date": g.target_date.isoformat(),
            "completed": g.completed,
            "color": g.color,
            "milestones": milestones,
            "linked_habits": linked_habits,
            "progress_percentage": progress_pct,
            "days_total": days_total,
            "days_elapsed": days_elapsed
        })
        
    return result

@app.post("/goals", response_model=Goal)
def create_goal(goal: GoalCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_goal = Goal.model_validate(goal, update={"user_id": current_user.id})
    session.add(db_goal)
    session.commit()
    session.refresh(db_goal)
    return db_goal

@app.patch("/goals/{goal_id}", response_model=Goal)
def update_goal(goal_id: int, goal_update: GoalUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_goal = session.get(Goal, goal_id)
    if not db_goal or db_goal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    update_data = goal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
        
    session.add(db_goal)
    session.commit()
    session.refresh(db_goal)
    return db_goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_goal = session.get(Goal, goal_id)
    if not db_goal or db_goal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    milestones = session.exec(select(Milestone).where(Milestone.goal_id == goal_id)).all()
    for m in milestones:
        session.delete(m)
        
    session.delete(db_goal)
    session.commit()
    return {"ok": True}

@app.post("/goals/{goal_id}/milestones", response_model=Milestone)
def create_milestone(goal_id: int, milestone: MilestoneCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_goal = session.get(Goal, goal_id)
    if not db_goal or db_goal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    db_milestone = Milestone.model_validate(milestone, update={"user_id": current_user.id, "goal_id": goal_id})
    session.add(db_milestone)
    session.commit()
    session.refresh(db_milestone)
    return db_milestone

@app.patch("/milestones/{milestone_id}", response_model=Milestone)
def toggle_milestone(milestone_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_milestone = session.get(Milestone, milestone_id)
    if not db_milestone or db_milestone.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Milestone not found")
        
    db_milestone.completed = not db_milestone.completed
    session.add(db_milestone)
    session.commit()
    session.refresh(db_milestone)
    return db_milestone

@app.delete("/milestones/{milestone_id}")
def delete_milestone(milestone_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_milestone = session.get(Milestone, milestone_id)
    if not db_milestone or db_milestone.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Milestone not found")
        
    session.delete(db_milestone)
    session.commit()
    return {"ok": True}

# Reminders Endpoints
@app.get("/reminders", response_model=List[Reminder])
def get_reminders(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    reminders = session.exec(
        select(Reminder)
        .where(Reminder.user_id == current_user.id)
        .order_by(Reminder.due_date.asc(), Reminder.due_time.asc())
    ).all()
    return reminders

@app.post("/reminders", response_model=Reminder)
def create_reminder(reminder: ReminderCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_reminder = Reminder.model_validate(reminder, update={"user_id": current_user.id})
    session.add(db_reminder)
    session.commit()
    session.refresh(db_reminder)
    return db_reminder

@app.patch("/reminders/{reminder_id}", response_model=Reminder)
def update_reminder(reminder_id: int, reminder_update: ReminderUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_reminder = session.get(Reminder, reminder_id)
    if not db_reminder or db_reminder.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reminder not found")
        
    update_data = reminder_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reminder, key, value)
        
    session.add(db_reminder)
    session.commit()
    session.refresh(db_reminder)
    return db_reminder

@app.delete("/reminders/{reminder_id}")
def delete_reminder(reminder_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_reminder = session.get(Reminder, reminder_id)
    if not db_reminder or db_reminder.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reminder not found")
        
    session.delete(db_reminder)
    session.commit()
    return {"ok": True}

@app.post("/reminders/{reminder_id}/convert-to-task", response_model=Task)
def convert_reminder_to_task(reminder_id: int, target_date: date_type = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_reminder = session.get(Reminder, reminder_id)
    if not db_reminder or db_reminder.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reminder not found")
        
    task_date = target_date or db_reminder.due_date
    new_task = Task(
        title=db_reminder.title,
        date=task_date,
        start_time=db_reminder.due_time,
        category=db_reminder.category,
        priority=db_reminder.priority,
        notes=db_reminder.description,
        alarm_enabled=db_reminder.alarm_offset_min > 0,
        alarm_offset_min=db_reminder.alarm_offset_min,
        user_id=current_user.id
    )
    session.add(new_task)
    session.commit()
    session.refresh(new_task)
    return new_task

# Avatar Messages Endpoint
@app.get("/avatar/message")
def get_avatar_message(
    context: str = "greeting",
    task_title: str = None,
    streak: int = None,
    current_user: User = Depends(get_current_user)
):
    import random
    
    # Message bank by mood and context
    messages = {
        "greeting_morning": [
            ("idle", "Good morning Haripriya! Ready to forge an amazing day?"),
            ("cheering", "Rise and shine! Let's crush today's plan step by step."),
            ("idle", "Morning! Your consistency is building your future every single day.")
        ],
        "greeting_afternoon": [
            ("encouraging", "Good afternoon! Keep the momentum flowing Haripriya."),
            ("idle", "Halfway through the day! Take a breath and conquer the next task."),
            ("cheering", "Stay sharp! You're making steady progress today.")
        ],
        "greeting_evening": [
            ("idle", "Good evening! Perfect time to review today and plan tomorrow."),
            ("cheering", "Great effort today! Let's wrap up strong."),
            ("encouraging", "Evening time! Remember to celebrate what you accomplished today.")
        ],
        "greeting_night": [
            ("sleepy", "Getting late! Rest up well so you're energized for tomorrow."),
            ("sleepy", "Sleep is part of peak performance! Time to unwind soon."),
            ("encouraging", "Night Haripriya! Proud of your hard work today.")
        ],
        "task_complete": [
            ("cheering", f"Awesome job ticking off '{task_title or 'your task'}'!"),
            ("cheering", f"Boom! '{task_title or 'Task'}' complete. Keep it up!"),
            ("celebrating", f"One step closer to your goals! '{task_title or 'Task'}' smashed!")
        ],
        "all_completed": [
            ("celebrating", "WOOHOO! 100% tasks completed today! You're unstoppable!"),
            ("celebrating", "All clear for today! You absolute legend Haripriya!"),
            ("cheering", "Clean sweep! Perfect completion day for the record books!")
        ],
        "streak_milestone": [
            ("celebrating", f"INCREDIBLE! {streak or 'Multi'}-day streak unlocked! Keep burning! 🔥"),
            ("cheering", f"{streak or 'New'} days of relentless consistency! Pure dedication!"),
            ("celebrating", f"Streak alert! {streak or 'Huge'} days in a row! Absolutely inspiring!")
        ],
        "encouraging": [
            ("encouraging", "Remember: small daily actions yield massive results over time."),
            ("encouraging", "Every tick mark is a vote for the person you want to become!"),
            ("cheering", "Focus on the process, Haripriya. You've got this!")
        ]
    }
    
    if context == "task_complete":
        mood, msg = random.choice(messages["task_complete"])
    elif context == "all_completed":
        mood, msg = random.choice(messages["all_completed"])
    elif context == "streak_milestone":
        mood, msg = random.choice(messages["streak_milestone"])
    elif context == "encouraging":
        mood, msg = random.choice(messages["encouraging"])
    else:
        # Determine greeting context based on current time (Asia/Kolkata approx or system time)
        hour = datetime.now().hour
        if 5 <= hour < 12:
            mood, msg = random.choice(messages["greeting_morning"])
        elif 12 <= hour < 17:
            mood, msg = random.choice(messages["greeting_afternoon"])
        elif 17 <= hour < 22:
            mood, msg = random.choice(messages["greeting_evening"])
        else:
            mood, msg = random.choice(messages["greeting_night"])
            
    return {"mood": mood, "message": msg, "context": context}

# Data Export & Import Endpoints
@app.get("/data/export")
def export_user_data(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    tasks = session.exec(select(Task).where(Task.user_id == current_user.id)).all()
    habits = session.exec(select(Habit).where(Habit.user_id == current_user.id)).all()
    habit_logs = session.exec(select(HabitLog).where(HabitLog.user_id == current_user.id)).all()
    goals = session.exec(select(Goal).where(Goal.user_id == current_user.id)).all()
    milestones = session.exec(select(Milestone).where(Milestone.user_id == current_user.id)).all()
    reminders = session.exec(select(Reminder).where(Reminder.user_id == current_user.id)).all()
    
    return {
        "version": "1.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "username": current_user.username,
        "tasks": [t.model_dump(mode="json") for t in tasks],
        "habits": [h.model_dump(mode="json") for h in habits],
        "habit_logs": [hl.model_dump(mode="json") for hl in habit_logs],
        "goals": [g.model_dump(mode="json") for g in goals],
        "milestones": [m.model_dump(mode="json") for m in milestones],
        "reminders": [r.model_dump(mode="json") for r in reminders]
    }

@app.post("/data/import")
def import_user_data(data: dict, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if not isinstance(data, dict) or "tasks" not in data:
        raise HTTPException(status_code=400, detail="Invalid import data structure")
        
    # Clear existing user items safely
    for model in [Task, HabitLog, Habit, Milestone, Goal, Reminder]:
        items = session.exec(select(model).where(model.user_id == current_user.id)).all()
        for item in items:
            session.delete(item)
    session.commit()
    
    # Import Goals
    for g_dict in data.get("goals", []):
        g_dict.pop("id", None)
        g_dict["user_id"] = current_user.id
        session.add(Goal.model_validate(g_dict))
    session.commit()
    
    # Import Habits
    for h_dict in data.get("habits", []):
        h_dict.pop("id", None)
        h_dict["user_id"] = current_user.id
        session.add(Habit.model_validate(h_dict))
    session.commit()
    
    # Import Tasks
    for t_dict in data.get("tasks", []):
        t_dict.pop("id", None)
        t_dict["user_id"] = current_user.id
        session.add(Task.model_validate(t_dict))
        
    # Import Reminders
    for r_dict in data.get("reminders", []):
        r_dict.pop("id", None)
        r_dict["user_id"] = current_user.id
        session.add(Reminder.model_validate(r_dict))
        
    session.commit()
    return {"status": "imported_successfully"}





