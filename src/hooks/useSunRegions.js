import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useSunRegions(observedDate = null) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastDataRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchRegions() {
      try {
        const dateParam = observedDate ? `?date=${observedDate}` : '';
        const res = await fetch(`${API_BASE}/sun/regions${dateParam}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          lastDataRef.current = data.regions || [];
          setRegions(data.regions || []);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setRegions(lastDataRef.current);
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchRegions();
    const interval = setInterval(fetchRegions, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [observedDate]);

  return { regions, loading, error };
}
