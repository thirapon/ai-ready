import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TracksSection } from "@/components/landing/TracksSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RolesSection } from "@/components/landing/RolesSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TracksSection />
        <HowItWorks />
        <RolesSection />
      </main>
      <Footer />
    </>
  );
}
