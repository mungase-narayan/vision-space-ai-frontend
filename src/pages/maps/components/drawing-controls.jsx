import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Circle,
  Trash2,
  MousePointer,
  Pentagon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DrawingControls = ({
  drawingMode,
  onDrawingModeChange,
  onClearAll,
  isDrawing,
  className
}) => {
  const handleModeChange = (mode) => {
    if (isDrawing) return; // Prevent mode change while drawing
    onDrawingModeChange(drawingMode === mode ? null : mode);
  };

  const getTooltipContent = (mode) => {
    switch (mode) {
      case null:
        return (
          <div className="text-center">
            <div className="font-medium">Selection Tool</div>
            <div className="text-xs text-muted-foreground mt-1">Navigate and interact with the map</div>
          </div>
        );
      case 'polygon':
        return (
          <div className="text-center">
            <div className="font-medium">Draw Polygon</div>
            <div className="text-xs text-muted-foreground mt-1">
              Left click to add points<br />
              Right click to finish<br />
              Need at least 3 points
            </div>
          </div>
        );
      case 'arc':
        return (
          <div className="text-center">
            <div className="font-medium">Draw Circle</div>
            <div className="text-xs text-muted-foreground mt-1">
              First click sets center<br />
              Second click sets radius<br />
              Move mouse to preview
            </div>
          </div>
        );
      case 'clear':
        return (
          <div className="text-center">
            <div className="font-medium">Clear All</div>
            <div className="text-xs text-muted-foreground mt-1">Remove all drawings from the map</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <Card className={cn(
        "shadow-xl bg-card/95 backdrop-blur-sm border border-border/50 transition-all duration-200 hover:shadow-2xl lg:py-0",
        className
      )}>
        <div className="flex items-center gap-1 p-2">
          {/* Selection Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={!drawingMode ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 transition-all duration-200",
                  !drawingMode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-primary/10 hover:text-primary hover:scale-105"
                )}
                onClick={() => handleModeChange(null)}
                disabled={isDrawing}
              >
                <MousePointer size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="mb-2">
              {getTooltipContent(null)}
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Polygon Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={drawingMode === 'polygon' ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 transition-all duration-200",
                  drawingMode === 'polygon'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-primary/10 hover:text-primary hover:scale-105"
                )}
                onClick={() => handleModeChange('polygon')}
                disabled={isDrawing && drawingMode !== 'polygon'}
              >
                <Pentagon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="mb-2">
              {getTooltipContent('polygon')}
            </TooltipContent>
          </Tooltip>

          {/* Circle Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={drawingMode === 'arc' ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 transition-all duration-200",
                  drawingMode === 'arc'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-primary/10 hover:text-primary hover:scale-105"
                )}
                onClick={() => handleModeChange('arc')}
                disabled={isDrawing && drawingMode !== 'arc'}
              >
                <Circle size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="mb-2">
              {getTooltipContent('arc')}
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Clear All Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive hover:scale-105 transition-all duration-200"
                onClick={onClearAll}
                disabled={isDrawing}
              >
                <Trash2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="mb-2">
              {getTooltipContent('clear')}
            </TooltipContent>
          </Tooltip>

          {/* Drawing Status Indicator */}
          {isDrawing && (
            <>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-primary">Drawing...</span>
              </div>
            </>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default DrawingControls;