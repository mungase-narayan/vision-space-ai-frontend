import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/providers/theme-provider';
import { normalizeTrajectoryData, validateTrajectoryData } from '@/lib/trajectory-utils';

const Map2D = React.forwardRef(({ is3D, drawingMode, onDrawingModeChange, onDrawingStateChange, trajectoryData }, ref) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawingLayerRef = useRef(null);
  const trajectoryLayerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);


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

      // Add default tile layer (will be updated by theme effect)
      const tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20
      });

      tileLayer.addTo(mapRef.current);

      // Store reference to tile layer for theme switching
      mapRef.current._tileLayer = tileLayer;

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
        [-38.12099999999998, -0.984],
        [-38.03199999999998, -1.016],
        [-38.61500000000001, -0.688],
        [-39.37700000000001, -0.382],
        [-39.96800000000002, -0.507],
        [-40.74000000000001, -0.583],
        [-41.096000000000004, -0.371],
        [-40.903999999999996, -0.091],
        [-40.928, 0.669],
        [-40.59500000000003, -0.036],
        [-40.00999999999999, -0.898],
        [-39.041, -0.104],
        [-38.02800000000002, 0.693],
        [-37.10000000000002, 0.252],
        [-36.46300000000002, -0.164],
        [-35.884000000000015, 0.35],
        [-35.278999999999996, 1.005],
        [-34.613999999999976, 0.35],
        [-33.773000000000025, 0.215],
        [-33.29599999999999, -0.024],
        [-32.387, 0.079],
        [-31.480999999999995, -0.035],
        [-31.357000000000028, -0.064],
        [-30.57299999999998, -0.173],
        [-29.343000000000018, 0.359],
        [-28.468000000000018, 0.235],
        [-28.01600000000002, 0.42],
        [-27.73399999999998, 0.215],
        [-28.201999999999998, 0.531],
        [-28.552999999999997, 1.109],
        [-28.82299999999998, 0.531],
        [-29.02600000000001, -0.069],
        [-29.134000000000015, 0.422],
        [-28.458000000000027, 0.222],
        [-27.58699999999999, 0.257],
        [-26.994000000000028, -0.162],
        [-27.036999999999978, 0.066],
        [-26.52600000000001, 0.349],
        [-26.016999999999996, -0.114],
        [-25.180000000000007, -0.187],
        [-23.88299999999998, 0.352],
        [-22.396000000000015, 0.536],
        [-21.41500000000002, 0.322],
        [-21.081999999999994, 0.205],
        [-21.38900000000001, 0.212],
        [-22.048000000000002, 0.355],
        [-22.721000000000004, 0.744],
        [-23.315999999999974, 0.78],
        [-24.375, -0.074],
        [-25.37299999999999, -0.968],
        [-25.990999999999985, -0.897],
        [-26.68900000000002, -0.473],
        [-27.822000000000003, -0.553],
        [-28.73599999999999, -0.673],
        [-29.593000000000018, -0.912],
        [-29.750999999999976, -0.964],
        [-29.235000000000014, -1.501],
        [-28.839, -1.349],
        [-29.127999999999986, -0.754],
        [-29.61700000000002, -0.659],
        [-30.081000000000017, -0.784],
        [-30.434000000000026, -0.443],
        [-30.809000000000026, -0.736],
        [-30.966999999999985, -0.165],
        [-31.684000000000026, 0.26],
        [-32.78399999999999, 0.165],
        [-33.82499999999999, 0.109],
        [-34.43700000000001, -0.512],
        [-34.96199999999999, -0.805],
        [-35.53899999999999, -0.65],
        [-36.01799999999997, -0.634],
        [-36.72399999999999, -0.349],
        [-38.053, -0.309],
        [-39.50400000000002, -0.196],
        [-40.85899999999998, -0.301],
        [-41.865999999999985, -0.744],
        [-42.584, -0.578],
        [-43.454999999999984, -0.26],
        [-43.774, 0.259],
        [-43.774, 0.423],
        [-43.80200000000002, 1.101],
        [-44.047000000000025, 1.87],
        [-43.511000000000024, 1.9],
        [-43.048, 1.782],
        [-42.442999999999984, 2.022],
        [-42.593999999999994, 0.837],
        [-43.05500000000001, -0.277],
        [-43.000999999999976, -0.6],
        [-43.08499999999998, -0.035],
        [-41.827, 0.221],
        [-41.685, -0.634],
        [-43.52499999999998, -0.457],
        [-45.26400000000001, 1.529],
        [-45.93599999999998, 2.752],
        [-45.839, 2.919],
        [-45.87099999999998, 2.48],
        [-45.96100000000001, 2.442],
        [-46.218999999999994, 2.468],
        [-46.46100000000001, 2.351],
        [-46.497000000000014, 2.176],
        [-46.370000000000005, 2.009],
        [-46.53899999999999, 2.327],
        [-46.88499999999999, 2.891],
        [-47.528999999999996, 3.454],
        [-47.841999999999985, 3.659],
        [-47.58499999999998, 3.322],
        [-47.73700000000002, 3.621],
        [-48.329999999999984, 4.02],
        [-49.04399999999998, 4.386],
        [-49.49200000000002, 4.504],
        [-50.012, 4.944],
        [-50.261000000000024, 6.693],
        [-49.81400000000002, 6.752],
        [-50.639999999999986, 5.793],
        [-50.95600000000002, 5.695],
        [-51.32299999999998, 5.924],
        [-50.976, 5.687],
        [-50.879999999999995, 5.877],
        [-50.58800000000002, 6.319],
        [-50.24000000000001, 5.952],
        [-50.42700000000002, 5.507],
        [-50.285000000000025, 5.331],
        [-49.815, 4.763],
        [-48.73599999999999, 4.201],
        [-47.02999999999997, 3.086],
        [-45.024, 3.496],
        [-43.60500000000002, 2.495],
        [-43.53899999999999, 1.079],
        [-43.466999999999985, 0.65],
        [-43.82299999999998, 1.58],
        [-43.59800000000001, 2.197],
        [-41.903999999999996, 2.329],
        [-40.28800000000001, 2.121],
        [-38.922000000000025, 2.065],
        [-37.70100000000002, 1.662],
        [-36.96100000000001, 1.589],
        [-37.298, 1.358],
        [-37.90300000000002, 0.803],
        [-39.00799999999998, 0.638],
        [-40.13900000000001, 0.29],
        [-41.26600000000002, -0.014],
        [-42.185, -0.207],
        [-42.855999999999995, -0.469],
        [-43.247000000000014, -0.52],
        [-43.615999999999985, -0.262],
        [-44.678999999999974, 0.537],
        [-46.000999999999976, 1.548],
        [-46.297000000000025, 2.742],
        [-45.01799999999997, 2.688],
        [-43.718999999999994, 1.919],
        [-43.553, 1.289],
        [-44.764999999999986, 1.253],
        [-45.815999999999974, 2.814],
        [-44.807000000000016, 4.325]
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
  }, [is3D]);

  // Effect to handle theme changes without reinitializing
  useEffect(() => {
    if (mapRef.current && window.L && !is3D) {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      // Remove existing tile layer
      if (mapRef.current._tileLayer) {
        mapRef.current.removeLayer(mapRef.current._tileLayer);
      }

      // Add new tile layer based on theme
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
      mapRef.current._tileLayer = tileLayer;
    }
  }, [theme, is3D]);

  // Effect to handle trajectory data changes
  useEffect(() => {
    if (mapRef.current && !is3D && window.L && trajectoryLayerRef.current) {
      // Default trajectory data (ARGO float trajectory in Atlantic Ocean - stays in ocean waters)
      const defaultTrajectory = [
        [-38.12099999999998, -0.984],
        [-38.03199999999998, -1.016],
        [-38.61500000000001, -0.688],
        [-39.37700000000001, -0.382],
        [-39.96800000000002, -0.507],
        [-40.74000000000001, -0.583],
        [-41.096000000000004, -0.371],
        [-40.903999999999996, -0.091],
        [-40.928, 0.669],
        [-40.59500000000003, -0.036],
        [-40.00999999999999, -0.898],
        [-39.041, -0.104],
        [-38.02800000000002, 0.693],
        [-37.10000000000002, 0.252],
        [-36.46300000000002, -0.164],
        [-35.884000000000015, 0.35],
        [-35.278999999999996, 1.005],
        [-34.613999999999976, 0.35],
        [-33.773000000000025, 0.215],
        [-33.29599999999999, -0.024],
        [-32.387, 0.079],
        [-31.480999999999995, -0.035],
        [-31.357000000000028, -0.064],
        [-30.57299999999998, -0.173],
        [-29.343000000000018, 0.359],
        [-28.468000000000018, 0.235],
        [-28.01600000000002, 0.42],
        [-27.73399999999998, 0.215],
        [-28.201999999999998, 0.531],
        [-28.552999999999997, 1.109],
        [-28.82299999999998, 0.531],
        [-29.02600000000001, -0.069],
        [-29.134000000000015, 0.422],
        [-28.458000000000027, 0.222],
        [-27.58699999999999, 0.257],
        [-26.994000000000028, -0.162],
        [-27.036999999999978, 0.066],
        [-26.52600000000001, 0.349],
        [-26.016999999999996, -0.114],
        [-25.180000000000007, -0.187],
        [-23.88299999999998, 0.352],
        [-22.396000000000015, 0.536],
        [-21.41500000000002, 0.322],
        [-21.081999999999994, 0.205],
        [-21.38900000000001, 0.212],
        [-22.048000000000002, 0.355],
        [-22.721000000000004, 0.744],
        [-23.315999999999974, 0.78],
        [-24.375, -0.074],
        [-25.37299999999999, -0.968],
        [-25.990999999999985, -0.897],
        [-26.68900000000002, -0.473],
        [-27.822000000000003, -0.553],
        [-28.73599999999999, -0.673],
        [-29.593000000000018, -0.912],
        [-29.750999999999976, -0.964],
        [-29.235000000000014, -1.501],
        [-28.839, -1.349],
        [-29.127999999999986, -0.754],
        [-29.61700000000002, -0.659],
        [-30.081000000000017, -0.784],
        [-30.434000000000026, -0.443],
        [-30.809000000000026, -0.736],
        [-30.966999999999985, -0.165],
        [-31.684000000000026, 0.26],
        [-32.78399999999999, 0.165],
        [-33.82499999999999, 0.109],
        [-34.43700000000001, -0.512],
        [-34.96199999999999, -0.805],
        [-35.53899999999999, -0.65],
        [-36.01799999999997, -0.634],
        [-36.72399999999999, -0.349],
        [-38.053, -0.309],
        [-39.50400000000002, -0.196],
        [-40.85899999999998, -0.301],
        [-41.865999999999985, -0.744],
        [-42.584, -0.578],
        [-43.454999999999984, -0.26],
        [-43.774, 0.259],
        [-43.774, 0.423],
        [-43.80200000000002, 1.101],
        [-44.047000000000025, 1.87],
        [-43.511000000000024, 1.9],
        [-43.048, 1.782],
        [-42.442999999999984, 2.022],
        [-42.593999999999994, 0.837],
        [-43.05500000000001, -0.277],
        [-43.000999999999976, -0.6],
        [-43.08499999999998, -0.035],
        [-41.827, 0.221],
        [-41.685, -0.634],
        [-43.52499999999998, -0.457],
        [-45.26400000000001, 1.529],
        [-45.93599999999998, 2.752],
        [-45.839, 2.919],
        [-45.87099999999998, 2.48],
        [-45.96100000000001, 2.442],
        [-46.218999999999994, 2.468],
        [-46.46100000000001, 2.351],
        [-46.497000000000014, 2.176],
        [-46.370000000000005, 2.009],
        [-46.53899999999999, 2.327],
        [-46.88499999999999, 2.891],
        [-47.528999999999996, 3.454],
        [-47.841999999999985, 3.659],
        [-47.58499999999998, 3.322],
        [-47.73700000000002, 3.621],
        [-48.329999999999984, 4.02],
        [-49.04399999999998, 4.386],
        [-49.49200000000002, 4.504],
        [-50.012, 4.944],
        [-50.261000000000024, 6.693],
        [-49.81400000000002, 6.752],
        [-50.639999999999986, 5.793],
        [-50.95600000000002, 5.695],
        [-51.32299999999998, 5.924],
        [-50.976, 5.687],
        [-50.879999999999995, 5.877],
        [-50.58800000000002, 6.319],
        [-50.24000000000001, 5.952],
        [-50.42700000000002, 5.507],
        [-50.285000000000025, 5.331],
        [-49.815, 4.763],
        [-48.73599999999999, 4.201],
        [-47.02999999999997, 3.086],
        [-45.024, 3.496],
        [-43.60500000000002, 2.495],
        [-43.53899999999999, 1.079],
        [-43.466999999999985, 0.65],
        [-43.82299999999998, 1.58],
        [-43.59800000000001, 2.197],
        [-41.903999999999996, 2.329],
        [-40.28800000000001, 2.121],
        [-38.922000000000025, 2.065],
        [-37.70100000000002, 1.662],
        [-36.96100000000001, 1.589],
        [-37.298, 1.358],
        [-37.90300000000002, 0.803],
        [-39.00799999999998, 0.638],
        [-40.13900000000001, 0.29],
        [-41.26600000000002, -0.014],
        [-42.185, -0.207],
        [-42.855999999999995, -0.469],
        [-43.247000000000014, -0.52],
        [-43.615999999999985, -0.262],
        [-44.678999999999974, 0.537],
        [-46.000999999999976, 1.548],
        [-46.297000000000025, 2.742],
        [-45.01799999999997, 2.688],
        [-43.718999999999994, 1.919],
        [-43.553, 1.289],
        [-44.764999999999986, 1.253],
        [-45.815999999999974, 2.814],
        [-44.807000000000016, 4.325]
      ];

      // Use uploaded trajectory data or default data
      let currentTrajectory = trajectoryData || defaultTrajectory;

      // If we have uploaded data, normalize and validate it
      if (trajectoryData) {
        const validation = validateTrajectoryData(trajectoryData);
        if (!validation.isValid) {
          console.error('Invalid trajectory data:', validation.errors);
          return;
        }

        if (validation.warnings.length > 0) {
          console.warn('Trajectory data warnings:', validation.warnings);
        }

        // Normalize coordinate format to [longitude, latitude]
        currentTrajectory = normalizeTrajectoryData(trajectoryData);
      }

      // Debug logging
      console.log('Leaflet 2D - Plotting trajectory:', {
        isUploadedData: !!trajectoryData,
        coordinateCount: currentTrajectory.length,
        firstCoord: currentTrajectory[0],
        lastCoord: currentTrajectory[currentTrajectory.length - 1],
        sampleCoords: currentTrajectory.slice(0, 3)
      });

      // Final validation check
      if (!Array.isArray(currentTrajectory) || currentTrajectory.length === 0) {
        console.warn('Invalid trajectory data format after processing');
        return;
      }

      // Clear existing trajectory
      trajectoryLayerRef.current.clearLayers();

      // Convert from [longitude, latitude] to [latitude, longitude] for Leaflet
      const latLngs = currentTrajectory.map(coord => [coord[1], coord[0]]);

      // Create polyline for trajectory
      const trajectoryLine = window.L.polyline(latLngs, {
        color: trajectoryData ? '#00ffff' : '#ffff00', // cyan for uploaded, yellow for default
        weight: 3,
        opacity: 0.8
      });

      trajectoryLayerRef.current.addLayer(trajectoryLine);

      // Add start point marker
      const startLatLng = latLngs[0];
      const startMarker = window.L.circleMarker(startLatLng, {
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
      const endMarker = window.L.circleMarker(endLatLng, {
        radius: 10,
        fillColor: trajectoryData ? '#00ff00' : '#ff0000', // green for uploaded, red for default
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup('Last Known Position');

      trajectoryLayerRef.current.addLayer(endMarker);

      // Fit map to trajectory bounds with padding
      mapRef.current.fitBounds(trajectoryLine.getBounds(), {
        padding: [20, 20],
        maxZoom: 10 // Prevent zooming in too much
      });
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