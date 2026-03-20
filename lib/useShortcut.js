import { useEffect } from 'react';

/**
 * useShortcut — bind keyboard shortcuts
 * shortcuts: [{ key: 'Enter', meta: true, action: fn }, ...]
 */
export function useShortcut(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      for (const s of shortcuts) {
        const metaMatch = s.meta ? (e.metaKey || e.ctrlKey) : true;
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey || !s.shift;
        const keyMatch = e.key === s.key;
        if (metaMatch && keyMatch && shiftMatch) {
          e.preventDefault();
          s.action(e);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

export default useShortcut;
