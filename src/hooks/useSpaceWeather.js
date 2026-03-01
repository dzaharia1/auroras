import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export function useSpaceWeather() {
  const [data, setData] = useState({
    solarWind: null,
    kp: null,
    ovation: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [windRes, kpRes, ovationRes] = await Promise.all([
          fetch(`${API_BASE}/aurora/solar-wind`),
          fetch(`${API_BASE}/aurora/kp`),
          fetch(`${API_BASE}/aurora/ovation`),
        ]);

        const windData = await windRes.json();
        const kpResponse = await kpRes.json();
        const ovationData = await ovationRes.json();

        // Solar wind: use plasma and magneticField from the response object
        const latestWind = windData?.plasma ? {
           speed: windData.plasma.speed,
           density: windData.plasma.density,
           bz: windData.magneticField?.bz || 0,
        } : { speed: 400, density: 4.0, bz: 0.0 };

        // Kp has 'observed', 'estimated', 'predicted' arrays inside 'current' object? Wait, the response was:
        // {"observed":[...], "estimated":[...], "predicted":[...]}
        // But the endpoint is `/aurora/kp`. Wait, in `server.js` it returns: `{ current, forecast }`.
        // So it's `kpResponse.current.observed` if we look at `server.js`. Let me just safely traverse.
        const kpObj = kpResponse.current || kpResponse;
        let currentKp = { kp: 2.0 };
        if (kpObj.observed && kpObj.observed.length > 0) {
            currentKp = kpObj.observed[kpObj.observed.length - 1];
        } else if (kpObj.estimated && kpObj.estimated.length > 0) {
            currentKp = kpObj.estimated[kpObj.estimated.length - 1];
        }

        setData({
          solarWind: latestWind,
          kp: currentKp,
          ovation: ovationData,
          loading: false,
          error: null,
        });

      } catch (err) {
        console.error('Failed to fetch space weather data:', err);
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
