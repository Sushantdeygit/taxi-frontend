"use client";
import React from "react";
import { PRODUCT_NAME } from "@/constants";
import Link from "next/link";
import Image from "next/image";

const LandinPage = () => {
  return (
    <div className="mt-10 p-8 xl:px-20 flex md:flex-row flex-col justify-around">
      <div className="flex flex-col justify-start items-start mt-10 gap-8 ">
        <h1 className="text-6xl font-bold text-primary">
          Go anywhere with {PRODUCT_NAME}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-[700px]">
          Rapido, with Bike-Taxis, Autos & Cabs is revolutionising the way India
          travels. With a presence in 150+ cities and over 100 million safe
          rides completed, Rapido is becoming India’s go-to app for comfortable
          and affordable rides.
        </p>
        <div className="mt-7 flex flex-col md:flex-row gap-4 md:gap-8 ">
          <Link
            href="/signup"
            className="grid place-items-center  p-4 w-[200px] 2xl:w-[420px] font-bold rounded-full  bg-white hover:bg-white/80  text-black text-sm md:text-lg"
          >
            Join as a Passenger
          </Link>
          <Link
            href="/captain-signup"
            className="grid place-items-center  p-4 w-[200px] 2xl:w-[420px] font-bold rounded-full  bg-gradient-to-r from-violet-900 to-violet-600 hover:from-violet-950 hover:to-violet-900 text-white text-sm md:text-lg"
          >
            Join as a Captain
          </Link>
        </div>
      </div>
      <div className="hidden 2xl:block">
        <Image
          src="https://plus.unsplash.com/premium_photo-1729018715734-ae43c1fb56de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={600}
          height={600}
          alt="hero"
          className="w-full h-full object-cover 2xl: rounded-md sm:rounded-2xl"
        />
      </div>
    </div>
  );
};

export default LandinPage;
