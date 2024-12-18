"use client";
import React from "react";
import Link from "next/link";
import { useSocket } from "@/contexts/SocketContext";
import { useRouter } from "next/navigation";
import LiveTracking from "@/components/Map/UserLiveTracking";
import { useRide } from "@/contexts/RideContext";

const Riding = () => {
  const { ride, pickupCoords, destinationCoords } = useRide();
  const socket = useSocket();
  const router = useRouter();

  console.log(ride);

  socket.on("ride-ended", () => {
    router.push("/user-dashboard");
  });

  return (
    <div className="h-screen">
      <Link
        href="/user-dashboard"
        className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full"
      >
        <i className="text-lg font-medium ri-home-5-line"></i>
      </Link>
      <div className="h-1/2">
        <LiveTracking
          rideId={ride?._id}
          pickup={pickupCoords}
          destination={destinationCoords}
        />
      </div>
      <div className="h-1/2 p-4">
        <div className="flex items-center justify-between">
          <img
            className="h-12"
            src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
            alt=""
          />
          <div className="text-right">
            <h2 className="text-lg font-medium capitalize">
              {ride?.captain.fullName.firstName}
            </h2>
            <h4 className="text-xl font-semibold -mt-1 -mb-1">
              {ride?.captain.vehicle.licensePlate}
            </h4>
            <p className="text-sm text-gray-600">Maruti Suzuki Alto</p>
            <p className="text-lg font-semibold text-gray-600">
              {ride?.licensePlate}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-between flex-col items-center">
          <div className="w-full mt-5">
            <div className="flex items-center gap-5 p-3 border-b-2">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-lg font-medium">Destination</h3>
                <p className="text-sm -mt-1 text-gray-600">
                  {ride?.endLocation}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 p-3">
              <i className="ri-currency-line"></i>
              <div>
                <h3 className="text-lg font-medium">₹{ride?.fare} </h3>
                <p className="text-sm -mt-1 text-gray-600">Cash</p>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg">
          Make a Payment
        </button>
      </div>
    </div>
  );
};

export default Riding;
