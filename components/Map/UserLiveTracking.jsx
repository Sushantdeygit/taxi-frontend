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
import { useMap } from "@/contexts/MapContext";
import {
  LoadScript,
  GoogleMap,
  DirectionsRenderer,
  OverlayViewF,
  OverlayView,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const LiveTracking = ({ rideId, pickup, destination }) => {
  const { ride } = useRide();
  const { driverLocation, setDriverLocation, ridePhase, setRidePhase } =
    useMap();
  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState(null); // Dynamic map center

  const socket = useSocket();
  useMemo(() => {
    // Get user's initial location (normal map view)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log("error", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    if (ride) {
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
          updateDirections(pickup, location); // Directions to pickup
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
          setMapCenter(origin);
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
  //       const userMarker = new google.maps.marker.AdvancedMarkerElement({
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
  //       const driverMarker = new google.maps.marker.AdvancedMarkerElement({
  //         position: driverLocation,
  //         map: mapRef.current,
  //         content: document.createElement("div"),
  //       });

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
        onLoad={(map) => (mapRef.current = map)}
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
              📍
            </div>
          </OverlayViewF>
        )}
        {driverLocation && (
          <OverlayViewF
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
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

export default LiveTracking;
