# Space Weather Visualizer
![Space Weather Visualizer](public/screenshot.png)

A React-based 3D web application that visualizes the probability of aurora (Northern Lights) visibility and space weather data on an interactive 3D Earth model.

You can play with it at [auroras.adanmade.app](https://auroras.adanmade.app)

## Features

- **Interactive 3D Earth:** Built with React Three Fiber (R3F) and Three.js, featuring dynamic day/night terminators, realistic lighting, and seasonal earth textures.
- **Real-time & Historical Aurora Data:** Uses the OVATION (Oval Variation, Assessment, Tracking, Intensity, and Online Now) model from NOAA's SWPC to map aurora visibility probabilities.
- **Volumetric Probability Rendering:** Instead of flat textures, the probability of aurora visibility is rendered as thousands of 3D fluid instances (WebGL shaders) simulating the rippling, glowing effect of real auroral curtains.
- **Space Weather Controls:** Includes a control panel with timeline scrubbing, historical storm simulators, play/pause functionality, and live data streaming.
- **Data Integrations:** Fetches live geomagnetic and solar wind data through the [Space API](https://github.com/fcc-lol/space-api) backend service to power the visualizations.

## Tech Stack

- **Framework:** React 18, Vite
- **3D Rendering:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling:** `styled-components`, `lucide-react`
- **Data Source:** NOAA Space Weather Prediction Center (via custom Node.js Space API backend)
- **Backend Service:** [space-api](https://github.com/fcc-lol/space-api)

## Architecture Deep Dive

For a comprehensive explanation of how the 3D rendering, shaders, and data integration work, check out the [App Guide](AURORA_APP_GUIDE.md).

## Getting Started

### Prerequisites

- Node.js installed
- The [space-api](https://github.com/fcc-lol/space-api) backend must be running locally to fetch live space weather data.

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at \`http://localhost:5173/\` by default.

### Production

**Build the application:**
```bash
npm run build
```

**Preview the production build:**
```bash
npm run preview
```
