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

  @media (max-width: 1280px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 1280px) {
    flex-direction: row;
    gap: 1rem;
    padding-left: 1rem;
    margin-bottom: 1rem;
  }
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
  flex-wrap: wrap;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem;
  border-radius: 10px;
  justify-content: flex-end;

  @media (max-width: 1280px) {
    justify-content: flex-start;
  }
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

const EventsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const EventButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    transform: translateY(-1px);
  }

  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) => {
      if (props.$gValue >= 5) return '#ff4d4d';
      if (props.$gValue >= 4) return '#ffb84d';
      return '#8cdcd2';
    }};
  }
`;

const ScrubberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChevronButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
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

const Label = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.25rem;
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

const AVAILABLE_YEARS = [
  1989, 2003, 2005, 2015, 2017, 2022, 2023, 2024, 2025, 2026,
];
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
  const [majorEvents, setMajorEvents] = useState([]);

  const currentDate = getDateFromDayOfYear(year, day);

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  let maxDays = isLeapYear ? 366 : 365;

  const today = new Date();
  if (year === today.getFullYear()) {
    maxDays = Math.min(maxDays, getDayOfYear(today));
  }

  // Auto-reset when 'live' mode triggers it
  useEffect(() => {
    if (resetTrigger) {
      setYear(new Date().getFullYear());
      setDay(getDayOfYear(new Date()));
      setHistoricalData(null);
    }
  }, [resetTrigger]);

  useEffect(() => {
    const fetchMajorEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/aurora/major-events`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setMajorEvents(data);
      } catch (err) {
        console.error('Failed to fetch major events:', err);
      }
    };
    fetchMajorEvents();
  }, []);

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

  const handleEventClick = (eventDate) => {
    const dateObj = new Date(eventDate);
    const eventYear = dateObj.getFullYear();
    const eventDay = getDayOfYear(dateObj);

    setYear(eventYear);
    setDay(eventDay);
    setStormMode('historical');
    fetchHistoricalData(dateObj);
  };

  const handleStep = (direction) => {
    let nextDay = day + direction;
    let nextYear = year;

    if (nextDay < 1) {
      const currentIndex = AVAILABLE_YEARS.indexOf(year);
      if (currentIndex > 0) {
        nextYear = AVAILABLE_YEARS[currentIndex - 1];
        const isLeap =
          (nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0;
        nextDay = isLeap ? 366 : 365;
      } else {
        return;
      }
    } else if (nextDay > maxDays) {
      const currentIndex = AVAILABLE_YEARS.indexOf(year);
      if (currentIndex !== -1 && currentIndex < AVAILABLE_YEARS.length - 1) {
        nextYear = AVAILABLE_YEARS[currentIndex + 1];
        nextDay = 1;
      } else {
        return;
      }
    }

    setYear(nextYear);
    setDay(nextDay);
    setStormMode('historical');
    const newDate = getDateFromDayOfYear(nextYear, nextDay);
    fetchHistoricalData(newDate);
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
    gValueText = 'Real-time, geographically-weighted NOAA data';
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

  const filteredEvents = majorEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year;
  });

  return (
    <Container $isMobile={isMobile}>
      <Label>Historical Timeline</Label>
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

      <ScrubberRow>
        <ChevronButton
          onClick={() => handleStep(-1)}
          disabled={day <= 1 && AVAILABLE_YEARS.indexOf(year) === 0}
          title="Previous day">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </ChevronButton>

        <RangeInput
          type="range"
          min="1"
          max={maxDays}
          value={day}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
        />

        <ChevronButton
          onClick={() => handleStep(1)}
          disabled={
            day >= maxDays &&
            AVAILABLE_YEARS.indexOf(year) === AVAILABLE_YEARS.length - 1
          }
          title="Next day">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </ChevronButton>
      </ScrubberRow>

      {filteredEvents.length > 0 && (
        <EventsGroup>
          {filteredEvents.map((event, idx) => (
            <EventButton
              key={`${event.date}-${idx}`}
              $gValue={event.g_value}
              onClick={() => handleEventClick(event.date)}
              title={event.notes}>
              {event.name}
            </EventButton>
          ))}
        </EventsGroup>
      )}
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
