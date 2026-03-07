import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.div`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.35);
  font-family: 'Inter', sans-serif;
`;

const Track = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const EventSegment = styled.div`
  flex: ${(p) => p.$flex || 1};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: ${(p) => eventBg(p.$type)};
  cursor: default;
  position: relative;
  min-width: 0;

  &:last-child {
    border-right: none;
  }
`;

const EventLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(p) => eventColor(p.$type)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Inter', sans-serif;
`;

const EventTime = styled.div`
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 0.1rem;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
`;

const Empty = styled.div`
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
  font-family: 'Inter', sans-serif;
`;

function eventBg(type) {
  switch (type) {
    case 'flare': return 'rgba(255, 140, 40, 0.1)';
    case 'cme': return 'rgba(100, 160, 255, 0.1)';
    case 'solar_wind': return 'rgba(100, 220, 180, 0.08)';
    case 'geomagnetic': return 'rgba(180, 100, 255, 0.1)';
    default: return 'rgba(255, 255, 255, 0.04)';
  }
}

function eventColor(type) {
  switch (type) {
    case 'flare': return '#ffa94d';
    case 'cme': return '#74b9ff';
    case 'solar_wind': return '#6bcb77';
    case 'geomagnetic': return '#c77dff';
    default: return 'rgba(255,255,255,0.5)';
  }
}

function eventShortLabel(event) {
  switch (event.type) {
    case 'flare': return event.class ? `${event.class} Flare` : 'Flare';
    case 'cme': return 'CME';
    case 'solar_wind': return 'Solar Wind';
    case 'geomagnetic': return event.kp != null ? `Kp ${event.kp}` : 'Geomag';
    default: return event.type ?? 'Event';
  }
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function StormTimeline({ timeline, loading }) {
  if (loading) {
    return (
      <Container>
        <Label>72h Storm Timeline</Label>
        <Empty>Loading…</Empty>
      </Container>
    );
  }

  const events = timeline?.events;
  if (!events || events.length === 0) {
    return (
      <Container>
        <Label>72h Storm Timeline</Label>
        <Empty>No significant events</Empty>
      </Container>
    );
  }

  return (
    <Container>
      <Label>72h Storm Timeline</Label>
      <Track>
        {events.map((event, i) => (
          <EventSegment key={i} $type={event.type} $flex={1}>
            <EventLabel $type={event.type}>{eventShortLabel(event)}</EventLabel>
            <EventTime>{formatTime(event.time)}</EventTime>
          </EventSegment>
        ))}
      </Track>
    </Container>
  );
}

StormTimeline.propTypes = {
  timeline: PropTypes.shape({
    events: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        time: PropTypes.string,
        class: PropTypes.string,
        kp: PropTypes.number,
      }),
    ),
  }),
  loading: PropTypes.bool,
};
