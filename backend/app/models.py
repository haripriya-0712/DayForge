from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import date, time, datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str

class TaskBase(SQLModel):
    title: str
    date: date
    start_time: Optional[str] = None # e.g. "09:00"
    end_time: Optional[str] = None
    category: str = "Other"
    priority: int = 0
    notes: Optional[str] = None
    alarm_enabled: bool = False
    alarm_offset_min: int = 0
    recurrence_rule: Optional[str] = None
    habit_id: Optional[int] = None
    goal_id: Optional[int] = None
    completed: bool = False
    completed_at: Optional[datetime] = None

class HabitBase(SQLModel):
    name: str
    category: str = "Other"
    frequency_type: str = "daily"
    target_days: int = 7
    start_date: date
    goal_id: Optional[int] = None
    active: bool = True

class Habit(HabitBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)

class HabitCreate(HabitBase):
    pass

class GoalBase(SQLModel):
    title: str
    description: Optional[str] = None
    category: str = "General"
    start_date: date
    target_date: date
    completed: bool = False
    color: Optional[str] = None

class Goal(GoalBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)

class GoalCreate(GoalBase):
    pass

class GoalUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[date] = None
    completed: Optional[bool] = None
    color: Optional[str] = None

class MilestoneBase(SQLModel):
    title: str
    goal_id: int = Field(foreign_key="goal.id")
    due_date: Optional[date] = None
    completed: bool = False

class Milestone(MilestoneBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)

class MilestoneCreate(MilestoneBase):
    pass

class HabitLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habit.id")
    user_id: int = Field(foreign_key="user.id")
    date: date
    completed: bool = False
    source_task_id: Optional[int] = None

class LoginLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    timestamp: datetime = Field(default_factory=utc_now)
    date: date

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)


class TaskCreate(TaskBase):
    pass

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[int] = None
    notes: Optional[str] = None
    alarm_enabled: Optional[bool] = None
    alarm_offset_min: Optional[int] = None
    recurrence_rule: Optional[str] = None
    habit_id: Optional[int] = None
    goal_id: Optional[int] = None
    completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

class ReminderBase(SQLModel):
    title: str
    description: Optional[str] = None
    due_date: date
    due_time: Optional[str] = None
    category: str = "General"
    priority: int = 0
    completed: bool = False
    alarm_offset_min: int = 0

class Reminder(ReminderBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=utc_now)

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[int] = None
    completed: Optional[bool] = None
    alarm_offset_min: Optional[int] = None

