export interface ICSTask {
  id: number;
  title: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  category?: string;
  notes?: string | null;
  completed?: boolean;
}

export function exportTasksToICS(tasks: ICSTask[], dateStr: string) {
  if (!tasks || tasks.length === 0) return;

  const icsContent: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DayForge Daily Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  tasks.forEach((t) => {
    const dateFormatted = t.date.replace(/-/g, '');
    let startTimeClean = '090000';
    let endTimeClean = '100000';

    if (t.start_time) {
      const parts = t.start_time.split(':');
      startTimeClean = `${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}00`;
    }

    if (t.end_time) {
      const parts = t.end_time.split(':');
      endTimeClean = `${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}00`;
    } else if (t.start_time) {
      const parts = t.start_time.split(':');
      const nextHour = (parseInt(parts[0], 10) + 1).toString().padStart(2, '0');
      endTimeClean = `${nextHour}${parts[1].padStart(2, '0')}00`;
    }

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:dayforge-task-${t.id}-${t.date}@dayforge.local`,
      `DTSTAMP:${dateFormatted}T000000Z`,
      `SUMMARY:${t.title}`,
      `DESCRIPTION:Category: ${t.category || 'General'}${t.notes ? '\\nNotes: ' + t.notes : ''}`,
      `DTSTART:${dateFormatted}T${startTimeClean}`,
      `DTEND:${dateFormatted}T${endTimeClean}`,
      `STATUS:${t.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `dayforge_tasks_${dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
