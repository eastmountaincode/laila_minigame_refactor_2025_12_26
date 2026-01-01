"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function DontTouchMePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showBored, setShowBored] = useState(false);
  const [p5Loaded, setP5Loaded] = useState(false);

  useEffect(() => {
    if (!p5Loaded || !canvasRef.current) return;

    // Show bored button after some time
    const timer = setTimeout(() => {
      setShowBored(true);
    }, 6500);

    // @ts-expect-error p5 is loaded via script
    const sketch = (p: typeof window.p5.prototype) => {
      const message = "dont touch me";
      const fontsize = 50;
      let x: number, y: number, textW: number, textH: number;

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current!);
        p.textFont("Arial");
        p.textSize(fontsize);
        textW = p.textWidth(message);
        textH = p.textAscent() + p.textDescent();
        x = p.width / 2 - textW / 2;
        y = p.height / 2 + textH / 2;
      };

      p.draw = () => {
        p.background(255);
        p.fill(0, 0, 255);
        p.text(message, x, y);

        // Text bounding box (with small padding)
        // y is the baseline, so text goes from (y - ascent) to (y + descent)
        const padding = 5;
        const textLeft = x - padding;
        const textRight = x + textW + padding;
        const textTop = y - p.textAscent() - padding;
        const textBottom = y + p.textDescent() + padding;

        // Draw hitbox in dev mode (press B to toggle)
        if (document.body.classList.contains("dev-mode")) {
          p.noFill();
          p.stroke(255, 0, 0);
          p.strokeWeight(2);
          p.rect(textLeft, textTop, textRight - textLeft, textBottom - textTop);
          p.noStroke();
        }

        // Check if mouse is within text bounding box
        const isNearText =
          p.mouseX >= textLeft &&
          p.mouseX <= textRight &&
          p.mouseY >= textTop &&
          p.mouseY <= textBottom;

        if (isNearText) {
          // Calculate direction away from mouse
          const textCenterX = x + textW / 2;
          const textCenterY = y - textH / 2;
          const dx = textCenterX - p.mouseX;
          const dy = textCenterY - p.mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Random jitter for panicked feel
          const jitterX = p.random(-15, 15);
          const jitterY = p.random(-15, 15);

          // Plus a push away from mouse to ensure escape
          const nx = distance > 0 ? dx / distance : 0;
          const ny = distance > 0 ? dy / distance : 0;
          const pushStrength = 10;

          x += jitterX + nx * pushStrength;
          y += jitterY + ny * pushStrength;

          // Keep text within bounds
          x = Math.max(0, Math.min(p.width - textW, x));
          y = Math.max(textH, Math.min(p.height, y));
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    // @ts-expect-error p5 is loaded via script
    const p5Instance = new window.p5(sketch);

    return () => {
      clearTimeout(timer);
      p5Instance.remove();
    };
  }, [p5Loaded]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.8.0/p5.min.js"
        onLoad={() => setP5Loaded(true)}
      />
      <main className="relative min-h-dvh cursor-pointer bg-white">
        <div ref={canvasRef} className="fixed inset-0 cursor-pointer" />

        {showBored && (
          <button
            onClick={() => router.push("/anger/sad-girl")}
            className="fixed bottom-[5%] right-[5%] cursor-pointer bg-[url('/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png')] bg-contain bg-center bg-no-repeat font-pixel text-[21px] text-black"
            style={{ width: "150px", height: "50px" }}
          >
            Bored
          </button>
        )}
      </main>
    </>
  );
}
