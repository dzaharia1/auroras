# Aurora Visualization App: Comprehensive Architecture Guide

This guide explains the architecture, data flow, and visualization logic behind the Aurora 3D web application. The app leverages real-world space weather data to present a realistic, geographically accurate, and aesthetically dynamic 3D rendering of Earth and the auroral oval.

---

## 1. Where OVATION Data Comes From

The core dataset driving the aurora visualization is the **OVATION (Oval Variation, Assessment, Tracking, Intensity, and Online Now)** model data, provided by the **NOAA Space Weather Prediction Center (SWPC)**. 

### Sourcing
- The [Space API](https://github.com/fcc-lol/space-api) (`space-api/modules/geoMagnetic.js`) fetches the latest OVATION probability map from NOAA's public JSON API (`https://services.swpc.noaa.gov/json/ovation_aurora_latest.json`).
- The data is fetched and cached (typically for 5 minutes) to respect rate limits and improve frontend load times.

### Data Structure & Meaning
- The OVATION API responds with a JSON object that includes an array of `coordinates`.
- Each coordinate is a tuple: `[longitude, latitude, probability]`.
  - **Longitude/Latitude**: Geodetic degrees spanning the globe.
  - **Probability (0 - 100)**: The modeled likelihood (or intensity) of aurora visibility at that specific geographic location.
- *Meaning*: The data represents a heatmap of incoming solar energy interacting with the ionosphere, essentially mapping the "auroral oval" around the Earth's geomagnetic poles.

---

## 2. How the View is Rendered

The 3D environment is built entirely upon **React Three Fiber (R3F)** and **Three.js**, operating within the `<Canvas>` component located in `App.jsx`.

### The Earth Mesh (`Earth.jsx`)
- The Earth is rendered as a sphere (`sphereGeometry` of radius 18).
- **Custom Shader Material**: Instead of standard lighting, the app uses a custom WebGL shader material.
  - Passes two textures: a high-res day map (which shifts dynamically based on the current real-world month to simulate seasonal snow/terrain) and a nighttime city-lights map.
  - **The Terminator Line**: The shader dynamically blends between the day and night textures using a smoothstep function based on the sun's position.
- **Dynamic Sun Positioning**: The `getSubsolarVector` function calculates the exact XYZ vector pointing toward the Sun based on the current UTC time and day of the year. This ensures the day/night terminator line is astronomically correct.
- **Interactivity**: The mesh handles pointer events to allow the user to click-and-drag, rotating both the Earth and the attached aurora along the Y-axis.

### The Camera (`NorthPoleCamera` in `App.jsx`)
- Uses a mathematically calculated oblique angle peering down towards the North Pole. As the user zooms in or out, the camera adjusts its focal height to maintain a cinematic framing of the auroral oval.

---

## 3. Rendering the OVATION Aurora (`AuroraCurtains.jsx`)

Instead of just painting a flat 2D texture, the app generates thousands of individual 3D "curtains" to give the aurora volume and fluid motion.

### Data Filtering & Mapping
- Once `hooks/useSpaceWeather.js` delivers the OVATION data to the frontend, `AuroraCurtains.jsx` processes it.
- To maintain high 60fps performance, it filters out southern hemisphere data and any points with a probability `< 5%`.
- The `[longitude, latitude]` spherical coordinates of the remaining points are converted to Cartesian `[x, y, z]` coordinates using standard trigonometric sphere mapping.

### High-Performance Instancing (InstancedMesh)
- Drawing thousands of standard meshes would crash the browser. Instead, the app uses `THREE.InstancedMesh`.
- A single "curtain" geometry (a vertical plane) is generated *once*.
- `populateMesh` loops through the filtered NOAA points. For each point, it sets a transformation `matrix` on the `InstancedMesh`:
  1. It positions the plane at the calculated `[x,y,z]`.
  2. It orients the plane so it points radially outward from Earth.
  3. It randomly scales the width and height of the curtain based on the OVATION probability (higher probability = taller curtain).
  4. It calculates an RGB color (ranging from green to purple) based on the intensity and stores it in an `InstancedBufferAttribute`.

### Shader Animation
- The fluid, waving motion of the curtains is calculated purely on the GPU.
- A **Simplex Noise (`snoise`)** GLSL function distorts the vertices (`position.x += wave`) over time (`elapsedTime` from R3F's `useFrame`), creating the rippling wind effect seen in real auroras.
- The fragment shader fades the edges to alpha (transparency), making the hard planes look like glowing, ethereal light.

### Overlay Alignment
- **Live Mode**: The aurora curtains are mapped 1:1 onto geographic longitude and latitude precisely matching the Earth texture underneath.
- **Simulated/Historical Mode (in `Earth.jsx`)**: When viewing past storms, the app shifts the aurora to center geometrically over the **Magnetic North Pole** (~80.7°N, 72.7°W). To ensure maximum realism, it projects vectors to push the oval slightly toward the night-side (magnetotail) and spins the peak intensity of the storm to face local midnight.

---

## 4. App Architecture overview

The project is split functionally into two localized services: a frontend and a backend API.

### `space-api/` ([Space API](https://github.com/fcc-lol/space-api))
Node.js environment primarily responsible for gathering remote Earth data.
- **`modules/geoMagnetic.js`**: The workhorse. Fetches and parses 7-day solar wind data, Kp forecasts, magnetometers, and the OVATION maps from NOAA. Caches aggressively.
- **`server.js`** *(implied)*: Serves the Express API routing, exposing localized endpoints (like `/aurora/ovation` and `/aurora/kp`) so the frontend isn't communicating directly with NOAA APIs (avoiding CORS and rate limits).

### `auroras/src/` (The Frontend)
React + Vite environment controlling logic and view rendering.

#### **Key Components:**
- **`App.jsx`**: The main tree. Manages the global state (`stormMode`, `autoRotate`, `historicalSpaceWeather`). Switches data sourcing between live [Space API](https://github.com/fcc-lol/space-api) data and locally generated dummy storm data (`utils/stormData.js`). Mounts the WebGL `<Canvas>`.
- **`hooks/useSpaceWeather.js`**: Reusable hook handling API polling. It hits the local [Space API](https://github.com/fcc-lol/space-api) endpoints concurrently (`/aurora/solar-wind`, `/aurora/kp`, `/aurora/ovation`), formats the JSON, and serves it reactive payload to the UI components.
- **`components/Earth.jsx`**: 3D logic. Assembles the Earth sphere, applies shaders, processes the sun vector, controls dragging logic, and handles the magnetic centering of simulated auroras.
- **`components/AuroraCurtains.jsx`**: 3D logic. Solely responsible for mapping the InstancedMesh curtains and computing the GLSL aurora shaders.
- **`components/Overlay.jsx`**: 2D HTML/CSS logic. Renders HUD elements overlaid on the `<Canvas>`, such as statistics, "Data Sources" modals, and environment readouts.
- **`components/view-controls/ViewControlPanel.jsx`**: 2D HTML/CSS logic. Refactored structural component handling user input for timeline scrubbing, simulating storm severities, zoom levels, and play/pause functionality.
