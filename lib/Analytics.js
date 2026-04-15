import { useEffect, useCallback } from 'react';

const ANALYTICS_KEY = 'a1d-analytics';
const MAX_EVENTS = 100;

function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveEvents(events) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {}
}

export function track(event, data = {}) {
  if (typeof window === 'undefined') return;
  const events = getEvents();
  events.push({
    event,
    data,
    ts: Date.now(),
    url: typeof window !== 'undefined' ? window.location.pathname : null,
  });
  saveEvents(events);
}

export function trackPageView(page) {
  track('page_view', { page });
}

export function trackToolUse(tool) {
  track('tool_use', { tool });
}

export function trackError(error, context = {}) {
  track('error', { error: error.message || String(error), ...context });
}

export function useAnalytics() {
  const track = useCallback((event, data) => track(event, data), []);
  return { track };
}

export function getAnalytics() {
  return getEvents();
}

export function clearAnalytics() {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
  } catch {}
}

export function exportAnalytics() {
  const events = getEvents();
  return JSON.stringify(events, null, 2);
}

export default { track, trackPageView, trackToolUse, trackError, getAnalytics, clearAnalytics, exportAnalytics };