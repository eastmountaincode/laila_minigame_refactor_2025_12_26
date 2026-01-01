"use client";

import { useEffect, useRef, useState } from "react";
import type p5Types from "p5";

interface WebcamMotionDetectionProps {
  className?: string;
  onReady?: () => void;
}

export function WebcamMotionDetection({
  className = "",
  onReady,
}: WebcamMotionDetectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5Types | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initP5 = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically import p5.js (only runs on client)
        const p5Module = await import("p5");
        const p5 = p5Module.default;

        if (!mounted) return;

        const sketch = (p: p5Types) => {
          let capture: p5Types.Element | null = null;
          let prevFrame: p5Types.Image | null = null;
          let diffFrame: p5Types.Image | null = null;
          let isReady = false;
          const diffThreshold = 15;

          p.setup = () => {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.style("display", "block");
            p.pixelDensity(1);

            // Request webcam access
            capture = p.createCapture(
              {
                video: {
                  width: { ideal: p.windowWidth },
                  height: { ideal: p.windowHeight },
                  facingMode: "user",
                },
                audio: false,
              },
              () => {
                // Success callback
                if (mounted) {
                  setIsLoading(false);
                  onReady?.();
                }
              }
            );

            if (capture) {
              capture.hide();
              capture.size(p.width, p.height);
            }

            prevFrame = p.createImage(p.width, p.height);
            diffFrame = p.createImage(p.width, p.height);
          };

          p.draw = () => {
            if (!capture || !prevFrame || !diffFrame) return;

            // Load pixels from capture (cast to any - p5 types don't include these)
            const cap = capture as unknown as { loadPixels: () => void; pixels: number[] };
            cap.loadPixels();
            if (!cap.pixels || cap.pixels.length === 0) return;

            if (!isReady) {
              isReady = true;
            }

            // Process motion detection
            prevFrame.loadPixels();
            diffFrame.loadPixels();

            for (let i = 0; i < cap.pixels.length; i += 4) {
              const r = cap.pixels[i];
              const g = cap.pixels[i + 1];
              const b = cap.pixels[i + 2];

              const prevR = prevFrame.pixels[i] || 0;
              const prevG = prevFrame.pixels[i + 1] || 0;
              const prevB = prevFrame.pixels[i + 2] || 0;

              const diffR = Math.abs(r - prevR);
              const diffG = Math.abs(g - prevG);
              const diffB = Math.abs(b - prevB);

              // If there's motion, show the difference color
              if (
                diffR > diffThreshold ||
                diffG > diffThreshold ||
                diffB > diffThreshold
              ) {
                diffFrame.pixels[i] = diffR;
                diffFrame.pixels[i + 1] = diffG;
                diffFrame.pixels[i + 2] = diffB;
                diffFrame.pixels[i + 3] = 255;
              } else {
                // Transparent where no motion
                diffFrame.pixels[i] = 0;
                diffFrame.pixels[i + 1] = 0;
                diffFrame.pixels[i + 2] = 0;
                diffFrame.pixels[i + 3] = 0;
              }

              // Store current frame for next comparison
              prevFrame.pixels[i] = r;
              prevFrame.pixels[i + 1] = g;
              prevFrame.pixels[i + 2] = b;
              prevFrame.pixels[i + 3] = 255;
            }

            prevFrame.updatePixels();
            diffFrame.updatePixels();

            // Clear and draw mirrored
            p.clear();
            p.push();
            p.translate(p.width, 0);
            p.scale(-1, 1);
            p.image(diffFrame, 0, 0, p.width, p.height);
            p.pop();
          };

          p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            if (capture) {
              capture.size(p.width, p.height);
            }
            if (prevFrame) {
              prevFrame.resize(p.width, p.height);
            }
            if (diffFrame) {
              diffFrame.resize(p.width, p.height);
            }
          };
        };

        p5InstanceRef.current = new p5(sketch, containerRef.current);
      } catch (err) {
        if (mounted) {
          setError("Failed to initialize webcam");
          setIsLoading(false);
        }
      }
    };

    initP5();

    return () => {
      mounted = false;
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [onReady]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-black text-red-500 ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 ${className}`}
      style={{ zIndex: -1 }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white">Initializing camera...</div>
        </div>
      )}
    </div>
  );
}
