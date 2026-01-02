"use client";

import dynamic from "next/dynamic";
import { Building } from "@/types";

interface MapLoaderProps {
  buildings: Building[];
  onBuildingClick: (building: Building) => void;
}

// Dynamically import MapEngine with SSR disabled to avoid 'window is not defined'
const MapEngine = dynamic(
  () => import("./MapEngine").then((mod) => mod.MapEngine),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-sky-300 to-emerald-200 animate-pulse flex items-center justify-center">
        <span className="text-white font-bold text-xl">Loading Kingdom...</span>
      </div>
    ),
  }
);

export const MapLoader = (props: MapLoaderProps) => {
  return <MapEngine {...props} />;
};
