"use client";
import { useState, useRef, useMemo, useEffect, createContext } from "react";
import Link from "next/link";
import ConfirmRidePopUp from "@/components/CaptainDashboard/ConfirmRidePopUp";
import RidePopUp from "@/components/CaptainDashboard/RidePopUp";
import CaptainDetails from "@/components/CaptainDashboard/CaptainDetails";
import { useSelector } from "react-redux";
import CaptainLiveTracking from "@/components/Map/CaptainLiveTracking";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useSocket } from "@/contexts/SocketContext";
import axios from "axios";
import { useRide } from "@/contexts/RideContext";

const CaptainDashboard = () => {
  const { token, captain } = useSelector((state) => state.captain);
  const socket = useSocket();

  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);

  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null);
  const {
    setRide,
    ride,
    setDestinationCoords,
    setPickupCoords,
    destinationCoords,
    pickupCoords,
  } = useRide();

  useEffect(() => {
    socket.emit("join", { userId: captain._id, userType: "captain" }); // Join the captain room
  }, [captain, socket]);

  //socket connection for new ride
  socket.on("new-ride", (data) => {
    setRide(data?.ride);
    setPickupCoords(data?.pickUpCoords);
    setDestinationCoords(data?.destinationCoords);
    setRidePopupPanel(true);
  });

  console.log("pickup", pickupCoords);
  console.log("destination", destinationCoords);

  useGSAP(
    function () {
      if (ridePopupPanel) {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [ridePopupPanel]
  );

  useGSAP(
    function () {
      if (confirmRidePopupPanel) {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePopupPanel]
  );
  return (
    <div className="h-screen">
      <div className="fixed p-6 top-0 flex items-center justify-between w-screen">
        <Link
          href="/captain-dashboard"
          className=" h-10 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
      <div className="h-3/5">
        <CaptainLiveTracking
          rideId={ride?._id}
          pickup={pickupCoords}
          destination={destinationCoords}
        />
        {/* <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="image"
        /> */}
      </div>
      <div className="h-1/5 p-6">
        <CaptainDetails />
      </div>
      <div
        ref={ridePopupPanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white p-3 "
      >
        <RidePopUp
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
        />
      </div>
      <div
        ref={confirmRidePopupPanelRef}
        className="fixed w-full h-[75%] z-10 bottom-0 translate-y-full bg-white p-3 pt-6"
      >
        <ConfirmRidePopUp
          ride={ride}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          setRidePopupPanel={setRidePopupPanel}
        />
      </div>
    </div>
  );
};

export default CaptainDashboard;
