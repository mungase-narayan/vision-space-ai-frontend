import React, { useState, useRef } from "react";
import {
  Map,
  Upload,
  MessageSquare,
  Settings,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  FileText,
  Image,
  Paperclip,
  Send,
  ToggleLeft,
  ToggleRight,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import CesiumViewer from "./components/cesium-viewer";
import Map2D from "./components/map-2d";
import DrawingControls from "./components/drawing-controls";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { cn } from "@/lib/utils";

const MapsDashboard = () => {
  const navigate = useNavigate();
  const [is3D, setIs3D] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [drawingMode, setDrawingMode] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const cesiumViewerRef = useRef(null);
  const map2DRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content: "Welcome to the Maps Dashboard! I can help you analyze geographical data, upload files, and interact with the map. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [trajectoryData, setTrajectoryData] = useState(null);
  const fileInputRef = useRef(null);
  const mapFileInputRef = useRef(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you analyze oceanographic data. What specific ARGO float measurements would you like to explore?",
        "I see you're interested in ocean data analysis. Would you like me to help with temperature, salinity, or trajectory visualization?",
        "Let me assist you with the ARGO float data. I can help with data analysis, trajectory mapping, or oceanographic insights.",
        "I'm ready to help with your oceanographic analysis. You can upload ARGO data files or ask me about specific ocean regions."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const aiResponse = {
        id: Date.now() + 1,
        type: "assistant",
        content: randomResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFileUpload = (event, source = "chat") => {
    const files = Array.from(event.target.files);

    files.forEach(file => {
      // Check if it's a JSON file for trajectory data
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);

            // Check if the JSON contains trajectory data (array of coordinate pairs)
            if (Array.isArray(jsonData) && jsonData.length > 0) {
              // Validate that it's an array of coordinate pairs
              const isValidTrajectory = jsonData.every(coord =>
                Array.isArray(coord) && coord.length === 2 &&
                typeof coord[0] === 'number' && typeof coord[1] === 'number'
              );

              if (isValidTrajectory) {
                setTrajectoryData(jsonData);

                // Add success message to chat
                const successMessage = {
                  id: Date.now(),
                  type: "assistant",
                  content: `Successfully loaded trajectory data with ${jsonData.length} coordinate points. The trajectory has been plotted on the 3D globe.`,
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, successMessage]);
              } else {
                // Add error message to chat
                const errorMessage = {
                  id: Date.now(),
                  type: "assistant",
                  content: "The uploaded JSON file doesn't contain valid trajectory data. Please ensure it's an array of [longitude, latitude] coordinate pairs.",
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, errorMessage]);
              }
            }
          } catch (error) {
            // Add error message to chat
            const errorMessage = {
              id: Date.now(),
              type: "assistant",
              content: "Failed to parse the uploaded JSON file. Please check the file format.",
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
          }
        };
        reader.readAsText(file);
      }
    });

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      source
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrawingModeChange = (mode) => {
    setDrawingMode(mode);
  };

  const handleClearAllDrawings = () => {
    if (is3D && cesiumViewerRef.current && cesiumViewerRef.current.viewer) {
      const viewer = cesiumViewerRef.current.viewer;
      // Remove all drawing entities (keep ARGO float data)
      const entitiesToRemove = [];
      viewer.entities.values.forEach(entity => {
        if (entity.name && (
          entity.name.includes('Polygon') ||
          entity.name.includes('Circle') ||
          entity.name.includes('Arc') ||
          entity.name.includes('Point')
        )) {
          entitiesToRemove.push(entity);
        }
      });
      entitiesToRemove.forEach(entity => viewer.entities.remove(entity));
    } else if (!is3D && map2DRef.current && map2DRef.current.clearDrawings) {
      // Clear 2D map drawings
      map2DRef.current.clearDrawings();
    }
  };

  const handleClearTrajectoryData = () => {
    setTrajectoryData(null);
    setUploadedFiles(prev => prev.filter(file => !file.name.endsWith('.json')));

    const clearMessage = {
      id: Date.now(),
      type: "assistant",
      content: "Trajectory data cleared. Showing default ARGO float trajectory.",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, clearMessage]);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Chat Panel */}
      <div className={cn(
        "border-r border-border/50 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 backdrop-blur-sm flex flex-col transition-all duration-300",
        chatPanelOpen ? "w-80 md:w-80 sm:w-72" : "w-0 overflow-hidden",
        "md:relative absolute md:translate-x-0 z-10 h-full"
      )}>
        {/* Chat Header */}
        <div className="p-4 border-b border-sidebar-border/20 bg-gradient-to-r from-sidebar-accent/10 via-transparent to-sidebar-accent/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/8">
              <MessageSquare size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-sidebar-foreground">Map Chat</h2>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.length === 1 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs text-muted-foreground">Quick suggestions:</p>
                {[
                  "Show ARGO float trajectory",
                  "Upload JSON trajectory data",
                  "Draw analysis polygon",
                  "Create circular study area"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="block w-full text-left p-2 text-xs bg-card hover:bg-accent hover:text-accent-foreground rounded border border-border/30 hover:border-border/50 transition-all duration-200 shadow-sm"
                    onClick={() => setInputMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    message.type === "user"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-card-foreground border border-border/50 shadow-sm"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* File Upload Area */}
        {uploadedFiles.length > 0 && (
          <div className="p-4 border-t border-sidebar-border/20">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Uploaded Files</h3>
            <div className="space-y-2 max-h-20 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2 text-xs bg-card border border-border/30 rounded p-2 shadow-sm">
                  <FileText size={12} className="text-primary" />
                  <span className="truncate flex-1 text-card-foreground">{file.name}</span>
                  <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t border-sidebar-border/20">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about the map..."
                className="pr-10 h-9 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={12} />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e, "chat")}
              />
            </div>
            <Button size="sm" onClick={handleSendMessage} className="h-9 px-3">
              <Send size={12} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {/* Map Header */}
        <div className="h-14 border-b border-border/50 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatPanelOpen(!chatPanelOpen)}
              className="md:hidden h-8 w-8 p-0"
            >
              {chatPanelOpen ? <X size={16} /> : <Menu size={16} />}
            </Button>

            {/* Back to Chats Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chats')}
              className="h-8 gap-2 px-3"
              title="Back to Chats"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Chats</span>
            </Button>

            <div className="flex items-center gap-2">
              <Map size={18} className="text-primary" />
              <h1 className="font-semibold">Maps Dashboard</h1>
            </div>

            {/* 2D/3D Toggle */}
            <div className="flex items-center gap-2 ml-6">
              <span className="text-sm text-muted-foreground">2D</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIs3D(!is3D)}
                className="h-8 w-12 p-0"
              >
                {is3D ? (
                  <ToggleRight size={20} className="text-primary" />
                ) : (
                  <ToggleLeft size={20} className="text-muted-foreground" />
                )}
              </Button>
              <span className="text-sm text-muted-foreground">3D</span>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mapFileInputRef.current?.click()}
              className="gap-2"
              title="Upload JSON trajectory data"
            >
              <Upload size={14} />
              Upload Data
            </Button>

            {trajectoryData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearTrajectoryData}
                className="gap-2"
                title="Clear uploaded trajectory data"
              >
                <X size={14} />
                Clear Data
              </Button>
            )}

            {/* Theme Toggle */}
            <ModeToggle />
          </div>
          <input
            ref={mapFileInputRef}
            type="file"
            accept=".json,application/json"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, "map")}
          />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-slate-900/50 dark:to-slate-800/50 bg-background">
          {/* 2D Map View */}
          <Map2D
            ref={map2DRef}
            is3D={is3D}
            drawingMode={drawingMode}
            onDrawingModeChange={handleDrawingModeChange}
            onDrawingStateChange={setIsDrawing}
            trajectoryData={trajectoryData}
          />

          {/* 3D Cesium Globe View */}
          <CesiumViewer
            ref={cesiumViewerRef}
            is3D={is3D}
            drawingMode={drawingMode}
            onDrawingModeChange={handleDrawingModeChange}
            onDrawingStateChange={setIsDrawing}
            trajectoryData={trajectoryData}
          />

          {/* Map Controls (Right Side) */}
          <div className="absolute right-4 top-4 flex flex-col gap-2 z-50">
            <Card className="p-2 shadow-lg bg-card/95 backdrop-blur-sm border-border/50">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  title="Zoom In"
                  onClick={() => {
                    if (is3D && cesiumViewerRef.current?.viewer) {
                      const camera = cesiumViewerRef.current.viewer.camera;
                      camera.zoomIn(camera.positionCartographic.height * 0.5);
                    } else if (!is3D && map2DRef.current?.map) {
                      map2DRef.current.map.zoomIn();
                    }
                  }}
                >
                  <ZoomIn size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  title="Zoom Out"
                  onClick={() => {
                    if (is3D && cesiumViewerRef.current?.viewer) {
                      const camera = cesiumViewerRef.current.viewer.camera;
                      camera.zoomOut(camera.positionCartographic.height * 0.5);
                    } else if (!is3D && map2DRef.current?.map) {
                      map2DRef.current.map.zoomOut();
                    }
                  }}
                >
                  <ZoomOut size={14} />
                </Button>
                <Separator className="my-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  title="Reset View"
                  onClick={() => {
                    if (is3D && cesiumViewerRef.current?.viewer) {
                      cesiumViewerRef.current.viewer.camera.setView({
                        destination: window.Cesium?.Cartesian3.fromDegrees(-10, 45, 1000000)
                      });
                    } else if (!is3D && map2DRef.current?.map) {
                      // Reset to trajectory bounds or default view
                      if (map2DRef.current.map.plotTrajectoryData) {
                        map2DRef.current.map.plotTrajectoryData();
                      } else {
                        map2DRef.current.map.setView([45, -10], 6);
                      }
                    }
                  }}
                >
                  <RotateCcw size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  title="Fullscreen"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      document.documentElement.requestFullscreen();
                    }
                  }}
                >
                  <Maximize size={14} />
                </Button>
              </div>
            </Card>
          </div>

          {/* Drawing Controls (Left Side) - Show in both 2D and 3D modes */}
          <div className="absolute left-4 top-4 z-50">
            <DrawingControls
              drawingMode={drawingMode}
              onDrawingModeChange={handleDrawingModeChange}
              onClearAll={handleClearAllDrawings}
              isDrawing={isDrawing}
            />
          </div>


        </div>

        {/* Bottom Tools Panel */}
        <div className="h-16 border-t border-border/50 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Tools</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Navigation size={14} />
                  Measure
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Image size={14} />
                  Analyze
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Image size={14} />
                  Export
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{is3D ? "3D Globe Ready" : "2D Map Ready"}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              {trajectoryData && (
                <div className="flex items-center gap-2">
                  <span>Custom Trajectory Loaded</span>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                </div>
              )}
              {isDrawing && (
                <div className="flex items-center gap-2">
                  <span>Drawing Mode Active</span>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapsDashboard;