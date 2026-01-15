import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SettingsForm from '../components/settings/SettingsForm';

export default function SettingsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
        <SettingsForm />
      </div>
    </MainLayout>
  );
}
