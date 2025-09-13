import React, { useState, useRef, useEffect } from "react";
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
  ArrowLeft,
  Bot,
  Copy,
  Sparkles,
  Loader,
  GlobeIcon,
  Square
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";

import { useAuth } from "@/hooks";
import { useApp } from "@/providers/app-provider";
import { MDX } from "@/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

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
  const { user } = useAuth();
  const { defaultModel } = useApp();

  const [is3D, setIs3D] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [drawingMode, setDrawingMode] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const cesiumViewerRef = useRef(null);
  const map2DRef = useRef(null);
  const textareaRef = useRef(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: uuid(),
      role: "assistant",
      content: "Welcome to the Maps Dashboard! I can help you analyze geographical data, upload trajectory files, and interact with the map. What would you like to explore today?",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState(null);
  const [webSearch, setWebSearch] = useState(false);

  // File and trajectory state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [trajectoryData, setTrajectoryData] = useState(null);
  const fileInputRef = useRef(null);
  const mapFileInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      toast.error("Please enter a message!");
      return;
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add user message
    const userMessage = {
      id: uuid(),
      role: "user",
      content: inputMessage,
      createdAt: new Date().toISOString(),
      allFiles: uploadedFiles
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setUploadedFiles([]);
    setIsStreaming(true);

    // Simulate AI streaming response
    const aiMessageId = uuid();
    const aiMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, aiMessage]);

    // Simulate streaming response
    const responses = [
      "I can help you analyze oceanographic data and trajectory patterns. Based on your map interaction, I can provide insights about:\n\n• **Trajectory Analysis**: Understanding movement patterns and ocean currents\n• **Geographical Context**: Interpreting the spatial distribution of your data\n• **Data Visualization**: Optimizing how your trajectory data is displayed\n• **Drawing Tools**: Using polygons and circles for area analysis\n\nWhat specific aspect would you like to explore?",

      "I see you're working with trajectory data on the maps dashboard. Here are some ways I can assist:\n\n• **Data Upload**: Help you format and upload trajectory JSON files\n• **Visualization**: Explain the differences between 2D and 3D map views\n• **Analysis Tools**: Guide you through using drawing tools for spatial analysis\n• **Oceanographic Insights**: Provide context about ARGO float data and ocean patterns\n\nWhat would you like to know more about?",

      "Great question about the maps functionality! I can help you with:\n\n• **Trajectory Plotting**: Understanding how coordinate data is visualized\n• **Map Controls**: Using zoom, pan, and drawing tools effectively\n• **Data Formats**: Working with JSON coordinate arrays\n• **Spatial Analysis**: Creating study areas with polygons and circles\n\nFeel free to ask about any specific feature or upload your own trajectory data to get started!",

      "I'm here to help with your mapping and data analysis needs. Whether you're working with:\n\n• **ARGO Float Data**: Understanding oceanographic measurements\n• **Trajectory Visualization**: Plotting movement patterns over time\n• **Spatial Analysis**: Using drawing tools for research areas\n• **Data Integration**: Combining multiple datasets on the map\n\nJust let me know what you'd like to explore, or try uploading your own trajectory data!"
    ];

    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

    // Simulate typing effect
    let currentText = "";
    const words = selectedResponse.split(" ");

    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      currentText += (i > 0 ? " " : "") + words[i];

      setChatMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: currentText }
            : msg
        )
      );
    }

    setIsStreaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Message copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    setStreamId(null);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const scrollContainer = document.querySelector('.chat-messages-scroll [data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [chatMessages]);

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
                  id: uuid(),
                  role: "assistant",
                  content: `✅ **Trajectory Data Loaded Successfully**\n\nI've loaded your trajectory data with **${jsonData.length} coordinate points**. The trajectory has been plotted on both the 2D and 3D maps.\n\n**What you can do now:**\n• Switch between 2D/3D views to explore the data\n• Use drawing tools to create analysis areas\n• Ask me questions about the trajectory patterns\n• Upload additional data files for comparison`,
                  createdAt: new Date().toISOString()
                };
                setChatMessages(prev => [...prev, successMessage]);
                toast.success("Trajectory data loaded successfully!");
              } else {
                // Add error message to chat
                const errorMessage = {
                  id: uuid(),
                  role: "assistant",
                  content: "❌ **Invalid Trajectory Format**\n\nThe uploaded JSON file doesn't contain valid trajectory data. Please ensure your file contains an array of coordinate pairs in this format:\n\n```json\n[\n  [-9.857, 55.953],\n  [-9.925, 55.695],\n  [-10.024, 55.666]\n]\n```\n\nEach coordinate should be `[longitude, latitude]` with numeric values.",
                  createdAt: new Date().toISOString()
                };
                setChatMessages(prev => [...prev, errorMessage]);
                toast.error("Invalid trajectory data format");
              }
            }
          } catch (error) {
            // Add error message to chat
            const errorMessage = {
              id: uuid(),
              role: "assistant",
              content: "❌ **JSON Parse Error**\n\nFailed to parse the uploaded JSON file. Please ensure it's a valid JSON format and try again.\n\n**Common issues:**\n• Missing commas between coordinates\n• Incorrect bracket formatting\n• Non-numeric coordinate values",
              createdAt: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, errorMessage]);
            toast.error("Failed to parse JSON file");
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
      id: uuid(),
      role: "assistant",
      content: "🔄 **Trajectory Data Cleared**\n\nI've cleared the uploaded trajectory data and restored the default ARGO float trajectory. You can now:\n\n• Upload new trajectory data\n• Explore the default oceanographic data\n• Use the drawing tools for analysis\n• Ask questions about the current trajectory",
      createdAt: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, clearMessage]);
    toast.success("Trajectory data cleared");
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
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full chat-messages-scroll">
            <div className="p-4 space-y-4">
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

              {chatMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "py-2 group",
                    message.role === "user" ? "bg-background" : "bg-gradient-to-br from-slate-50/80 to-slate-100/60 dark:from-slate-800/70 dark:to-slate-700/50 rounded-lg"
                  )}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <Avatar className="h-7 w-7 ring-1 ring-slate-200 dark:ring-slate-700">
                          <AvatarImage src={user?.avatar?.url} alt="User" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
                            {user?.fullName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="relative">
                          <Avatar className="h-7 w-7 ring-2 ring-slate-300 dark:ring-slate-500">
                            <AvatarFallback className="bg-gradient-to-br from-slate-600 via-slate-700 to-gray-700 dark:from-slate-500 dark:via-slate-600 dark:to-gray-600 text-white">
                              <Bot className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-gradient-to-r from-slate-500 to-gray-600 dark:from-slate-400 dark:to-gray-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-1.5 w-1.5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                          {message.role === "user" ? "You" : "AI Assistant"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), "hh:mm a")}
                        </span>
                      </div>

                      {/* Files */}
                      {message.allFiles && message.allFiles.length > 0 && (
                        <div className="flex items-center gap-2 mb-2 overflow-x-auto">
                          {message.allFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs bg-card border border-border/30 rounded px-2 py-1 whitespace-nowrap">
                              <FileText size={10} className="text-primary" />
                              <span className="truncate max-w-20">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Text */}
                      <div className={cn(
                        "text-sm",
                        message.role === "assistant" && "prose dark:prose-invert prose-sm max-w-none"
                      )}>
                        {message.role === "user" ? (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </p>
                        ) : (
                          <div className="relative">
                            <MDX content={message.content} />
                            {/* Loading indicator for streaming */}
                            {isStreaming && index === chatMessages.length - 1 && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Loader size={12} className="animate-spin" />
                                <span>AI is thinking...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyMessage(message.content)}
                          title="Copy message"
                        >
                          <Copy size={10} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Input */}
        <div className="flex-shrink-0 p-4 border-t border-sidebar-border/20">
          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-1 text-xs bg-card border border-border/30 rounded px-2 py-1 whitespace-nowrap">
                  <FileText size={10} className="text-primary" />
                  <span className="truncate max-w-20">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                  >
                    <X size={8} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 relative border border-border rounded-lg shadow-sm">
              <Textarea
                ref={textareaRef}
                placeholder="Ask about the map, upload data, or request analysis..."
                value={inputMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                className="resize-none border-none shadow-none min-h-[44px] max-h-[120px] pt-3 pb-12"
                rows={1}
                disabled={isStreaming}
              />

              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  title="Upload file"
                >
                  <Paperclip size={12} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0",
                    webSearch && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  )}
                  onClick={() => setWebSearch(!webSearch)}
                  disabled={isStreaming}
                  title="Search the internet"
                >
                  <GlobeIcon size={12} />
                </Button>

                {isStreaming ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleStopStreaming}
                    title="Stop generation"
                  >
                    <Square size={12} className="fill-current" />
                  </Button>
                ) : (
                  <Button
                    variant={inputMessage.trim() ? "default" : "ghost"}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    title="Send message"
                  >
                    <Send size={12} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, "chat")}
          />
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

          {/* Drawing Controls (Bottom Center) - Show in both 2D and 3D modes */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
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