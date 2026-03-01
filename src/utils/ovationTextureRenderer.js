import * as THREE from 'three';

// Create a memoized canvas so we don't spam the DOM with elements
let cachedCanvas = null;

/**
 * Converts the 2D array of [Longitude, Latitude, AuroraProbability] from the NOAA OVATION
 * endpoint into an Equirectangular (lat/long mapping) Image Texture that perfectly wraps a SphereGeometry.
 * 
 * @param {Array<Array<number>>} coordsData - array of [lon, lat, auroraValue] arrays
 * @param {number} width - canvas width (default 1024)
 * @param {number} height - canvas height (default 512)
 * @returns {THREE.CanvasTexture}
 */
export function generateOvationTexture(coordsData, width = 1024, height = 512) {
    if (!cachedCanvas) {
        cachedCanvas = document.createElement('canvas');
    }
    
    cachedCanvas.width = width;
    cachedCanvas.height = height;
    
    const context = cachedCanvas.getContext('2d');
    
    // Clear the canvas completely transparent
    context.clearRect(0, 0, width, height);
    
    // Create an intense radial gradient for individual probability points
    function createGlowPoint(ctx, x, y, intensity) {
        // Map 0-100 intensity to a 0-1 alpha and radius multiplier
        const normalized = Math.min(1.0, intensity / 100);
        if (normalized <= 0.05) return; // Skip barely-there data to optimize drawing
        
        const radius = 6 + (normalized * 8); // Size of the "glow spot"
        
        // Custom mix of green to purple based on intensity
        const isHigh = normalized > 0.6;
        
        // Use a low opacity because thousands of points will overlap and additive blend
        // Adjusted per user feedback to be more visible
        const colorInner = isHigh ? `rgba(170, 0, 255, 0.15)` : `rgba(0, 255, 100, 0.1)`; 
        const colorOuter = isHigh ? `rgba(170, 0, 255, 0)` : `rgba(0, 255, 100, 0)`;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, colorInner);
        gradient.addColorStop(1, colorOuter);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Iterate over the dataset and plot our points
    // NOAA supplies [Longitude (0 to 360), Latitude (-90 to 90), Probability (0-100)]
    for (let i = 0; i < coordsData.length; i++) {
        const [lon, lat, val] = coordsData[i];
        
        // Map 0 -> 360 Longitude to X (0 to width)
        // ThreeJS standard sphere maps UVs such that Prime Meridian is in the center, 
        // spinning counterclockwise. We align X to this UV layout.
        let x = (lon / 360.0) * width;
        // Shift by 90 degrees (width / 4) to align the OVATION longitude (0-360 starting at Greenwhich)
        // with the ThreeJS sphere UV mapping
        x = (x + width / 4) % width;
        
        // Map -90 -> 90 Latitude to Y (0 to height) 
        // In ThreeJS, Y=0 is the North Pole (top), Y=height is South Pole (bottom)
        // Latitude 90 is North Pole (top), -90 is South Pole
        const y = ((90 - lat) / 180.0) * height;
        
        createGlowPoint(context, x, y, val);
    }
    
    const texture = new THREE.CanvasTexture(cachedCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    // By wrapping we ensure there's no sharp seam where prime meridian meets
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}
