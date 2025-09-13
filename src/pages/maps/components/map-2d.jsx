import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/providers/theme-provider';

const Map2D = React.forwardRef(({ is3D, drawingMode, onDrawingModeChange, onDrawingStateChange, trajectoryData }, ref) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawingLayerRef = useRef(null);
  const trajectoryLayerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);

  // Expose map through ref
  React.useImperativeHandle(ref, () => ({
    map: mapRef.current,
    clearDrawings: () => {
      if (drawingLayerRef.current) {
        drawingLayerRef.current.clearLayers();
      }
    }
  }));

  useEffect(() => {
    if (is3D || !mapContainerRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCSS.crossOrigin = '';
        document.head.appendChild(leafletCSS);
      }

      // Add Leaflet JS
      if (!window.L) {
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        leafletScript.crossOrigin = '';
        leafletScript.onload = initializeMap;
        document.head.appendChild(leafletScript);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!window.L || !mapContainerRef.current || mapRef.current) return;

      // Initialize the map
      mapRef.current = window.L.map(mapContainerRef.current, {
        center: [51.505, -0.09],
        zoom: 6,
        zoomControl: false
      });

      // Add tile layer based on theme
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      const tileLayer = isDark
        ? window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        })
        : window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 20
        });

      tileLayer.addTo(mapRef.current);

      // Create drawing layer
      drawingLayerRef.current = window.L.layerGroup().addTo(mapRef.current);

      // Create trajectory layer
      trajectoryLayerRef.current = window.L.layerGroup().addTo(mapRef.current);

      // Plot initial trajectory
      plotTrajectoryData();

      // Initialize drawing functionality
      initializeDrawingTools();
    };

    const plotTrajectoryData = () => {
      if (!mapRef.current || !window.L || !trajectoryLayerRef.current) return;

      // Clear existing trajectory
      trajectoryLayerRef.current.clearLayers();

      // Default trajectory data
      const defaultTrajectory = [
        [-9.857, 55.953],
        [-9.925, 55.695],
        [-10.024, 55.666],
        [-9.986, 55.492],
        [-9.825, 55.439],
        [-9.712, 55.321],
        [-9.743, 55.198],
        [-9.989, 55.202],
        [-10.059, 55.142],
        [-10.105, 55.066],
        [-10.221, 54.957],
        [-10.151, 54.768],
        [-10.25, 54.724],
        [-10.158, 54.561],
        [-10.114, 54.538],
        [-10.232, 54.476],
        [-10.318, 54.519],
        [-10.145, 54.781],
        [-10.326, 54.926],
        [-10.48, 54.816],
        [-10.462, 54.622],
        [-9.912, 54.05],
        [-9.638, 53.872],
        [-9.265, 51.97],
        [-9.211, 51.855],
        [-9.329, 51.539],
        [-9.278, 51.532],
        [-9.096, 51.515],
        [-9.121, 50.968],
        [-9.746, 50.338],
        [-9.767, 50.009],
        [-9.687, 49.661],
        [-9.976, 49.439],
        [-10.5, 48.909],
        [-10.768, 48.779],
        [-11.298, 48.441],
        [-11.27, 48.626],
        [-11.456, 47.485],
        [-11.309, 47.268],
        [-11.254, 47.419],
        [-11.534, 47.242],
        [-11.782, 47.207],
        [-11.834, 46.818],
        [-12.083, 47.147],
        [-11.565, 47.577],
        [-11.756, 47.298],
        [-11.998, 47.161],
        [-12.368, 47.239],
        [-12.335, 47.467],
        [-12.162, 47.161],
        [-11.861, 46.745],
        [-11.729, 46.642],
        [-11.759, 46.567],
        [-11.775, 47.377],
        [-10.918, 47.34],
        [-11.047, 45.519],
        [-11.113, 44.803],
        [-10.635, 44.602],
        [-10.838, 44.305],
        [-11.295, 44.251],
        [-11.039, 43.669],
        [-10.621, 42.856],
        [-10.658, 42.343],
        [-10.326, 42.032],
        [-10.644, 41.592],
        [-11.151, 41.411],
        [-10.958, 41.303],
        [-10.057, 40.944],
        [-10.1, 40.879],
        [-10.093, 40.764],
        [-10.144, 40.745],
        [-9.918, 40.713],
        [-10.281, 41.028],
        [-10.169, 40.855],
        [-9.987, 40.709],
        [-9.875, 40.533],
        [-9.741, 40.353],
        [-9.605, 40.155],
        [-9.414, 40.07],
        [-9.374, 40.057],
        [-9.089, 39.889],
        [-8.747, 39.816],
        [-8.46, 39.717]
      ];

      // Use uploaded trajectory data or default data
      const currentTrajectory = trajectoryData || defaultTrajectory;

      // Convert to Leaflet LatLng format (note: Leaflet uses [lat, lng], but our data is [lng, lat])
      const latLngs = currentTrajectory.map(coord => [coord[1], coord[0]]);

      // Create polyline for trajectory
      const trajectoryLine = window.L.polyline(latLngs, {
        color: trajectoryData ? '#00ffff' : '#ffff00', // cyan for uploaded, yellow for default
        weight: 3,
        opacity: 0.8
      });

      // Add trajectory to layer
      trajectoryLayerRef.current.addLayer(trajectoryLine);

      // Add start point marker
      const startMarker = window.L.circleMarker([latLngs[0][0], latLngs[0][1]], {
        radius: 8,
        fillColor: '#00ff00',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup('Start Position');

      trajectoryLayerRef.current.addLayer(startMarker);

      // Add end point marker
      const endLatLng = latLngs[latLngs.length - 1];
      const endMarker = window.L.circleMarker([endLatLng[0], endLatLng[1]], {
        radius: 10,
        fillColor: trajectoryData ? '#00ff00' : '#ff0000',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup('Last Known Position');

      trajectoryLayerRef.current.addLayer(endMarker);

      // Fit map to trajectory bounds
      mapRef.current.fitBounds(trajectoryLine.getBounds(), { padding: [20, 20] });
    };

    const initializeDrawingTools = () => {
      if (!mapRef.current || !window.L) return;

      // Store reference to plot function for use in drawing tools
      mapRef.current.plotTrajectoryData = plotTrajectoryData;
    };

    loadLeaflet();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [is3D, theme]);

  // Effect to handle trajectory data changes
  useEffect(() => {
    if (mapRef.current && !is3D && window.L && trajectoryLayerRef.current) {
      // Re-plot trajectory when data changes
      const plotTrajectoryData = () => {
        // Clear existing trajectory
        trajectoryLayerRef.current.clearLayers();

        // Default trajectory data
        const defaultTrajectory = [
          [-9.857, 55.953],
          [-9.925, 55.695],
          [-10.024, 55.666],
          [-9.986, 55.492],
          [-9.825, 55.439],
          [-9.712, 55.321],
          [-9.743, 55.198],
          [-9.989, 55.202],
          [-10.059, 55.142],
          [-10.105, 55.066],
          [-10.221, 54.957],
          [-10.151, 54.768],
          [-10.25, 54.724],
          [-10.158, 54.561],
          [-10.114, 54.538],
          [-10.232, 54.476],
          [-10.318, 54.519],
          [-10.145, 54.781],
          [-10.326, 54.926],
          [-10.48, 54.816],
          [-10.462, 54.622],
          [-9.912, 54.05],
          [-9.638, 53.872],
          [-9.265, 51.97],
          [-9.211, 51.855],
          [-9.329, 51.539],
          [-9.278, 51.532],
          [-9.096, 51.515],
          [-9.121, 50.968],
          [-9.746, 50.338],
          [-9.767, 50.009],
          [-9.687, 49.661],
          [-9.976, 49.439],
          [-10.5, 48.909],
          [-10.768, 48.779],
          [-11.298, 48.441],
          [-11.27, 48.626],
          [-11.456, 47.485],
          [-11.309, 47.268],
          [-11.254, 47.419],
          [-11.534, 47.242],
          [-11.782, 47.207],
          [-11.834, 46.818],
          [-12.083, 47.147],
          [-11.565, 47.577],
          [-11.756, 47.298],
          [-11.998, 47.161],
          [-12.368, 47.239],
          [-12.335, 47.467],
          [-12.162, 47.161],
          [-11.861, 46.745],
          [-11.729, 46.642],
          [-11.759, 46.567],
          [-11.775, 47.377],
          [-10.918, 47.34],
          [-11.047, 45.519],
          [-11.113, 44.803],
          [-10.635, 44.602],
          [-10.838, 44.305],
          [-11.295, 44.251],
          [-11.039, 43.669],
          [-10.621, 42.856],
          [-10.658, 42.343],
          [-10.326, 42.032],
          [-10.644, 41.592],
          [-11.151, 41.411],
          [-10.958, 41.303],
          [-10.057, 40.944],
          [-10.1, 40.879],
          [-10.093, 40.764],
          [-10.144, 40.745],
          [-9.918, 40.713],
          [-10.281, 41.028],
          [-10.169, 40.855],
          [-9.987, 40.709],
          [-9.875, 40.533],
          [-9.741, 40.353],
          [-9.605, 40.155],
          [-9.414, 40.07],
          [-9.374, 40.057],
          [-9.089, 39.889],
          [-8.747, 39.816],
          [-8.46, 39.717]
        ];

        // Use uploaded trajectory data or default data
        const currentTrajectory = trajectoryData || defaultTrajectory;

        // Convert to Leaflet LatLng format
        const latLngs = currentTrajectory.map(coord => [coord[1], coord[0]]);

        // Create polyline for trajectory
        const trajectoryLine = window.L.polyline(latLngs, {
          color: trajectoryData ? '#00ffff' : '#ffff00',
          weight: 3,
          opacity: 0.8
        });

        trajectoryLayerRef.current.addLayer(trajectoryLine);

        // Add start point marker
        const startMarker = window.L.circleMarker([latLngs[0][0], latLngs[0][1]], {
          radius: 8,
          fillColor: '#00ff00',
          color: '#000',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).bindPopup('Start Position');

        trajectoryLayerRef.current.addLayer(startMarker);

        // Add end point marker
        const endLatLng = latLngs[latLngs.length - 1];
        const endMarker = window.L.circleMarker([endLatLng[0], endLatLng[1]], {
          radius: 10,
          fillColor: trajectoryData ? '#00ff00' : '#ff0000',
          color: '#000',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).bindPopup('Last Known Position');

        trajectoryLayerRef.current.addLayer(endMarker);

        // Fit map to trajectory bounds
        mapRef.current.fitBounds(trajectoryLine.getBounds(), { padding: [20, 20] });
      };

      plotTrajectoryData();
    }
  }, [trajectoryData, is3D]);

  // Effect to handle drawing mode changes
  useEffect(() => {
    if (!mapRef.current || !window.L || is3D || !drawingLayerRef.current) return;

    // Clear any existing drawing handlers
    mapRef.current.off('click');
    mapRef.current.off('mousemove');

    if (drawingMode === 'polygon') {
      startPolygonDrawing();
    } else if (drawingMode === 'arc') {
      startCircleDrawing();
    }
  }, [drawingMode, is3D]);

  const startPolygonDrawing = () => {
    if (!mapRef.current || !window.L || !drawingLayerRef.current) return;

    setIsDrawing(true);
    if (onDrawingStateChange) onDrawingStateChange(true);

    let points = [];
    let tempLine = null;
    let markers = [];

    const addPoint = (e) => {
      const latlng = e.latlng;
      points.push(latlng);

      // Add point marker
      const marker = window.L.circleMarker(latlng, {
        radius: 6,
        fillColor: '#00ffff',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });

      markers.push(marker);
      drawingLayerRef.current.addLayer(marker);

      // Update temporary line
      if (tempLine) {
        drawingLayerRef.current.removeLayer(tempLine);
      }

      if (points.length > 1) {
        tempLine = window.L.polyline(points, {
          color: '#00ffff',
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 5'
        });
        drawingLayerRef.current.addLayer(tempLine);
      }
    };

    const finishPolygon = () => {
      if (points.length >= 3) {
        // Remove temporary elements
        if (tempLine) drawingLayerRef.current.removeLayer(tempLine);
        markers.forEach(marker => drawingLayerRef.current.removeLayer(marker));

        // Create final polygon
        const polygon = window.L.polygon(points, {
          color: '#ff8800',
          fillColor: '#ff8800',
          fillOpacity: 0.3,
          weight: 2
        });

        drawingLayerRef.current.addLayer(polygon);
      }

      // Clean up
      mapRef.current.off('click', addPoint);
      mapRef.current.off('contextmenu', finishPolygon);
      setIsDrawing(false);
      if (onDrawingStateChange) onDrawingStateChange(false);
      if (onDrawingModeChange) onDrawingModeChange(null);
    };

    mapRef.current.on('click', addPoint);
    mapRef.current.on('contextmenu', finishPolygon); // Right-click to finish
  };

  const startCircleDrawing = () => {
    if (!mapRef.current || !window.L || !drawingLayerRef.current) return;

    setIsDrawing(true);
    if (onDrawingStateChange) onDrawingStateChange(true);

    let center = null;
    let tempCircle = null;
    let centerMarker = null;

    const setCenter = (e) => {
      center = e.latlng;

      // Add center marker
      centerMarker = window.L.circleMarker(center, {
        radius: 8,
        fillColor: '#ffff00',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });
      drawingLayerRef.current.addLayer(centerMarker);

      // Remove click handler and add mousemove
      mapRef.current.off('click', setCenter);
      mapRef.current.on('mousemove', updateRadius);
      mapRef.current.on('click', finishCircle);
    };

    const updateRadius = (e) => {
      if (!center) return;

      const radius = center.distanceTo(e.latlng);

      if (tempCircle) {
        drawingLayerRef.current.removeLayer(tempCircle);
      }

      tempCircle = window.L.circle(center, {
        radius: radius,
        color: '#ffff00',
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '5, 5'
      });

      drawingLayerRef.current.addLayer(tempCircle);
    };

    const finishCircle = (e) => {
      if (!center) return;

      const radius = center.distanceTo(e.latlng);

      // Remove temporary elements
      if (tempCircle) drawingLayerRef.current.removeLayer(tempCircle);
      if (centerMarker) drawingLayerRef.current.removeLayer(centerMarker);

      // Create final circle
      const circle = window.L.circle(center, {
        radius: radius,
        color: '#00ff00',
        fillColor: '#00ff00',
        fillOpacity: 0.3,
        weight: 2
      });

      drawingLayerRef.current.addLayer(circle);

      // Clean up
      mapRef.current.off('mousemove', updateRadius);
      mapRef.current.off('click', finishCircle);
      setIsDrawing(false);
      if (onDrawingStateChange) onDrawingStateChange(false);
      if (onDrawingModeChange) onDrawingModeChange(null);
    };

    mapRef.current.on('click', setCenter);
  };

  if (is3D) return null;

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 w-full h-full"
      style={{
        background: 'transparent',
        zIndex: 1
      }}
    />
  );
});

Map2D.displayName = 'Map2D';

export default Map2D;