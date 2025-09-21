import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/providers/theme-provider';
import { normalizeTrajectoryData, validateTrajectoryData } from '@/lib/trajectory-utils';

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
            console.log('Cesium 3D - Plotting trajectory:', {
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