# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build to dist/
npm run lint      # ESLint (max-warnings 0 — all warnings are errors)
npm run preview   # Preview production build
npm run deploy    # Push to main and watch the CI run
```

Requires `VITE_BACKEND_URL` in `.env` pointing to the backend (default `http://localhost:3102`).

## Architecture

### Views

The app has two views toggled by `ViewSwitcher`: `'earth'` (3D aurora globe) and `'sun'` (SDO solar imagery). `activeView` lives in `App` and is passed to `Overlay`; the earth Canvas is hidden with `display: none` (not unmounted) when the sun view is active.

### Data flow

`useSpaceWeather` (polls every 60s) → `App` → children via `effectiveSpaceWeather`

`useSpaceWeather` fetches six backend endpoints in parallel:
- `/aurora/solar-wind` → `solarWind` (`{ speed, density, bz, bt, pressure, timestamp }`)
- `/aurora/kp` → `kp` (`{ kp }`, last entry of `observed` or `estimated`)
- `/aurora/ovation` → `ovation` (`{ coordinates: [[lon, lat, probability], ...] }`)
- `/aurora/dst` → `dst`
- `/aurora/xray` → `xray` (`{ current: { fluxClass }, peak24h, activeAlert }`)
- `/aurora/hemispheric-power` → `hemisphericPower`

**Storm modes:** `App` manages `stormMode` ∈ `{ 'live', 'substorm', 'storm', 'historical' }`. In non-live modes, `effectiveSpaceWeather` overrides `ovation.coordinates` with pre-generated synthetic data. In `'historical'` mode, data comes from `/aurora/historical?date=YYYY-MM-DD` fetched by `Timeline`.

Storm data (`STORM_DATA`, `SUBSTORM_DATA`, `QUIET_DATA`) is generated once at module load from `utils/stormData.js` (~10k points each, expensive).

### Timeline & historical mode

`Timeline` (`src/components/view-controls/Timeline.jsx`) is the scrubber for historical exploration. It manages `year` and `day` (day-of-year) state lifted into `App`. Key behaviors:
- Year selector buttons jump to a predefined set: `[1989, 2000, 2003, 2005, 2015, 2017, 2022, 2023, 2024, 2025, 2026]`
- Slider scrubs day-of-year within the selected year; releases trigger `/aurora/historical?date=` fetch
- Play button advances day by 1 every second, auto-fetching each day
- `/aurora/major-events` populates clickable event shortcuts below the scrubber
- Historical Kp ≥ 8 → `STORM_DATA`, ≥ 5 → `SUBSTORM_DATA`, else → `QUIET_DATA` for OVATION visualization
- `resetTrigger` (incremented by `App`) resets the timeline back to today

The `Timeline` also renders in the `MobileControlsDialog` via `isMobile` prop (no backdrop, no border).

### Earth & scene setup

`EarthScene` wraps `Earth` and `AuroraCurtains` as a Three.js group. `Earth` renders at radius 18 units. Camera is controlled by `EarthCamera` (inside the Canvas): scroll wheel and pinch-to-zoom adjust `zoomRadius` (clamped 10–50), which sets `camera.position.z` based on horizontal FOV math. Auto-rotation and drag-to-rotate momentum live in `EarthScene`/`Earth`.

The Earth globe uses a custom `ShaderMaterial` with day/night textures. The terminator is calculated in real time via `getSubsolarVector()` in Earth.jsx. The normal is passed as `vNormalLocal` (unmodified local-space normal) so lighting stays locked to geography regardless of user rotation.

### AuroraCurtains rendering

Aurora curtains are `InstancedMesh` of tall thin `PlaneGeometry` (translated 0.5 up so they're anchored at the base). Up to 5000 instances; only NOAA coordinates with `lat >= 45` and `val >= 5` are rendered.

**Critical: `auroraColor` geometry attribute** — Per-instance color uses a custom `InstancedBufferAttribute` named `auroraColor` rather than THREE.js's `instanceColor`/`USE_INSTANCING_COLOR` system. This avoids a production race condition where the shader define is only injected at compile time but the mesh mounts before API data arrives (particularly when assets are cached by Cloudflare). The attribute is declared in the vertex shader as `attribute vec3 auroraColor`.

**Critical: `frustumCulled={false}`** — The frustum culling bounding box for the InstancedMesh doesn't account for vertex shader displacement, causing incorrect culling. Must stay disabled.

Instance placement: NOAA longitude 0–360 maps using `phi_map = PI + (lon * PI/180)` with negative X to match Three.js SphereGeometry's UV convention. Each plane orients its local Y outward (radial) using `setFromUnitVectors`, then gets a random axial rotation. Color interpolates green→purple via HSL as intensity rises 0→1.

The vertex shader applies simplex noise (`snoise`) as a wave displacement that increases with height (`vUv.y`), giving the curtain animation effect. The fragment shader applies edge fade with `sin(uv.x * PI)` and `smoothstep` on Y.

### OVATION coordinate convention

NOAA OVATION data: `[longitude (0–360), latitude (−90 to 90), probability (0–100)]`

For mapping to the Three.js sphere UV layout:
- Longitude 0 aligns with the sphere's +X axis (prime meridian at center of texture)
- Shift X by `width/4` to align OVATION's Greenwich origin with Three.js UV mapping
- Y=0 is north pole in texture space

`ovationTextureRenderer.js` contains an alternative canvas-based texture approach (currently unused — `AuroraCurtains` uses InstancedMesh instead).

### Sun view

`SunImageView` fetches SDO/AIA solar imagery from the backend (`/sun/image?wavelength=&width=&height=&date=`), which proxies Helioviewer. It auto-refreshes every 5 minutes in live mode. A hidden `<img>` pre-loads new URLs so the old image stays visible during transitions.

The backend responds with an `X-Image-Date` header indicating the observation timestamp; `SunImageView` reads this via a HEAD request to align overlay data.

`SunDataOverlay` is an SVG overlay rendered exactly over the image (measured via `ResizeObserver` + `getBoundingClientRect`). It shows active regions (`useSunRegions`) and prominences (`useSunEvents`), both fetched from `/sun/regions?date=` and `/sun/events?date=` respectively.

Wavelengths are SDO/AIA EUV bands defined in `utils/wavelengthConfig.js` (`WAVELENGTH_CONFIG` array, `DEFAULT_WAVELENGTH = '335'`). Each entry includes `prominenceVisible` to control overlay behavior per wavelength.

### Data column components (`src/components/data/`)

Each component is self-contained, receiving only what it needs from `spaceWeather`:
- `BzIndicator` — Bz (north/south IMF component), drives aurora probability
- `SolarWindLayer` — speed, density, pressure
- `DstLayer` — Dst index (geomagnetic storm strength)
- `HemisphericPowerLayer` — hemispheric power index
- `SolarFlareLayer` — X-ray flux class, active alert
- `SolarCycleLayer` — solar cycle position (takes a `date` prop)
- `SolarWindOriginLayer` — solar wind origin (takes `solarWind` prop)

### Overlay & responsive layout

`Overlay` has two parallel markup trees rendered simultaneously: `screenSize="desktop"` rows (visible above 1150px) and `screenSize="mobile"` rows (visible below 1150px). The mobile bottom row shows "Data" and "Controls" buttons that open `MobileDataOverlay` and `MobileControlsDialog` respectively.

`useIdleTimeout(10000)` in `App` dims the entire overlay to 15% opacity after 10s of inactivity.
