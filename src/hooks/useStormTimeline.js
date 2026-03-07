import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export function useStormTimeline() {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch(`${API_BASE}/aurora/storm-timeline`);
        if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
        const data = await res.json();
        setTimeline(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch storm timeline:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeline();
    const interval = setInterval(fetchTimeline, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { timeline, loading, error };
}
