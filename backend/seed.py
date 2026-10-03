import os
import random
import bcrypt
from sqlmodel import Session, select
from datetime import date, timedelta

from app.database import engine, create_db_and_tables
from app.models import User, Task, Habit, HabitLog, LoginLog, Goal, Milestone, Reminder

def seed():
    print("Creating tables...")
    create_db_and_tables()
    
    with Session(engine) as session:
        # Create user
        user = session.exec(select(User).where(User.username == "haripriya")).first()
        if not user:
            hashed = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode("utf-8")
            user = User(username="haripriya", hashed_password=hashed)
            session.add(user)
            session.commit()
            session.refresh(user)
            print("User 'haripriya' created (password: 'password')")

        today = date.today()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        # Clear existing data
        for model in [Task, HabitLog, Habit, LoginLog, Milestone, Goal, Reminder]:
            items = session.exec(select(model)).all()
            for item in items:
                session.delete(item)
        session.commit()

        # Seed Goals
        g1 = Goal(
            title="Get placed in a top tech company",
            description="Financial independence & career start",
            category="Career",
            start_date=today - timedelta(days=45),
            target_date=today + timedelta(days=135),
            color="#6C5CE7",
            user_id=user.id
        )
        g2 = Goal(
            title="Run a Half Marathon",
            description="Build physical endurance and stamina",
            category="Health",
            start_date=today - timedelta(days=30),
            target_date=today + timedelta(days=60),
            color="#2FBF8F",
            user_id=user.id
        )
        session.add_all([g1, g2])
        session.commit()
        session.refresh(g1)
        session.refresh(g2)

        # Seed Milestones
        m1 = Milestone(title="Solve 150 LeetCode Problems", goal_id=g1.id, completed=True, user_id=user.id)
        m2 = Milestone(title="Build 2 Fullstack Portfolio Apps", goal_id=g1.id, completed=True, user_id=user.id)
        m3 = Milestone(title="Complete 5 Mock Interviews", goal_id=g1.id, completed=False, user_id=user.id)
        m4 = Milestone(title="Apply to 50 Target Companies", goal_id=g1.id, completed=False, user_id=user.id)

        m5 = Milestone(title="Run 5K without stopping", goal_id=g2.id, completed=True, user_id=user.id)
        m6 = Milestone(title="Complete 10K continuous run", goal_id=g2.id, completed=False, user_id=user.id)
        m7 = Milestone(title="Pace 15K at under 6 min/km", goal_id=g2.id, completed=False, user_id=user.id)

        session.add_all([m1, m2, m3, m4, m5, m6, m7])
        session.commit()

        # Seed Habits linked to Goals
        h1 = Habit(name="Morning Workout", category="Health", frequency_type="daily", target_days=7, start_date=today - timedelta(days=60), goal_id=g2.id, user_id=user.id)
        h2 = Habit(name="Solve 2 LeetCode Mediums", category="DSA", frequency_type="daily", target_days=5, start_date=today - timedelta(days=60), goal_id=g1.id, user_id=user.id)
        h3 = Habit(name="Read 20 Pages", category="Study", frequency_type="daily", target_days=7, start_date=today - timedelta(days=60), goal_id=g1.id, user_id=user.id)
        
        session.add_all([h1, h2, h3])
        session.commit()
        session.refresh(h1)
        session.refresh(h2)
        session.refresh(h3)

        # Seed 60-day LoginLogs & HabitLogs
        login_logs = []
        habit_logs = []

        for i in range(59, -1, -1):
            d = today - timedelta(days=i)
            # Login logs (continuous streak for last 14 days, random before)
            if i <= 14 or (i % 7 != 0 and i % 5 != 0):
                login_logs.append(LoginLog(user_id=user.id, date=d))

            # Habit 1: Workout (continuous streak for last 8 days)
            if i <= 8 or (i % 3 != 0):
                habit_logs.append(HabitLog(habit_id=h1.id, user_id=user.id, date=d, completed=True))

            # Habit 2: LeetCode (continuous streak for last 5 days)
            if i <= 5 or (i % 4 != 1):
                habit_logs.append(HabitLog(habit_id=h2.id, user_id=user.id, date=d, completed=True))

            # Habit 3: Reading (continuous streak for last 12 days)
            if i <= 12 or (i % 6 != 2):
                habit_logs.append(HabitLog(habit_id=h3.id, user_id=user.id, date=d, completed=True))

        session.add_all(login_logs)
        session.add_all(habit_logs)
        session.commit()

        # Sample Tasks linked to Habits
        sample_tasks = [
            # Yesterday
            Task(title="Morning Run", date=yesterday, start_time="07:00", end_time="08:00", category="Health", completed=True, habit_id=h1.id, user_id=user.id),
            Task(title="Review System Design", date=yesterday, start_time="14:00", end_time="15:30", category="Study", completed=True, habit_id=h3.id, user_id=user.id),
            Task(title="Unfinished Side Project", date=yesterday, start_time="18:00", end_time="19:00", category="Project", completed=False, user_id=user.id),
            
            # Today
            Task(title="Morning Yoga", date=today, start_time="07:30", end_time="08:00", category="Health", completed=True, habit_id=h1.id, user_id=user.id),
            Task(title="React Dashboard UI", date=today, start_time="09:00", end_time="12:00", category="Project", completed=False, user_id=user.id),
            Task(title="Solve 2 LeetCode Mediums", date=today, start_time="19:00", end_time="21:00", category="DSA", completed=False, habit_id=h2.id, user_id=user.id),
            
            # Tomorrow
            Task(title="DSA Contest", date=tomorrow, start_time="08:00", end_time="10:00", category="DSA", completed=False, habit_id=h2.id, user_id=user.id),
        ]

        session.add_all(sample_tasks)
        session.commit()

        # Sample Reminders
        reminders = [
            Reminder(
                title="Amazon OA Prep",
                description="Solve top 10 tagged Amazon questions on LeetCode",
                due_date=tomorrow,
                due_time="10:00",
                category="DSA",
                priority=2,
                alarm_offset_min=30,
                user_id=user.id
            ),
            Reminder(
                title="Submit Monthly Expense Report",
                description="Upload receipts and claim reimbursements",
                due_date=today + timedelta(days=3),
                due_time="15:00",
                category="Work",
                priority=1,
                alarm_offset_min=15,
                user_id=user.id
            ),
            Reminder(
                title="Car Maintenance Service",
                description="Scheduled servicing at Hyundai Center",
                due_date=today + timedelta(days=5),
                due_time="09:00",
                category="Personal",
                priority=0,
                user_id=user.id
            ),
            Reminder(
                title="Buy Mom's Birthday Gift",
                description="Order customized photo album online",
                due_date=today + timedelta(days=12),
                due_time="17:00",
                category="Personal",
                priority=1,
                user_id=user.id
            ),
        ]
        session.add_all(reminders)
        session.commit()

        print("Habits, Logs, Goals, Tasks, and Reminders successfully seeded.")

if __name__ == "__main__":
    seed()


