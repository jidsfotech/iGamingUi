export function getTimeLeft(endTime: string | Date): number {
  if (!endTime) return 0;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  const seconds = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
  return seconds;
} 