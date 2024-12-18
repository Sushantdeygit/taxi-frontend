"use client";
import { createContext, useContext, useState } from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [ridePhase, setRidePhase] = useState("idle"); // "idle", "created", "confirmed", "started", "finished"

  return (
    <MapContext.Provider
      value={{
        driverLocation,
        setDriverLocation,
        ridePhase,
        setRidePhase,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => useContext(MapContext);
