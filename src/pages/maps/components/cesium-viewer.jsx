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

            // Plot trajectory data
            plotTrajectoryData();

            // Initialize drawing functionality
            initializeDrawingTools();
        };

        const plotTrajectoryData = () => {
            if (!viewerRef.current || !window.Cesium) return;

            // Default mock data if no trajectory data is provided
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
    }, [is3D, theme]);

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
            // Re-plot trajectory when data changes
            const plotTrajectoryData = () => {
                // Default mock data if no trajectory data is provided
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

            plotTrajectoryData();
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