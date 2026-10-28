"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

// WebGL; load it only in the browser and only when motion is allowed.
const LightRays = dynamic(() => import("@/components/LightRays"), { ssr: false });

export default function LandingRays() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.22),transparent_65%)]" />
      {!reducedMotion && (
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
        />
      )}
    </div>
  );
}
