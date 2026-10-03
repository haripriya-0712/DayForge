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
    login().then(() => setIsReady(true));
  }, []);

  if (!isReady) return null;

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
