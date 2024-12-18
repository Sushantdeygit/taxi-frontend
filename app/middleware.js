import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Retrieve captain and user tokens from cookies
  const captainToken = req.cookies.get("captain_token");
  const userToken = req.cookies.get("user_token");

  // If the captain is logged in, they should not access user login/signup pages
  if (captainToken) {
    try {
      // Decode the captain token
      const decodedCaptain = jwt.verify(captainToken, process.env.JWT_SECRET);

      // Redirect captain if trying to access user-login or user-signup pages
      if (pathname === "/login" || pathname === "/signup") {
        return NextResponse.redirect(new URL("/captain-dashboard", req.url));
      }
    } catch (error) {
      console.error("Invalid or expired captain token", error);
    }
  }

  // If the user is logged in, they should not access captain login/signup pages
  if (userToken) {
    try {
      // Decode the user token
      const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);

      // Redirect user if trying to access captain-login or captain-signup pages
      if (pathname === "/captain-login" || pathname === "/captain-signup") {
        return NextResponse.redirect(new URL("/user-dashboard", req.url));
      }
    } catch (error) {
      console.error("Invalid or expired user token", error);
    }
  }

  return NextResponse.next(); // Continue if no redirection needed
}

export const config = {
  matcher: ["/login", "/signup", "/captain-login", "/captain-signup"],
};
