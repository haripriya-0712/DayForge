import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { Stats } from './pages/Stats';
import { Reminders } from './pages/Reminders';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import { login } from './lib/api';
import { NotificationExplainer } from './components/layout/NotificationExplainer';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    login()
      .catch((err) => console.warn('Login check complete:', err))
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0F0E17] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium animate-pulse">Loading DayForge...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NotificationExplainer />
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
