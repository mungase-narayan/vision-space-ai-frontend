import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/providers/theme-provider';

const CesiumViewer = ({ is3D }) => {
    const { theme } = useTheme();
    const cesiumContainerRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!is3D || !cesiumContainerRef.current) return;

        // Load Cesium dynamically
        const loadCesium = async () => {
            // Add Cesium CSS
            if (!document.querySelector('link[href*="cesium"]')) {
                const cesiumCSS = document.createElement('link');
                cesiumCSS.rel = 'stylesheet';
                cesiumCSS.href = 'https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium/Widgets/widgets.css';
                document.head.appendChild(cesiumCSS);
            }

            // Add Cesium JS
            if (!window.Cesium) {
                const cesiumScript = document.createElement('script');
                cesiumScript.src = 'https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium/Cesium.js';
                cesiumScript.onload = initializeCesium;
                document.head.appendChild(cesiumScript);
            } else {
                initializeCesium();
            }
        };

        const initializeCesium = () => {
            if (!window.Cesium || !cesiumContainerRef.current) return;

            // Set Cesium Ion access token
            window.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxOGQ0ZDU3Yi1jNTU1LTRmMWItYTU0NC0yMzZhOWUzMWIwZjMiLCJpZCI6MzQwMDc3LCJpYXQiOjE3NTc0OTk5OTB9.pTzK7CubJmdOAfVLfmogsLMFfBaJMo44wz4yH4zYrqU';

            // Initialize the Cesium Viewer
            viewerRef.current = new window.Cesium.Viewer(cesiumContainerRef.current, {
                terrain: window.Cesium.Terrain.fromWorldTerrain(),
                homeButton: false,
                sceneModePicker: false,
                baseLayerPicker: false,
                navigationHelpButton: false,
                animation: false,
                timeline: false,
                fullscreenButton: false,
                vrButton: false,
                geocoder: false,
                infoBox: false,
                selectionIndicator: false,
            });

            // Apply theme-based styling
            const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (isDark) {
                viewerRef.current.scene.backgroundColor = window.Cesium.Color.fromCssColorString('#0f172a');
            }

            // Mock ARGO Float Data
            const mockFloatTrajectory = [
                [70.0, 15.0], [70.1, 15.2], [70.3, 15.5], [70.5, 15.7],
                [70.6, 15.9], [70.8, 16.1], [71.0, 16.3], [71.2, 16.5],
                [71.4, 16.7], [71.6, 16.9], [71.8, 17.1],
            ];
            const lastKnownPosition = mockFloatTrajectory[mockFloatTrajectory.length - 1];

            // Add the Trajectory Path (Polyline)
            viewerRef.current.entities.add({
                name: "ARGO Float Trajectory",
                polyline: {
                    positions: window.Cesium.Cartesian3.fromDegreesArray(mockFloatTrajectory.flat()),
                    width: 3,
                    material: window.Cesium.Color.YELLOW,
                    clampToGround: true
                },
            });

            // Add the Final Position (Point)
            viewerRef.current.entities.add({
                name: "Last Known Position",
                position: window.Cesium.Cartesian3.fromDegrees(lastKnownPosition[0], lastKnownPosition[1]),
                point: {
                    pixelSize: 10,
                    color: window.Cesium.Color.RED,
                    outlineColor: window.Cesium.Color.BLACK,
                    outlineWidth: 2,
                },
            });

            // Fly the camera to the float's location
            viewerRef.current.camera.flyTo({
                destination: window.Cesium.Cartesian3.fromDegrees(lastKnownPosition[0], lastKnownPosition[1], 1000000),
                orientation: {
                    heading: window.Cesium.Math.toRadians(0.0),
                    pitch: window.Cesium.Math.toRadians(-60.0),
                }
            });
        };

        loadCesium();

        // Cleanup function
        return () => {
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [is3D]);

    if (!is3D) return null;

    return (
        <div
            ref={cesiumContainerRef}
            className="absolute inset-0 w-full h-full"
            style={{
                background: 'transparent',
                zIndex: 1
            }}
        />
    );
};

export default CesiumViewer;