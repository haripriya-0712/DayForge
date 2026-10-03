import { TaskCard } from './TaskCard';
import type { Task } from './TaskCard';

interface ListViewProps {
  tasks: Task[];
  onToggleComplete: (id: number, currentCompleted: boolean) => void;
}

export function ListView({ tasks, onToggleComplete }: ListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted">
        <p>Nothing planned yet.</p>
        <p>Future you will thank you.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} />
      ))}
    </div>
  );
}
