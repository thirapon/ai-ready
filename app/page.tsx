"use client";

import { useLang } from "@/lib/i18n";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TracksSection } from "@/components/landing/TracksSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RolesSection } from "@/components/landing/RolesSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const { lang, setLang, t } = useLang();
  return (
    <>
      <Navbar t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} />
        <TracksSection t={t} />
        <HowItWorks t={t} />
        <RolesSection t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
