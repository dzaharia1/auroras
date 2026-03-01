import { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Container = styled.div`
  flex: ${(props) => (props.$isMobile ? '0' : '1')}; /* Desktop */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${(props) =>
    props.$isMobile ? 'transparent' : 'rgba(20, 20, 30, 0.4)'};
  backdrop-filter: ${(props) => (props.$isMobile ? 'none' : 'blur(12px)')};
  -webkit-backdrop-filter: ${(props) =>
    props.$isMobile ? 'none' : 'blur(12px)'};
  border: ${(props) =>
    props.$isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  padding: ${(props) => (props.$isMobile ? '0' : '1.5rem 2rem')};
  width: ${(props) => (props.$isMobile ? '100%' : 'auto')};
  font-family: 'Inter', sans-serif;
  color: white;
  box-shadow: ${(props) =>
    props.$isMobile ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.3)'};
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateDisplay = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const GValueDisplay = styled.div`
  font-size: 0.85rem;
  color: ${(props) => props.$color || 'rgba(255, 255, 255, 0.6)'};
  font-weight: 500;
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const YearButtonsGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem;
  border-radius: 10px;
`;

const YearButton = styled.button`
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: none;
  color: ${(props) => (props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const LiveButton = styled(YearButton)`
  background: ${(props) =>
    props.$active ? 'rgba(100, 220, 180, 0.2)' : 'transparent'};
  color: ${(props) =>
    props.$active ? 'rgba(140, 255, 210, 1)' : 'rgba(255, 255, 255, 0.5)'};

  &:hover {
    background: rgba(100, 220, 180, 0.3);
    color: rgba(140, 255, 210, 1);
  }
`;

const RangeInput = styled.input`
  -webkit-appearance: none;
  width: 100%;
  background: transparent;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    margin-top: -8px;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    transition: transform 0.1s ease;
  }

  &::-webkit-slider-thumb:active {
    transform: scale(1.2);
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  &:focus {
    outline: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDateFromDayOfYear(year, day) {
  const date = new Date(year, 0, 1);
  date.setDate(day);
  return date;
}

function formatDateDisplay(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateForApi(date) {
  return date.toISOString().split('T')[0];
}

const AVAILABLE_YEARS = [2023, 2024, 2025, 2026];
const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function Timeline({
  onDataFetched,
  resetTrigger,
  stormMode,
  setStormMode,
  isMobile,
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [day, setDay] = useState(getDayOfYear(new Date()));
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState(null);

  const currentDate = getDateFromDayOfYear(year, day);

  // Auto-reset when 'live' mode triggers it
  useEffect(() => {
    if (resetTrigger) {
      setYear(new Date().getFullYear());
      setDay(getDayOfYear(new Date()));
      setHistoricalData(null);
    }
  }, [resetTrigger]);

  const fetchHistoricalData = async (targetDate) => {
    setLoading(true);
    const dateStr = formatDateForApi(targetDate);

    try {
      const res = await fetch(`${API_BASE}/aurora/historical?date=${dateStr}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setHistoricalData(data);
      if (onDataFetched) {
        onDataFetched({ date: targetDate, data });
      }
    } catch (err) {
      console.error(err);
      setHistoricalData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleYearClick = (targetYear) => {
    const today = new Date();
    const isLeapYear =
      (targetYear % 4 === 0 && targetYear % 100 !== 0) ||
      targetYear % 400 === 0;
    let nextMaxDays = isLeapYear ? 366 : 365;

    if (targetYear === today.getFullYear()) {
      nextMaxDays = Math.min(nextMaxDays, getDayOfYear(today));
    }

    const nextDay = Math.min(day, nextMaxDays);

    setYear(targetYear);
    setDay(nextDay);

    // Auto-fetch for the new year at the clamped day pointer
    const newDate = getDateFromDayOfYear(targetYear, nextDay);
    fetchHistoricalData(newDate);
  };

  const handleLiveClick = () => {
    setStormMode('live');
  };

  const handleSliderChange = (e) => {
    setDay(parseInt(e.target.value, 10));
  };

  const handleSliderRelease = (e) => {
    const newDate = getDateFromDayOfYear(year, parseInt(e.target.value, 10));
    fetchHistoricalData(newDate);
  };

  // Determine G-value text/color
  let gValueText = 'Scrub to explore';
  let gValueColor = 'rgba(255, 255, 255, 0.6)';

  if (stormMode === 'live') {
    gValueText = 'Real-time NOAA data';
    gValueColor = 'rgba(140, 255, 210, 1)';
  } else if (historicalData && !historicalData.error) {
    // Map max Kp to G-scale
    const k = historicalData.maxKp;
    let g = 0;
    if (k >= 9) g = 5;
    else if (k >= 8) g = 4;
    else if (k >= 7) g = 3;
    else if (k >= 6) g = 2;
    else if (k >= 5) g = 1;

    gValueText =
      g > 0 ? `G${g} (${historicalData.storm || 'Minor'})` : 'Quiet (G0)';

    // Color mapping
    if (g >= 4) gValueColor = '#ff4d4d';
    else if (g >= 2) gValueColor = '#ffb84d';
    else gValueColor = '#8cdcd2';
  } else if (historicalData?.error) {
    gValueText = 'Data unavailable';
    gValueColor = '#ff4d4d';
  }

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  let maxDays = isLeapYear ? 366 : 365;

  const today = new Date();
  if (year === today.getFullYear()) {
    maxDays = Math.min(maxDays, getDayOfYear(today));
  }

  return (
    <Container $isMobile={isMobile}>
      <HeaderRow>
        <InfoBox>
          <DateDisplay>
            {stormMode === 'live' ? 'Today' : formatDateDisplay(currentDate)}
          </DateDisplay>
          <GValueDisplay $color={gValueColor}>
            {loading ? <LoadingSpinner /> : gValueText}
          </GValueDisplay>
        </InfoBox>
        <YearButtonsGroup>
          {AVAILABLE_YEARS.map((y) => (
            <YearButton
              key={y}
              $active={year === y && stormMode === 'historical'}
              onClick={() => handleYearClick(y)}>
              {y}
            </YearButton>
          ))}
          <LiveButton $active={stormMode === 'live'} onClick={handleLiveClick}>
            Live
          </LiveButton>
        </YearButtonsGroup>
      </HeaderRow>

      <RangeInput
        type="range"
        min="1"
        max={maxDays}
        value={day}
        onChange={handleSliderChange}
        onMouseUp={handleSliderRelease}
        onTouchEnd={handleSliderRelease}
      />
    </Container>
  );
}

Timeline.propTypes = {
  onDataFetched: PropTypes.func.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  stormMode: PropTypes.string.isRequired,
  setStormMode: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};
