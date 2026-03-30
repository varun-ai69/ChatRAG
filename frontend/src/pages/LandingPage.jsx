import LandingNavbar from "../components/LandingNavbar";
import LandingHero from "../components/LandingHero";
import LandingFeatures from "../components/LandingFeatures";
import LandingAbout from "../components/LandingAbout";
import LandingSetup from "../components/LandingSetup";
import LandingDemo from "../components/LandingDemo";
import LandingFooter from "../components/LandingFooter";

export default function LandingPage() {
  return (
    <div 
      id="landing-scroll-container" 
      className="bg-[#0B0C10] w-full h-screen overflow-y-auto overflow-x-hidden selection:bg-brand selection:text-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingAbout />
      <LandingSetup />
      <LandingDemo />
      <LandingFooter />
    </div>
  );
}
