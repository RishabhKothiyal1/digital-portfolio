import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

const markers = [
    { lat: 40.7128, lng: -74.006, size: 0.3 }, // New York
    { lat: 34.0522, lng: -118.2437, size: 0.3 }, // Los Angeles
    { lat: 51.5074, lng: -0.1278, size: 0.3 }, // London
    { lat: -33.8688, lng: 151.2093, size: 0.3 }, // Sydney
    { lat: 48.8566, lng: 2.3522, size: 0.3 }, // Paris
    { lat: 35.6762, lng: 139.6503, size: 0.3 }, // Tokyo
    { lat: 55.7558, lng: 37.6176, size: 0.3 }, // Moscow
    { lat: 39.9042, lng: 116.4074, size: 0.3 }, // Beijing
    { lat: 28.6139, lng: 77.209, size: 0.3 }, // New Delhi
    { lat: -23.5505, lng: -46.6333, size: 0.3 }, // Sao Paulo
    { lat: 1.3521, lng: 103.8198, size: 0.3 }, // Singapore
    { lat: 25.2048, lng: 55.2708, size: 0.3 }, // Dubai
    { lat: 52.52, lng: 13.405, size: 0.3 }, // Berlin
    { lat: 19.4326, lng: -99.1332, size: 0.3 }, // Mexico City
    { lat: -26.2041, lng: 28.0473, size: 0.3 }, // Johannesburg
];

export async function initDottedMap(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    // Resize handler
    function resize() {
        const rect = container.getBoundingClientRect();
        let w = rect.width;
        let h = rect.height;

        // Fallback if hidden/zero
        if (w === 0) w = 600;
        if (h === 0) h = 500; // Force a size so we can draw *something*

        // Handle High DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.scale(dpr, dpr);

        return { width: w, height: h };
    }

    let { width, height } = resize();
    console.log(`[DottedMap] Initialized with size: ${width}x${height}`);

    // Load World Data
    let world;
    try {
        console.log("[DottedMap] Fetching map data...");
        const response = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        world = await response.json();
        console.log("[DottedMap] Map data loaded successfully.");
    } catch (e) {
        console.error("[DottedMap] Failed to load map data", e);
        // Draw error text on canvas
        ctx.fillStyle = 'red';
        ctx.font = '16px monospace';
        ctx.fillText('Detailed Error: ' + e.message, 20, 50);
        return;
    }

    const land = topojson.feature(world, world.objects.countries);

    // Configuration
    const sphere = { type: "Sphere" };
    // Projection
    const projection = d3.geoEquirectangular()
        .fitSize([width, height], sphere);

    // Create a hidden canvas to draw the silhouette
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.width = width;
    hiddenCanvas.height = height;
    const hiddenCtx = hiddenCanvas.getContext('2d');
    const pathGenerator = d3.geoPath(projection, hiddenCtx);

    // Draw Land on hidden canvas
    hiddenCtx.fillStyle = '#fff';
    hiddenCtx.beginPath();
    pathGenerator(land);
    hiddenCtx.fill();

    // Sample points
    const spacing = 4; // Tighter spacing for better resolution
    const points = [];

    // Reading pixel data is expensive, do it once.
    // Note: hiddenCanvas is not scaled by DPR for simpler sampling logic (1-to-1 mapping with logical coords? No, easier to match)
    // Actually, if we want crisp dots, we define grid in logical pixels.
    // So hidden canvas should match logical dimensions.

    // Get image data
    const imageData = hiddenCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
            const i = (y * width + x) * 4;
            // Check Red channel
            if (data[i] > 100) {
                points.push({ x, y });
            }
        }
    }
    console.log(`[DottedMap] Generated ${points.length} points.`);

    // Colors
    // Force a visible color for testing if var not found, but try computed style first
    let dotColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
    if (!dotColor) dotColor = '#aaaaaa';

    // Check if black on black?
    // If bg is black, text-color should be white.
    // We'll trust the variable for now but add a backup.

    const markerColor = '#FFA500';

    // Animation Loop
    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Dynamic Color Logic
        // Check body class for 'dark-mode' to decide robustly if needed, 
        // but prefer computing style if variable updates correctly.
        const bodyStyle = getComputedStyle(document.body);
        let dotColor = bodyStyle.getPropertyValue('--text-color').trim();

        // Fallback or override for visual clarity
        // If background is white (light mode), text is black #000. 
        // 0.4 opacity black is gray. 
        // If background is black (dark mode), text is white #fff.
        // 0.4 opacity white is gray.

        // We want crisp dots.
        // Use a base opacity but maybe higher?
        const isDark = document.body.classList.contains('dark-mode');
        // Light mode: make dots distinct (e.g. #333 with 0.6 opacity)
        // Dark mode: make dots distinct (e.g. #ccc with 0.5 opacity)

        // Actually, just use the text color but with higher opacity for better visibility
        // wrapperColor handles rgba conversion

        ctx.fillStyle = wrapperColor(dotColor, isDark ? 0.35 : 0.5);

        points.forEach(p => {
            ctx.beginPath();
            // ctx.fillRect(p.x, p.y, 1.5, 1.5); 
            ctx.arc(p.x, p.y, 1.2, 0, 2 * Math.PI); // Arc looks smoother for "dotted" map
            ctx.fill();
        });

        // Draw Markers
        markers.forEach(m => {
            const coords = projection([m.lng, m.lat]);
            if (coords) {
                const [mx, my] = coords;
                const pulse = 1 + Math.sin(time) * 0.3;

                ctx.fillStyle = markerColor;
                ctx.beginPath();
                ctx.arc(mx, my, 3 * pulse, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = markerColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(mx, my, 6 + (pulse * 3), 0, 2 * Math.PI);
                ctx.stroke();
            }
        });

        time += 0.04;
        requestAnimationFrame(animate);
    }

    // Helper to parse CSS color
    function wrapperColor(c, alpha) {
        if (!c) return `rgba(100,100,100,${alpha})`;
        if (c.startsWith('#')) {
            let r = parseInt(c.slice(1, 3), 16);
            let g = parseInt(c.slice(3, 5), 16);
            let b = parseInt(c.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        // If it's rgb string, inject alpha? generic fallback
        return c;
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const dims = resize();
        width = dims.width;
        height = dims.height;

        projection.fitSize([width, height], sphere);

        // Re-sample
        hiddenCanvas.width = width;
        hiddenCanvas.height = height;
        hiddenCtx.clearRect(0, 0, width, height);

        const newPath = d3.geoPath(projection, hiddenCtx);

        hiddenCtx.fillStyle = '#fff';
        hiddenCtx.beginPath();
        newPath(land);
        hiddenCtx.fill();

        const newImg = hiddenCtx.getImageData(0, 0, width, height);
        const newData = newImg.data;

        points.length = 0;
        for (let y = 0; y < height; y += spacing) {
            for (let x = 0; x < width; x += spacing) {
                const i = (y * width + x) * 4;
                if (newData[i] > 100) points.push({ x, y });
            }
        }
        console.log(`[DottedMap] Resized to ${width}x${height}, ${points.length} points.`);
    });
}

// Expose to window
window.initDottedMap = initDottedMap;
