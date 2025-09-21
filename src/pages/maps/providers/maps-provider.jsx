import React, { createContext, useContext, useState } from "react";

const MapsContext = createContext();

export const useMapsProvider = () => {
  const context = useContext(MapsContext);
  if (!context) {
    throw new Error("useMapsProvider must be used within a MapsProvider");
  }
  return context;
};

export const MapsProvider = ({ children }) => {
  const [mapData, setMapData] = useState(null);
  const [selectedLayers, setSelectedLayers] = useState(['satellite', 'roads']);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  const value = {
    mapData,
    setMapData,
    selectedLayers,
    setSelectedLayers,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
  };

  return (
    <MapsContext.Provider value={value}>
      {children}
    </MapsContext.Provider>
  );
};