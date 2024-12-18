"use client";
import { useState, useEffect, useRef, useContext } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import "remixicon/fonts/remixicon.css";
import { useRouter } from "next/navigation";
import LookingForDriver from "@/components/UserDashboard/LookingForDriver";
import LocationSearchPanel from "@/components/UserDashboard/LocationSearchPanel";
import ConfirmRide from "@/components/UserDashboard/ConfirmRide";
import VehiclePanel from "@/components/UserDashboard/VehiclePanel";
import WaitingForDriver from "@/components/UserDashboard/WaitingForDriver";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/contexts/SocketContext";
import LiveTracking from "@/components/Map/UserLiveTracking";
import { useRide } from "@/contexts/RideContext";

const UserDashboard = () => {
  const { token, user } = useSelector((state) => state.user);
  const [panelOpen, setPanelOpen] = useState(false);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null);

  const {
    ride,
    setRide,
    pickupCoords,
    setPickupCoords,
    destinationCoords,
    setDestinationCoords,
  } = useRide();

  const socket = useSocket();

  const router = useRouter();

  useEffect(() => {
    socket.emit("join", { userId: user._id, userType: "user" });
  }, [user, socket]);

  useEffect(() => {
    socket.on("ride-confirmed", (data) => {
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRide(data?.ride);
      setPickupCoords(data?.pickUpCoords);
      setDestinationCoords(data?.destinationCoords);
    });

    socket.on("ride-started", (ride) => {
      setWaitingForDriver(false);
      setRide(ride);
      router.push(`/riding`); // Updated navigate to include ride data
    });
  }, [ride, socket]);

  const handlePickupChange = async (e) => {
    setPickup(e.target.value);

    try {
      if (e.target.value.length > 2) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}maps/getSuggestedAddresses`,
          {
            address: e.target.value,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPickupSuggestions(response.data.data);
      }
    } catch {
      console.log("error fetching pickup suggestions");
    }
  };
  const handleDestinationChange = async (e) => {
    setDestination(e.target.value);

    try {
      if (e.target.value.length > 2) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}maps/getSuggestedAddresses`,
          { address: e.target.value },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDestinationSuggestions(response.data.data);
      }
    } catch {
      console.log("error fetching destination suggestions");
    }
  };

  async function findTrip() {
    setVehiclePanel(true);
    setPanelOpen(false);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}rides/getFare`,
      {
        startLocation: pickup, // The start location in the body
        endLocation: destination, // The end location in the body
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Authorization header for the token
        },
      }
    );
    setFare(response.data.data);
  }

  async function createRide() {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}rides/create`,
      {
        startLocation: pickup,
        endLocation: destination,
        vehicleType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      socket.emit("update-ride-phase", {
        rideId: ride._id,
        phase: "created",
      });
    }
  }

  const submitHandler = (e) => {
    e.preventDefault();
  };

  //Gsap Animation
  useGSAP(
    function () {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: "70%",
          padding: 24,
          // opacity:1
        });
        gsap.to(panelCloseRef.current, {
          opacity: 1,
        });
      } else {
        gsap.to(panelRef.current, {
          height: "0%",
          padding: 0,
          // opacity:0
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
        });
      }
    },
    [panelOpen]
  );

  useGSAP(
    function () {
      if (vehiclePanel) {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(200%)",
        });
      }
    },
    [vehiclePanel]
  );

  useGSAP(
    function () {
      if (confirmRidePanel) {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(200%)",
        });
      }
    },
    [confirmRidePanel]
  );

  useGSAP(
    function () {
      if (vehicleFound) {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(200%)",
        });
      }
    },
    [vehicleFound]
  );

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(110%)",
        });
      }
    },
    [waitingForDriver]
  );

  return (
    <div className="h-screen relative overflow-hidden">
      <div className="h-screen w-screen">
        <LiveTracking
          rideId={ride?._id}
          pickup={pickupCoords}
          destination={destinationCoords}
        />
      </div>
      <div className=" flex flex-col justify-end h-screen absolute top-0 w-full">
        <div className="h-[30%] p-6 bg-white relative">
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute opacity-0 right-6 top-6 text-2xl"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form
            className="relative py-3"
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full"
              type="text"
              placeholder="Add a pick-up location"
            />
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            disabled={!pickup || !destination}
            className="bg-black text-white px-4 py-2 rounded-lg mt-3 w-full"
          >
            Find Trip
          </button>
        </div>
        <div ref={panelRef} className="bg-white h-0">
          <LocationSearchPanel
            suggestions={
              activeField === "pickup"
                ? pickupSuggestions
                : destinationSuggestions
            }
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField}
          />
        </div>
      </div>
      <div
        ref={vehiclePanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <VehiclePanel
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>
      <div
        ref={confirmRidePanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
      >
        <ConfirmRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        ref={vehicleFoundRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
      >
        <LookingForDriver
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        ref={waitingForDriverRef}
        className="fixed w-full  z-10 bottom-0  bg-white px-3 py-6 pt-12"
      >
        <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
