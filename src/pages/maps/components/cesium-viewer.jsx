import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/providers/theme-provider';

const CesiumViewer = React.forwardRef(({ is3D, onDrawingModeChange, drawingMode, onDrawingStateChange, trajectoryData }, ref) => {
    const { theme } = useTheme();
    const cesiumContainerRef = useRef(null);
    const viewerRef = useRef(null);
    const drawingHandlerRef = useRef(null);
    const activePointsRef = useRef([]);
    const [isDrawing, setIsDrawing] = useState(false);

    // Expose viewer through ref
    React.useImperativeHandle(ref, () => ({
        viewer: viewerRef.current
    }));

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
            if (!window.Cesium || !cesiumContainerRef.current || viewerRef.current) return;

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

            // Plot trajectory data
            plotTrajectoryData();

            // Initialize drawing functionality
            initializeDrawingTools();
        };

        const plotTrajectoryData = () => {
            if (!viewerRef.current || !window.Cesium) return;

            // Default trajectory data (ARGO float trajectory in Atlantic Ocean - stays in ocean waters)
            const defaultTrajectory = [
                [-15.2, 60.1],   // North Atlantic, west of Scotland
                [-15.8, 59.3],   // Moving southwest in deep ocean
                [-16.5, 58.2],   // Continuing in Atlantic
                [-17.1, 57.1],   // Deep Atlantic waters
                [-17.8, 55.9],   // West of Ireland in ocean
                [-18.2, 54.7],   // Atlantic Ocean
                [-18.9, 53.4],   // Deep ocean west of Ireland
                [-19.3, 52.1],   // Atlantic Ocean
                [-19.8, 50.8],   // Bay of Biscay area (ocean)
                [-20.1, 49.5],   // Atlantic Ocean
                [-20.5, 48.2],   // Deep Atlantic
                [-20.9, 46.9],   // Atlantic Ocean
                [-21.2, 45.6],   // Deep ocean
                [-21.6, 44.3],   // Atlantic Ocean
                [-22.0, 43.0],   // Ocean west of Spain
                [-22.3, 41.7],   // Atlantic Ocean
                [-22.7, 40.4],   // Deep Atlantic
                [-23.0, 39.1],   // Ocean west of Portugal
                [-23.4, 37.8],   // Atlantic Ocean
                [-23.7, 36.5],   // Deep ocean
                [-24.1, 35.2],   // Atlantic Ocean
                [-24.4, 33.9],   // Ocean waters
                [-24.8, 32.6],   // Atlantic Ocean
                [-25.1, 31.3],   // Deep ocean
                [-25.5, 30.0],   // Atlantic Ocean
                [-25.8, 28.7],   // Ocean near Canary Islands
                [-26.2, 27.4],   // Atlantic Ocean
                [-26.5, 26.1],   // Deep ocean
                [-26.9, 24.8],   // Atlantic Ocean
                [-27.2, 23.5],   // Ocean waters
                [-27.6, 22.2],   // Atlantic Ocean
                [-27.9, 20.9],   // Deep ocean
                [-28.3, 19.6],   // Atlantic Ocean
                [-28.6, 18.3],   // Ocean waters
                [-29.0, 17.0],   // Atlantic Ocean
                [-29.3, 15.7],   // Deep ocean
                [-29.7, 14.4],   // Atlantic Ocean
                [-30.0, 13.1],   // Ocean waters
                [-30.4, 11.8],   // Atlantic Ocean
                [-30.7, 10.5]    // Deep Atlantic Ocean
            ];

            // Use default trajectory for initial load (uploaded data handled by useEffect)
            const currentTrajectory = defaultTrajectory;
            const lastKnownPosition = currentTrajectory[currentTrajectory.length - 1];

            // Remove existing trajectory entities
            const entitiesToRemove = [];
            viewerRef.current.entities.values.forEach(entity => {
                if (entity.name && (
                    entity.name.includes('Trajectory') ||
                    entity.name.includes('Last Known Position')
                )) {
                    entitiesToRemove.push(entity);
                }
            });
            entitiesToRemove.forEach(entity => viewerRef.current.entities.remove(entity));

            // Add the Trajectory Path (Polyline)
            viewerRef.current.entities.add({
                name: trajectoryData ? "Uploaded Trajectory" : "ARGO Float Trajectory",
                polyline: {
                    positions: window.Cesium.Cartesian3.fromDegreesArray(currentTrajectory.flat()),
                    width: 3,
                    material: trajectoryData ? window.Cesium.Color.CYAN : window.Cesium.Color.YELLOW,
                    clampToGround: true
                },
            });

            // Add the Final Position (Point)
            viewerRef.current.entities.add({
                name: "Last Known Position",
                position: window.Cesium.Cartesian3.fromDegrees(lastKnownPosition[0], lastKnownPosition[1]),
                point: {
                    pixelSize: 10,
                    color: trajectoryData ? window.Cesium.Color.LIME : window.Cesium.Color.RED,
                    outlineColor: window.Cesium.Color.BLACK,
                    outlineWidth: 2,
                },
            });

            // Fly the camera to the trajectory location
            viewerRef.current.camera.flyTo({
                destination: window.Cesium.Cartesian3.fromDegrees(lastKnownPosition[0], lastKnownPosition[1], 1000000),
                orientation: {
                    heading: window.Cesium.Math.toRadians(0.0),
                    pitch: window.Cesium.Math.toRadians(-60.0),
                }
            });
        };

        const initializeDrawingTools = () => {
            if (!viewerRef.current || !window.Cesium) return;

            const viewer = viewerRef.current;
            const scene = viewer.scene;
            const canvas = viewer.canvas;

            // Disable default double-click behavior
            viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(window.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            // Create drawing handler
            drawingHandlerRef.current = new window.Cesium.ScreenSpaceEventHandler(canvas);

            // Function to start polygon drawing
            const startPolygonDrawing = () => {
                if (isDrawing) return;
                setIsDrawing(true);
                if (onDrawingStateChange) {
                    onDrawingStateChange(true);
                }
                activePointsRef.current = [];

                const dynamicPositions = new window.Cesium.CallbackProperty(() => {
                    return new window.Cesium.PolygonHierarchy(activePointsRef.current);
                }, false);

                const dynamicPolygon = viewer.entities.add({
                    name: 'Dynamic Polygon',
                    polygon: {
                        hierarchy: dynamicPositions,
                        material: window.Cesium.Color.CYAN.withAlpha(0.3),
                        outline: true,
                        outlineColor: window.Cesium.Color.CYAN,
                        extrudedHeight: 0,
                        height: 0,
                    }
                });

                // Left click to add points
                drawingHandlerRef.current.setInputAction((event) => {
                    const pickedPosition = viewer.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
                    if (pickedPosition) {
                        activePointsRef.current.push(pickedPosition);

                        // Add point marker
                        viewer.entities.add({
                            name: 'Polygon Point',
                            position: pickedPosition,
                            point: {
                                pixelSize: 8,
                                color: window.Cesium.Color.CYAN,
                                outlineColor: window.Cesium.Color.WHITE,
                                outlineWidth: 2,
                                heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND
                            }
                        });
                    }
                }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);

                // Right click or double click to finish
                const finishDrawing = () => {
                    if (activePointsRef.current.length >= 3) {
                        // Create final polygon
                        viewer.entities.add({
                            name: 'Completed Polygon',
                            polygon: {
                                hierarchy: new window.Cesium.PolygonHierarchy(activePointsRef.current),
                                material: window.Cesium.Color.ORANGE.withAlpha(0.4),
                                outline: true,
                                outlineColor: window.Cesium.Color.ORANGE,
                                extrudedHeight: 0,
                                height: 0,
                            }
                        });
                    }

                    // Clean up
                    viewer.entities.remove(dynamicPolygon);
                    cleanupDrawing();
                };

                drawingHandlerRef.current.setInputAction(finishDrawing, window.Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                drawingHandlerRef.current.setInputAction(finishDrawing, window.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            };

            // Function to start arc/circle drawing
            const startArcDrawing = () => {
                if (isDrawing) return;
                setIsDrawing(true);
                if (onDrawingStateChange) {
                    onDrawingStateChange(true);
                }
                let centerPoint = null;
                let radiusPoint = null;

                // First click sets center
                drawingHandlerRef.current.setInputAction((event) => {
                    const pickedPosition = viewer.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
                    if (pickedPosition && !centerPoint) {
                        centerPoint = pickedPosition;

                        // Add center point marker
                        viewer.entities.add({
                            name: 'Arc Center',
                            position: centerPoint,
                            point: {
                                pixelSize: 10,
                                color: window.Cesium.Color.YELLOW,
                                outlineColor: window.Cesium.Color.BLACK,
                                outlineWidth: 2,
                                heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND
                            }
                        });

                        // Create dynamic circle
                        const dynamicRadius = new window.Cesium.CallbackProperty(() => {
                            if (!radiusPoint) return 100000; // Default radius
                            return window.Cesium.Cartesian3.distance(centerPoint, radiusPoint);
                        }, false);

                        const dynamicCircle = viewer.entities.add({
                            name: 'Dynamic Circle',
                            position: centerPoint,
                            ellipse: {
                                semiMajorAxis: dynamicRadius,
                                semiMinorAxis: dynamicRadius,
                                material: window.Cesium.Color.YELLOW.withAlpha(0.3),
                                outline: true,
                                outlineColor: window.Cesium.Color.YELLOW,
                                height: 0,
                            }
                        });

                        // Mouse move to show dynamic radius
                        drawingHandlerRef.current.setInputAction((moveEvent) => {
                            const movePosition = viewer.camera.pickEllipsoid(moveEvent.endPosition, scene.globe.ellipsoid);
                            if (movePosition) {
                                radiusPoint = movePosition;
                            }
                        }, window.Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                        // Second click to set radius and finish
                        drawingHandlerRef.current.setInputAction((secondEvent) => {
                            const finalPosition = viewer.camera.pickEllipsoid(secondEvent.position, scene.globe.ellipsoid);
                            if (finalPosition && centerPoint) {
                                const finalRadius = window.Cesium.Cartesian3.distance(centerPoint, finalPosition);

                                // Create final circle
                                viewer.entities.add({
                                    name: 'Completed Circle',
                                    position: centerPoint,
                                    ellipse: {
                                        semiMajorAxis: finalRadius,
                                        semiMinorAxis: finalRadius,
                                        material: window.Cesium.Color.LIME.withAlpha(0.4),
                                        outline: true,
                                        outlineColor: window.Cesium.Color.LIME,
                                        height: 0,
                                    }
                                });

                                // Clean up
                                viewer.entities.remove(dynamicCircle);
                                cleanupDrawing();
                            }
                        }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    }
                }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
            };

            // Function to clean up drawing state
            const cleanupDrawing = () => {
                setIsDrawing(false);
                if (onDrawingStateChange) {
                    onDrawingStateChange(false);
                }
                activePointsRef.current = [];
                if (drawingHandlerRef.current) {
                    drawingHandlerRef.current.removeInputAction(window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    drawingHandlerRef.current.removeInputAction(window.Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                    drawingHandlerRef.current.removeInputAction(window.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                    drawingHandlerRef.current.removeInputAction(window.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                if (onDrawingModeChange) {
                    onDrawingModeChange(null);
                }
            };

            // Expose drawing functions
            viewer.startPolygonDrawing = startPolygonDrawing;
            viewer.startArcDrawing = startArcDrawing;
            viewer.cleanupDrawing = cleanupDrawing;
        };

        loadCesium();

        // Cleanup function
        return () => {
            if (drawingHandlerRef.current) {
                drawingHandlerRef.current.destroy();
                drawingHandlerRef.current = null;
            }
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [is3D]);

    // Effect to handle theme changes without reinitializing
    useEffect(() => {
        if (viewerRef.current && window.Cesium) {
            const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            viewerRef.current.scene.backgroundColor = isDark
                ? window.Cesium.Color.fromCssColorString('#0f172a')
                : window.Cesium.Color.fromCssColorString('#87CEEB'); // Light blue for light theme
        }
    }, [theme]);

    // Effect to handle drawing mode changes
    useEffect(() => {
        if (viewerRef.current && drawingMode) {
            if (drawingMode === 'polygon') {
                viewerRef.current.startPolygonDrawing();
            } else if (drawingMode === 'arc') {
                viewerRef.current.startArcDrawing();
            }
        }
    }, [drawingMode]);

    // Effect to handle trajectory data changes
    useEffect(() => {
        if (viewerRef.current && window.Cesium && is3D) {
            // Default trajectory data (ARGO float trajectory in Atlantic Ocean - stays in ocean waters)
            const defaultTrajectory = [
                [-15.2, 60.1],   // North Atlantic, west of Scotland
                [-15.8, 59.3],   // Moving southwest in deep ocean
                [-16.5, 58.2],   // Continuing in Atlantic
                [-17.1, 57.1],   // Deep Atlantic waters
                [-17.8, 55.9],   // West of Ireland in ocean
                [-18.2, 54.7],   // Atlantic Ocean
                [-18.9, 53.4],   // Deep ocean west of Ireland
                [-19.3, 52.1],   // Atlantic Ocean
                [-19.8, 50.8],   // Bay of Biscay area (ocean)
                [-20.1, 49.5],   // Atlantic Ocean
                [-20.5, 48.2],   // Deep Atlantic
                [-20.9, 46.9],   // Atlantic Ocean
                [-21.2, 45.6],   // Deep ocean
                [-21.6, 44.3],   // Atlantic Ocean
                [-22.0, 43.0],   // Ocean west of Spain
                [-22.3, 41.7],   // Atlantic Ocean
                [-22.7, 40.4],   // Deep Atlantic
                [-23.0, 39.1],   // Ocean west of Portugal
                [-23.4, 37.8],   // Atlantic Ocean
                [-23.7, 36.5],   // Deep ocean
                [-24.1, 35.2],   // Atlantic Ocean
                [-24.4, 33.9],   // Ocean waters
                [-24.8, 32.6],   // Atlantic Ocean
                [-25.1, 31.3],   // Deep ocean
                [-25.5, 30.0],   // Atlantic Ocean
                [-25.8, 28.7],   // Ocean near Canary Islands
                [-26.2, 27.4],   // Atlantic Ocean
                [-26.5, 26.1],   // Deep ocean
                [-26.9, 24.8],   // Atlantic Ocean
                [-27.2, 23.5],   // Ocean waters
                [-27.6, 22.2],   // Atlantic Ocean
                [-27.9, 20.9],   // Deep ocean
                [-28.3, 19.6],   // Atlantic Ocean
                [-28.6, 18.3],   // Ocean waters
                [-29.0, 17.0],   // Atlantic Ocean
                [-29.3, 15.7],   // Deep ocean
                [-29.7, 14.4],   // Atlantic Ocean
                [-30.0, 13.1],   // Ocean waters
                [-30.4, 11.8],   // Atlantic Ocean
                [-30.7, 10.5]    // Deep Atlantic Ocean
            ];

            // Use uploaded trajectory data or default data
            const currentTrajectory = trajectoryData || defaultTrajectory;

            // Debug logging
            console.log('Cesium 3D - Plotting trajectory:', {
                isUploadedData: !!trajectoryData,
                coordinateCount: currentTrajectory.length,
                firstCoord: currentTrajectory[0],
                lastCoord: currentTrajectory[currentTrajectory.length - 1],
                sampleCoords: currentTrajectory.slice(0, 3)
            });

            // Validate trajectory data format
            if (!Array.isArray(currentTrajectory) || currentTrajectory.length === 0) {
                console.warn('Invalid trajectory data format');
                return;
            }

            // Validate coordinate format [longitude, latitude]
            const isValidFormat = currentTrajectory.every(coord =>
                Array.isArray(coord) && coord.length === 2 &&
                typeof coord[0] === 'number' && typeof coord[1] === 'number' &&
                coord[0] >= -180 && coord[0] <= 180 && // Valid longitude
                coord[1] >= -90 && coord[1] <= 90     // Valid latitude
            );

            if (!isValidFormat) {
                console.warn('Invalid coordinate format. Expected [longitude, latitude] pairs.');
                return;
            }

            const lastKnownPosition = currentTrajectory[currentTrajectory.length - 1];

            // Remove existing trajectory entities
            const entitiesToRemove = [];
            viewerRef.current.entities.values.forEach(entity => {
                if (entity.name && (
                    entity.name.includes('Trajectory') ||
                    entity.name.includes('Last Known Position')
                )) {
                    entitiesToRemove.push(entity);
                }
            });
            entitiesToRemove.forEach(entity => viewerRef.current.entities.remove(entity));

            // Convert trajectory to flat array for Cesium: [lng, lat, lng, lat, ...]
            const flatCoordinates = currentTrajectory.flat();

            // Add the Trajectory Path (Polyline)
            viewerRef.current.entities.add({
                name: trajectoryData ? "Uploaded Trajectory" : "ARGO Float Trajectory",
                polyline: {
                    positions: window.Cesium.Cartesian3.fromDegreesArray(flatCoordinates),
                    width: 3,
                    material: trajectoryData ? window.Cesium.Color.CYAN : window.Cesium.Color.YELLOW,
                    clampToGround: true
                },
            });

            // Add start position marker
            const startPosition = currentTrajectory[0];
            viewerRef.current.entities.add({
                name: "Start Position",
                position: window.Cesium.Cartesian3.fromDegrees(startPosition[0], startPosition[1]),
                point: {
                    pixelSize: 8,
                    color: window.Cesium.Color.GREEN,
                    outlineColor: window.Cesium.Color.BLACK,
                    outlineWidth: 2,
                },
            });

            // Add the Final Position (Point)
            viewerRef.current.entities.add({
                name: "Last Known Position",
                position: window.Cesium.Cartesian3.fromDegrees(lastKnownPosition[0], lastKnownPosition[1]),
                point: {
                    pixelSize: 10,
                    color: trajectoryData ? window.Cesium.Color.LIME : window.Cesium.Color.RED,
                    outlineColor: window.Cesium.Color.BLACK,
                    outlineWidth: 2,
                },
            });

            // Calculate trajectory bounds for better camera positioning
            const lngs = currentTrajectory.map(coord => coord[0]);
            const lats = currentTrajectory.map(coord => coord[1]);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);

            // Calculate center and appropriate height
            const centerLng = (minLng + maxLng) / 2;
            const centerLat = (minLat + maxLat) / 2;
            const latRange = maxLat - minLat;
            const lngRange = maxLng - minLng;
            const maxRange = Math.max(latRange, lngRange);

            // Calculate appropriate camera height based on trajectory extent
            const cameraHeight = Math.max(500000, maxRange * 111000 * 2); // Convert degrees to meters roughly

            // Fly the camera to show the entire trajectory
            viewerRef.current.camera.flyTo({
                destination: window.Cesium.Cartesian3.fromDegrees(centerLng, centerLat, cameraHeight),
                orientation: {
                    heading: window.Cesium.Math.toRadians(0.0),
                    pitch: window.Cesium.Math.toRadians(-45.0),
                }
            });
        }
    }, [trajectoryData, is3D]);

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
});

CesiumViewer.displayName = 'CesiumViewer';

export default CesiumViewer; 