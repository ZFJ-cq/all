export function getDaysDiff(targetDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpired(targetDate: string): boolean {
  return getDaysDiff(targetDate) < 0;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function getDaysLabel(type: 'countdown' | 'anniversary', days: number): string {
  if (type === 'countdown') {
    if (days > 0) return `还有 ${days} 天`;
    if (days === 0) return '就是今天';
    return `已过 ${Math.abs(days)} 天`;
  }
  // anniversary
  if (days >= 0) return `已过 ${days} 天`;
  return `还有 ${Math.abs(days)} 天`;
}

export function getDaysNumber(type: 'countdown' | 'anniversary', days: number): number {
  if (type === 'countdown') {
    return days > 0 ? days : Math.abs(days);
  }
  return Math.abs(days);
}

export function getYearAnniversary(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diffYears = now.getFullYear() - target.getFullYear();
  if (
    now.getMonth() > target.getMonth() ||
    (now.getMonth() === target.getMonth() && now.getDate() >= target.getDate())
  ) {
    return diffYears;
  }
  return diffYears - 1;
}
