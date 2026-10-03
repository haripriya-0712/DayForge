import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { Stats } from './pages/Stats';
import { Reminders } from './pages/Reminders';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import { AuthPage } from './pages/Auth';
import { getCurrentUser } from './lib/api';
import { NotificationExplainer } from './components/layout/NotificationExplainer';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          setIsAuthenticated(true);
        } else {
          // Check if token exists in localStorage (offline / demo mode)
          const token = localStorage.getItem('access_token');
          const username = localStorage.getItem('username');
          if (token && username) {
            setIsAuthenticated(true);
          }
        }
      })
      .catch((err) => console.warn('Auth check complete:', err))
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

  if (!isAuthenticated) {
    return (
      <AuthPage
        onSuccess={(username) => {
          localStorage.setItem('username', username);
          setIsAuthenticated(true);
        }}
      />
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
