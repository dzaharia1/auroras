import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export function useSpaceWeather() {
  const [data, setData] = useState({
    solarWind: null,
    kp: null,
    ovation: null,
    dst: null,
    xray: null,
    hemisphericPower: null,
    loading: true,
    error: null,
    lastFetch: null,
    dataMode: 'live',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [windRes, kpRes, ovationRes, dstRes, xrayRes, hpiRes] =
          await Promise.all([
            fetch(`${API_BASE}/aurora/solar-wind`),
            fetch(`${API_BASE}/aurora/kp`),
            fetch(`${API_BASE}/aurora/ovation`),
            fetch(`${API_BASE}/aurora/dst`),
            fetch(`${API_BASE}/aurora/xray`),
            fetch(`${API_BASE}/aurora/hemispheric-power`),
          ]);

        const windData = await windRes.json();
        const kpResponse = await kpRes.json();
        const ovationData = await ovationRes.json();
        const dstData = dstRes.ok ? await dstRes.json() : null;
        const xrayData = xrayRes.ok ? await xrayRes.json() : null;
        const hpiData = hpiRes.ok ? await hpiRes.json() : null;

        // Solar wind: use plasma and magneticField from the response object
        const latestWind = windData?.plasma
          ? {
              speed: windData.plasma.speed,
              density: windData.plasma.density,
              pressure: windData.plasma.pressure,
              bz: windData.magneticField?.bz || 0,
              bt: windData.magneticField?.bt || null,
              timestamp: windData.plasma.timestamp,
            }
          : { speed: 400, density: 4.0, bz: 0.0 };

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
          dst: dstData,
          xray: xrayData,
          hemisphericPower: hpiData,
          loading: false,
          error: null,
          lastFetch: new Date().toISOString(),
          dataMode: 'live',
        });
      } catch (err) {
        console.error('Failed to fetch space weather data:', err);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
          dataMode: prev.lastFetch ? 'stale' : 'error',
        }));
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
