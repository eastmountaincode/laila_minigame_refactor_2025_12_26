"use client";

import { useState } from "react";
import {
  DrawingCanvas,
  TreatReveal,
  WorthQuestion,
  FinalPopup,
} from "@/components/bargaining";

type Stage = "drawing" | "treat" | "worth" | "final";

export default function BargainingPage() {
  const [stage, setStage] = useState<Stage>("drawing");

  const advance = () => {
    setStage((prev) => {
      const order: Stage[] = ["drawing", "treat", "worth", "final"];
      const idx = order.indexOf(prev);
      return order[Math.min(idx + 1, order.length - 1)];
    });
  };

  return (
    <main className="min-h-dvh bg-black text-white">
      {stage === "drawing" && <DrawingCanvas onComplete={advance} />}
      {stage === "treat" && <TreatReveal onComplete={advance} />}
      {stage === "worth" && <WorthQuestion onComplete={advance} />}
      {stage === "final" && <FinalPopup onComplete={advance} />}
    </main>
  );
}


