import LandingPage from "@/components/LandingPage/Home";
import { Navbar } from "@/components/Navbar/Navbar";
export default function Home() {
  return (
    <div className="bg-black h-screen">
      <Navbar />
      <LandingPage />
    </div>
  );
}
