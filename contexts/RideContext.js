"use client";
import { createContext, useContext, useState } from "react";

const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [ride, setRide] = useState(null);
  const [pickupCoords, setPickupCoords] = useState("");
  const [destinationCoords, setDestinationCoords] = useState("");

  return (
    <RideContext.Provider
      value={{
        ride,
        setRide,
        pickupCoords,
        setPickupCoords,
        destinationCoords,
        setDestinationCoords,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
