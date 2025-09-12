import React from 'react';
import { Map } from 'lucide-react';

const Map2D = ({ is3D }) => {
  if (is3D) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg border border-border/20">
          <Map size={48} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          2D Map View
        </h3>
        <p className="text-muted-foreground text-sm">
          2D map interface will be rendered here
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          Toggle to 3D for interactive globe view
        </div>
      </div>
    </div>
  );
};

export default Map2D;