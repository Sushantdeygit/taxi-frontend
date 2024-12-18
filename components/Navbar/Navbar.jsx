"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_NAME } from "@/constants";
export const Navbar = () => {
  const isAuth = false;

  return (
    <div
      className={`flex justify-between items-center w-full p-5 lg:py-6 lg:px-20  `}
    >
      <div className="text-white font-bold flex justify-around items-center gap-5 text-lg md:text-3xl">
        <Link href="/">{PRODUCT_NAME}</Link>
      </div>

      <div className="flex justify-center items-center gap-2 md:gap-8">
        <Link
          href={isAuth ? "/dashboard" : "/signup"}
          className="grid place-items-center  p-3 w-[90px] sm:w-[120px] font-bold rounded-full  bg-gradient-to-r from-violet-900 to-violet-600 hover:from-violet-950 hover:to-violet-900 text-white  text-sm md:text-lg"
        >
          {isAuth ? "Dashboard" : "SignUp"}
        </Link>
        {!isAuth && (
          <Link
            href="/login"
            className="grid place-items-center  p-3 w-[90px] sm:w-[120px] font-bold rounded-full bg-transparent hover:bg-blue-500/20 text-white  text-sm md:text-lg "
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};
