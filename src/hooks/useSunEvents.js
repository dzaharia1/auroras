import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useSunEvents(observedDate = null) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastDataRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      try {
        const dateParam = observedDate ? `?date=${observedDate}` : '';
        const res = await fetch(`${API_BASE}/sun/events${dateParam}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          lastDataRef.current = data.events || [];
          setEvents(data.events || []);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setEvents(lastDataRef.current);
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [observedDate]);

  return { events, loading, error };
}
