export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleNotification(title: string, body: string, at: number): void {
  const delay = at - Date.now();
  if (delay <= 0) return;
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/assets/generated/app-icon-192.dim_192x192.png' });
    }
  }, delay);
}
