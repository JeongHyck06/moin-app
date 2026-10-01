import { createContext } from 'react';
export const CurrentUserId = createContext<number | null>(null);
const listeners = new Set<() => void>();
export const onSafetyChange = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const notifySafetyChange = () =>
  listeners.forEach(listener => listener());
