import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Square, 
  Circle, 
  Trash2, 
  MousePointer,
  Pentagon
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <Card className={cn("p-3 shadow-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600", className)}>
      <div className="flex flex-col gap-1">
        <div className="text-xs font-medium text-card-foreground mb-2 px-1">
          Drawing Tools
        </div>
        
        {/* Selection Tool */}
        <Button
          variant={!drawingMode ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary",
            !drawingMode && "bg-primary/20 text-primary"
          )}
          onClick={() => handleModeChange(null)}
          title="Selection Tool"
          disabled={isDrawing}
        >
          <MousePointer size={14} />
        </Button>

        <Separator className="my-1" />

        {/* Polygon Tool */}
        <Button
          variant={drawingMode === 'polygon' ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary",
            drawingMode === 'polygon' && "bg-primary/20 text-primary"
          )}
          onClick={() => handleModeChange('polygon')}
          title="Draw Polygon"
          disabled={isDrawing && drawingMode !== 'polygon'}
        >
          <Pentagon size={14} />
        </Button>

        {/* Arc/Circle Tool */}
        <Button
          variant={drawingMode === 'arc' ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary",
            drawingMode === 'arc' && "bg-primary/20 text-primary"
          )}
          onClick={() => handleModeChange('arc')}
          title="Draw Circle/Arc"
          disabled={isDrawing && drawingMode !== 'arc'}
        >
          <Circle size={14} />
        </Button>

        <Separator className="my-1" />

        {/* Clear All */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          onClick={onClearAll}
          title="Clear All Drawings"
          disabled={isDrawing}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Drawing Instructions */}
      {drawingMode && (
        <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          {drawingMode === 'polygon' && (
            <div>
              <div className="font-medium mb-1">Polygon Mode:</div>
              <div>• Left click to add points</div>
              <div>• Right click to finish</div>
              <div>• Need at least 3 points</div>
            </div>
          )}
          {drawingMode === 'arc' && (
            <div>
              <div className="font-medium mb-1">Circle Mode:</div>
              <div>• First click sets center</div>
              <div>• Second click sets radius</div>
              <div>• Move mouse to preview</div>
            </div>
          )}
        </div>
      )}

      {isDrawing && (
        <div className="mt-2 p-2 bg-primary/10 rounded text-xs text-primary font-medium">
          Drawing in progress...
        </div>
      )}
    </Card>
  );
};

export default DrawingControls;