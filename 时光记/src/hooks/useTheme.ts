import { useEffect } from 'react';
import { useStore } from '@/store';

export function useTheme() {
  const { settings, updateSettings } = useStore();
  const theme = settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (theme === 'custom' && settings.customBg) {
      document.body.style.backgroundImage = `url(${settings.customBg})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
    }
  }, [theme, settings.customBg]);

  useEffect(() => {
    if (theme === 'light') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const saved = localStorage.getItem('timekeeper_settings');
      if (!saved && prefersDark) {
        updateSettings({ theme: 'dark' });
      }
    }
  }, []);

  return { theme, updateSettings };
}
