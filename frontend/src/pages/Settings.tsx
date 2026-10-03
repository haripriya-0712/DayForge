import { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { downloadDataBackup, restoreDataBackup } from '@/lib/exportImport';
import { Download, Upload, CheckCircle2, ShieldCheck, User, Sparkles } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';


export function Settings() {
  const [userName, setUserName] = useState('Haripriya');
  const [avatarName, setAvatarName] = useState('Forge Fox');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await downloadDataBackup();
      setStatusMsg({ type: 'success', text: 'Backup downloaded successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to download backup.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await restoreDataBackup(file);
      setStatusMsg({ type: 'success', text: 'Data restored successfully! Refreshing page...' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to restore backup file.' });
    }
  };

  return (
    <PageWrapper className="space-y-6 max-w-2xl pb-28">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-text tracking-tight">Settings</h1>
        <p className="text-text-muted text-sm mt-1">Configure your personal preferences & data backups</p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          }`}
        >
          <CheckCircle2 size={18} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Profile Section */}
      <Card className="p-6 space-y-5 shadow-soft">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
          <div className="p-2 rounded-xl bg-primary-soft text-primary">
            <User size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-text">Profile Information</h2>
            <p className="text-xs text-text-muted">Personalize how DayForge greets you</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-text">Your Name</label>
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Haripriya" />
          </div>
        </div>
      </Card>

      {/* Avatar Companion Section */}
      <Card className="p-6 space-y-5 shadow-soft">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-text">Avatar Motivator</h2>
            <p className="text-xs text-text-muted">Customize your daily companion mascot</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-text">Mascot Name</label>
            <Input value={avatarName} onChange={(e) => setAvatarName(e.target.value)} placeholder="Forge Fox" />
          </div>

          <div className="pt-2">
            <Toggle
              checked={soundEnabled}
              onChange={setSoundEnabled}
              label="Enable Encouragement Haptics"
              description="Subtle vibration feedback on completed tasks"
            />
          </div>
        </div>
      </Card>

      {/* Data & Backup Section */}
      <Card className="p-6 space-y-5 shadow-soft">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-text">Data Portability & Backup</h2>
            <p className="text-xs text-text-muted">Full 1-click JSON backup export and restore</p>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Export all your timetable tasks, habit streaks, multi-month goals, and reminders to a JSON file or restore from a previous backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2 font-semibold">
            <Download size={16} />
            <span>Export JSON Backup</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 font-semibold"
          >
            <Upload size={16} />
            <span>Restore Backup</span>
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </Card>
    </PageWrapper>
  );
}

