import { useEffect, useCallback } from 'react';
import { useStore } from '@/store';
import { getDaysDiff } from '@/utils/dateCalc';

export function useNotification() {
  const { settings, dates, updateSettings } = useStore();

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  useEffect(() => {
    if (!settings.notificationEnabled || settings.notificationDays === 'none') return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const checkNotifications = () => {
      const notifyDays = parseInt(settings.notificationDays);
      dates.forEach((item) => {
        const days = getDaysDiff(item.date);
        if (item.type === 'countdown' && days >= 0 && days <= notifyDays) {
          const key = `timekeeper_notified_${item.id}_${item.date}`;
          if (!sessionStorage.getItem(key)) {
            new Notification('时光记提醒', {
              body: days === 0
                ? `「${item.title}」就是今天！`
                : `「${item.title}」还有 ${days} 天`,
              icon: '/favicon.svg',
            });
            sessionStorage.setItem(key, '1');
          }
        }
      });
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [settings.notificationEnabled, settings.notificationDays, dates]);

  return { requestPermission, updateSettings };
}
