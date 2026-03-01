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

### Data flow

`useSpaceWeather` (polls every 60s) → `App` → `Earth` → `AuroraCurtains`

`useSpaceWeather` fetches three backend endpoints in parallel:
- `/aurora/solar-wind` → `solarWind` (`{ speed, density, bz }`)
- `/aurora/kp` → `kp` (`{ kp }`, taken from the last entry of `observed` or `estimated`)
- `/aurora/ovation` → `ovation` (`{ coordinates: [[lon, lat, probability], ...] }`)

In demo modes (`substorm`, `storm`), `App` replaces `ovation.coordinates` with pre-generated synthetic data from `utils/stormData.js` before passing `effectiveSpaceWeather` to children. Storm data is generated once at module load time (expensive, ~10k points).

### Earth & scene setup

`Earth` renders at radius 18 units, positioned at `[0, -16, 0]` so only the top hemisphere is visible. It has a steep tilt (`rotation.x = 0.6`) to emphasize the north pole. The camera is fixed at `[0, 8, 18]`.

The Earth globe uses a custom `ShaderMaterial` with day/night textures. The terminator is calculated in real time via `getSubsolarVector()` in Earth.jsx, which converts current UTC time to a sun direction vector in the sphere's local space. The key design: the normal is passed as `vNormalLocal` (unmodified local-space normal) so lighting stays locked to geography regardless of user rotation.

Drag-to-rotate is implemented with pointer events on the canvas element. `earthRef` and `auroraRef` rotate together. Momentum decays at 0.95x per frame; auto-rotation only kicks in when velocity drops below 0.001.

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

### Styling

UI overlays (`Overlay`, `RotationControl`, `StormModePicker`) are absolutely positioned over the canvas. `Overlay` uses styled-components with `pointer-events: none` on the container and `pointer-events: auto` selectively. The stats display is currently commented out. `StormModePicker` and `RotationControl` use inline styles directly.
