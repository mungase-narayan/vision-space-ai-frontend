import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/providers/theme-provider';

const CesiumViewer = React.forwardRef(({ is3D, onDrawingModeChange, drawingMode, onDrawingStateChange }, ref) => {
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

            // Initialize drawing functionality
            initializeDrawingTools();
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