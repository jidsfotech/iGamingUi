export function getTimeLeft(endTime: string | Date): number {
  if (!endTime) return 0;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  const seconds = Math.max(0, Math.floor((end.getTime() - Date.now())/ 1000));
  return seconds;
}

export function getSecondsUntilNextSession(nextSessionStart: string | Date): number {
  if (!nextSessionStart) return 0;
  const start = typeof nextSessionStart === 'string' ? new Date(nextSessionStart) : nextSessionStart;
  const seconds = Math.max(0, Math.floor((start.getTime() - Date.now()) / 1000));
  return seconds;
} 