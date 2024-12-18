"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/contexts/SocketContext";
import { useRide } from "@/contexts/RideContext";
import {
  LoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
  OverlayViewF,
  OverlayView,
} from "@react-google-maps/api";
import { useMap } from "@/contexts/MapContext";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const CaptainLiveTracking = ({ rideId, pickup, destination }) => {
  const { setRide } = useRide();
  const { captain } = useSelector((state) => state.captain);
  const { driverLocation, setDriverLocation, ridePhase, setRidePhase } =
    useMap();
  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState(null); // Dynamic map center

  const socket = useSocket();
  useEffect(() => {
    // Get user's initial location (normal map view)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
            rideId,
          });
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("error", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    if (rideId) {
      console.log("ride-joined", { rideId });
      // Join ride room if rideId is provided
      socket.emit("track-ride", { rideId });

      // Listen for ride phase updates
      socket.on("update-ride-phase", ({ rideId: updatedRideId, phase }) => {
        console.log("ride-phase-update", {
          rideId: updatedRideId,
          phase,
          rideId,
        });
        if (updatedRideId === rideId) {
          console.log(`Ride phase updated to: ${phase}`);
          setRidePhase(phase);

          if (phase === "finished") {
            setRide(null);
            console.log("disconnecting ride");
            socket.emit("disconnect-ride", { rideId });
            setDirections(null); // Clear directions on finish
          }
        }
      });

      // Listen for driver location updates
      socket.on("update-location-captain", (location) => {
        console.log("Driver location updated:", location);
        setDriverLocation(location);
        if (ridePhase === "confirmed") {
          updateDirections(location, pickup); // Directions to pickup
          console.log("pickup", pickup);
        } else if (ridePhase === "started") {
          updateDirections(pickup, destination); // Directions to destination
        }
      });
    }

    console.log("phase:", ridePhase);
  }, [rideId, socket, ridePhase]);

  const updateDirections = (origin, destination) => {
    console.log(origin, destination);

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          console.log("directions:", result);
          setDirections(result);
          // Fit the map bounds to the route
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].legs.forEach((leg) => {
            leg.steps.forEach((step) => {
              bounds.extend(step.start_location);
              bounds.extend(step.end_location);
            });
          });

          if (mapRef.current) {
            mapRef.current.fitBounds(bounds);
          }

          const center = bounds.getCenter();
          setMapCenter(center.toJSON());
        } else {
          console.error("Failed to fetch directions:", status);
        }
      }
    );
  };

  const mapRef = useRef();
  const options = useMemo(
    () => ({
      disableDefaultUI: true,
      scrollwheel: true,
      gestureHandling: "greedy",
      clickableIcons: false,
      // strictBounds: true,

      styles: [
        // General map styling
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "all",
          elementType: "labels.icon",
          stylers: [{ visibility: "on" }],
        },
        // Hide all points of interest
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.business",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.government",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.medical",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.park",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.place_of_worship",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.school",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.sports_complex",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        // Hide transit stations
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        // Keep water and roads visible
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#aadaff" }],
        },
      ],
    }),
    []
  );

  // Add Markers
  // useMemo(() => {
  //   if (mapRef.current) {
  //     // Add User Marker
  //     if (pickup) {
  //       const userMarker = new window.google.maps.marker.AdvancedMarkerElement({
  //         position: pickup,
  //         map: mapRef.current,
  //         content: document.createElement("div"),
  //       });

  //       userMarker.content.innerHTML = `
  //         <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);">
  //           <h4 style="margin: 0;">User Location</h4>
  //         </div>
  //       `;
  //     }

  //     // Add Driver Marker
  //     if (driverLocation) {
  //       const driverMarker =
  //         new window.google.maps.marker.AdvancedMarkerElement({
  //           position: driverLocation,
  //           map: mapRef.current,
  //           content: document.createElement("div"),
  //         });

  //       driverMarker.content.innerHTML = `
  //         <div style="background: yellow; padding: 10px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);">
  //           <h4 style="margin: 0;">Driver Location</h4>
  //         </div>
  //       `;
  //     }
  //   }
  // }, [pickup, driverLocation]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={["maps"]}
      version="weekly"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={15}
        // onLoad={(map) => (mapRef.current = map)}
        options={options}
      >
        {/* Display route directions */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                zIndex: 50,
                strokeColor: "#1976D2",
                strokeWeight: 5,
              },
            }}
          />
        )}
        {/* Display pickup and dropoff markers */}
        {pickup && (
          <OverlayViewF
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            position={{ lat: pickup.lat, lng: pickup.lng }}
            key="pickup"
          >
            <div
              style={{ color: "blue", fontSize: "16px", fontWeight: "bold" }}
            >
              📍
            </div>
          </OverlayViewF>
        )}
        {driverLocation && (
          <OverlayViewF
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            position={{
              fontSize: "24px",
              fontWeight: "bold",
              padding: "8px",
              backgroundColor: "#7F00FF",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            key="driver"
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                padding: "8px",
                backgroundColor: "#7F00FF",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              🚗
            </div>
          </OverlayViewF>
        )}
        {destination && (
          <OverlayViewF
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            position={{ lat: destination.lat, lng: destination.lng }}
            key="destination"
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                padding: "8px",
                backgroundColor: "#7F00FF",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              🎯
            </div>
          </OverlayViewF>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default CaptainLiveTracking;

// "use client";
// import { useCopilotStore } from "@/app/copilot/_components/copilotStore/copilotStore";
// import { MAP_TILE_TYPE } from "@/types/common/map/marker.d";
// import {
//   useLoadScript,
//   GoogleMap,
//   OverlayViewF,
//   OverlayView,
// } from "@react-google-maps/api";
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// import LandmarkTile from "@/components/InteractiveMap/MarkerTiles/LandmarkTile";
// import ExperienceTile from "@/components/InteractiveMap/MarkerTiles/ExperienceTile";
// import VibeTile from "@/components/InteractiveMap/MarkerTiles/VibeTile";

// type LatLngLiteral = { lat: number; lng: number };
// type Library = "places";
// // type Bounds = { ne: LatLngLiteral; sw: LatLngLiteral; center: LatLngLiteral };

// const libraries: Library[] = ["places"]; // Define libraries as a constant outside the component

// export default function InteractiveMap() {
//   const mapRef = useRef<google.maps.Map>(null);
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
//     libraries: libraries,
//   });
//   const { mapMarkers } = useCopilotStore(); // Access context value
//   const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

//   const center = useMemo<LatLngLiteral>(
//     () => ({ lat: 22.840165481622982, lng: 82.4323471141219 }), // Centered at Rishikesh
//     []
//   );
//   // For zooming to the markers
//   useEffect(() => {
//     if (mapMarkers.length > 0 && mapRef.current) {
//       const bounds = new google.maps.LatLngBounds();
//       mapMarkers.forEach((marker) => {
//         bounds.extend({ lat: marker.lat, lng: marker.long });
//       });
//       mapRef.current.fitBounds(bounds);
//     }
//   }, [mapMarkers]);

//   const onLoad = useCallback((map: google.maps.Map) => {
//     (mapRef as React.MutableRefObject<google.maps.Map | null>).current = map;
//   }, []);

//   const debounce = (func: () => void, wait: number) => {
//     let timeout: NodeJS.Timeout;
//     return () => {
//       clearTimeout(timeout);
//       timeout = setTimeout(func, wait);
//     };
//   };

//   const handleBoundsChanged = useCallback(() => {
//     if (mapRef.current) {
//       // const bounds = mapRef.current.getBounds();
//       // if (bounds) {
//       //   // TODO: Implement on bounds changed trigger
//       //   const ne = bounds.getNorthEast();
//       //   const sw = bounds.getSouthWest();
//       //   const center = bounds.getCenter();
//       //   const formattedBounds: Bounds = {
//       //     ne: { lat: ne.lat(), lng: ne.lng() },
//       //     sw: { lat: sw.lat(), lng: sw.lng() },
//       //     center: { lat: center.lat(), lng: center.lng() },
//       //   };
//       //   console.log("Bounds changed:", formattedBounds);
//       // }
//     }
//   }, []);

//   const debouncedHandleBoundsChanged = useMemo(
//     () => debounce(handleBoundsChanged, 500),
//     [handleBoundsChanged]
//   );

//   if (loadError)
//     return (
//       <div>
//         Error loading maps. Please check your API key and project settings.
//       </div>
//     );

//   if (!isLoaded) return <div>Loading...</div>;
//   return (
//     <div className="w-full h-full">
//       <GoogleMap
//         mapContainerClassName="relative w-full h-full"
//         center={center}
//         zoom={5}
//         onLoad={onLoad}
//         onBoundsChanged={debouncedHandleBoundsChanged}
//         options={mapOptions}
//       >
//         {mapMarkers.map((marker, index) => (
//           <OverlayViewF
//             key={marker.lat + index}
//             mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
//             position={{ lat: marker.lat, lng: marker.long }}
//           >
//             <div
//               className="relative w-full min-w-max rounded-lg flex items-start justify-center gap-1 cursor-default group"
//               onMouseEnter={() => setHoveredMarker(index)}
//               onMouseLeave={() => setHoveredMarker(null)}
//             >
//               {marker.tileType === MAP_TILE_TYPE.VIBE && (
//                 <VibeTile marker={marker} hovered={hoveredMarker === index} />
//               )}
//               {marker.tileType === MAP_TILE_TYPE.LANDMARK && (
//                 <LandmarkTile
//                   marker={marker}
//                   hovered={hoveredMarker === index}
//                 />
//               )}
//               {marker.tileType === MAP_TILE_TYPE.EXPERIENCE && (
//                 <ExperienceTile
//                   marker={marker}
//                   hovered={hoveredMarker === index}
//                 />
//               )}
//             </div>
//           </OverlayViewF>
//         ))}
//       </GoogleMap>
//     </div>
//   );
// }
