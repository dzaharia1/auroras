import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import SunImageOverlay from './SunImageOverlay';
import { useSunRegions } from '../hooks/useSunRegions';
import { useSunEvents } from '../hooks/useSunEvents';
import { SUN_IMAGE_PARAMS } from '../utils/solarCoords';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const Container = styled.div`
  position: absolute;
  inset: 0;
  background: #000005;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SolarImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  opacity: ${({ $loading }) => ($loading ? 0.5 : 1)};
  transition: opacity 0.3s ease;
  user-select: none;
`;

const Timestamp = styled.div`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 11px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.45);
  pointer-events: none;
  z-index: 5;
`;

const StaleIndicator = styled.div`
  position: absolute;
  top: 12px;
  left: 16px;
  font-size: 11px;
  font-family: monospace;
  color: rgba(255, 160, 50, 0.8);
  pointer-events: none;
  z-index: 5;
`;

function buildImageUrl(wavelength, cacheBust) {
  return `${API_BASE}/sun/image?wavelength=${wavelength}&width=1024&height=1024${cacheBust ? `&_t=${cacheBust}` : ''}`;
}

export default function SunImageView({ sunWavelength }) {
  const [currentUrl, setCurrentUrl] = useState(() =>
    buildImageUrl(sunWavelength, null),
  );
  const [displayUrl, setDisplayUrl] = useState(() =>
    buildImageUrl(sunWavelength, null),
  );
  const [loading, setLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);
  const [isStale, setIsStale] = useState(false);

  // Track the observation date of the current Helioviewer image (YYYY-MM-DD)
  // Used to request matching overlay data from SWPC
  const [imageObservedDate, setImageObservedDate] = useState(null);

  // Measure the rendered image dimensions for the SVG overlay
  const imageRef = useRef(null);
  const [imageDims, setImageDims] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Track the latest requested wavelength to handle rapid switching
  const latestWavelengthRef = useRef(sunWavelength);
  const refreshTimerRef = useRef(null);

  // Shift marker data 8 hours earlier than the image to compensate for alignment offset
  const markerDate = imageObservedDate
    ? new Date(new Date(imageObservedDate).getTime() - 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : null;

  // Data hooks for overlay — pass the shifted date so markers align with the image
  const { regions } = useSunRegions(markerDate);
  const { events } = useSunEvents(markerDate);

  // Fetch the X-Image-Date header from the backend to learn when the image was taken
  useEffect(() => {
    const url = buildImageUrl(sunWavelength, null);
    const controller = new AbortController();

    fetch(url, { method: 'HEAD', signal: controller.signal })
      .then((res) => {
        const imageDate = res.headers.get('X-Image-Date');
        if (imageDate) {
          console.log(
            'Sun image observation time used for alignment:',
            imageDate,
          );
          setImageObservedDate(imageDate);
        } else {
          console.log('No X-Image-Date header received');
        }
      })
      .catch(() => {
        // Ignore — non-critical, overlay will use latest data as fallback
      });

    return () => controller.abort();
  }, [sunWavelength]);

  // Measure the actual rendered image size and position within the wrapper
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    function measure() {
      if (!img.naturalWidth) return; // image not loaded yet
      const wrapper = img.parentElement;
      if (!wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      setImageDims({
        width: imgRect.width,
        height: imgRect.height,
        offsetX: imgRect.left - wrapperRect.left,
        offsetY: imgRect.top - wrapperRect.top,
      });
    }

    // Measure after the image loads
    img.addEventListener('load', measure);

    // Also re-measure on resize
    const observer = new ResizeObserver(measure);
    observer.observe(img);
    if (img.parentElement) observer.observe(img.parentElement);

    // Initial measurement if image is already loaded
    if (img.complete && img.naturalWidth) measure();

    return () => {
      img.removeEventListener('load', measure);
      observer.disconnect();
    };
  }, [displayUrl]); // re-attach when the display image changes

  const loadImage = useCallback((wavelength, cacheBust = null) => {
    const url = buildImageUrl(wavelength, cacheBust);
    setCurrentUrl(url);
    setLoading(true);
  }, []);

  // When wavelength changes, load new image immediately
  useEffect(() => {
    latestWavelengthRef.current = sunWavelength;
    loadImage(sunWavelength);
  }, [sunWavelength, loadImage]);

  // 5-minute auto-refresh
  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      loadImage(latestWavelengthRef.current, Date.now());
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimerRef.current);
  }, [loadImage]);

  const handleImageLoad = useCallback(
    (e) => {
      // Only update display if this is still the latest wavelength
      const url = e.target.src;
      if (url === currentUrl) {
        setDisplayUrl(currentUrl);
        setLoading(false);
        setLoadedAt(new Date());
        setIsStale(false);
      }
    },
    [currentUrl],
  );

  const handleImageError = useCallback(() => {
    setLoading(false);
    setIsStale(true);
  }, []);

  const formattedTime = loadedAt
    ? loadedAt.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    : null;

  return (
    <Container>
      <ImageWrapper>
        {/* Hidden loader for the new URL — keeps old image visible while loading */}
        {loading && currentUrl !== displayUrl && (
          <img
            src={currentUrl}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: 'none' }}
            alt=""
          />
        )}

        <SolarImage
          ref={imageRef}
          src={displayUrl}
          onLoad={
            loading && currentUrl === displayUrl ? handleImageLoad : undefined
          }
          onError={
            loading && currentUrl === displayUrl ? handleImageError : undefined
          }
          $loading={loading}
          alt={`Solar disk at ${sunWavelength} Å`}
          draggable={false}
        />

        {/* SVG overlay positioned exactly over the rendered image */}
        {imageDims.width > 0 && imageDims.height > 0 && (
          <div
            style={{
              position: 'absolute',
              left: imageDims.offsetX,
              top: imageDims.offsetY,
              width: imageDims.width,
              height: imageDims.height,
              pointerEvents: 'none',
            }}>
            <SunImageOverlay
              regions={regions}
              events={events}
              imageParams={SUN_IMAGE_PARAMS}
              showRegions={true}
              showProminences={true}
              containerWidth={imageDims.width}
              containerHeight={imageDims.height}
            />
          </div>
        )}
      </ImageWrapper>

      {isStale && <StaleIndicator>⚠ data stale</StaleIndicator>}

      {formattedTime && !isStale && <Timestamp>{formattedTime}</Timestamp>}
    </Container>
  );
}

SunImageView.propTypes = {
  sunWavelength: PropTypes.string.isRequired,
};
