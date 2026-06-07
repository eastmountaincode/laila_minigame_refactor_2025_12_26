"use client";

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STAGE_WIDTH = 2400;
const STAGE_HEIGHT = 2300;
const FRAME_MS = 180;
const STORAGE_KEY = "pinball-hand-animation-layer-overrides-v1";

type Layer = {
  id: string;
  src: string;
  alt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mirrored?: boolean;
  rotation?: number;
  zIndex?: number;
};

type Frame = {
  name: string;
  duration?: number;
  layers: Layer[];
};

type LayerOverride = Partial<Pick<Layer, "x" | "y" | "width" | "height" | "rotation">>;
type LayerOverrides = Record<string, LayerOverride>;
type EditableLayerKey = keyof Required<LayerOverride>;

type Interaction = {
  type: "move" | "resize";
  layerId: string;
  startPoint: { x: number; y: number };
  startLayer: Layer;
  aspectRatio: number;
};

const asset = (fileName: string) => `/assets/pinball-hands/${fileName}`;

const makeFlipperPair = (
  fileName: string,
  frameNumber: number,
  placement: {
    y: number;
    width: number;
    height: number;
    inset: number;
    leftRotation?: number;
    rightRotation?: number;
  }
): Layer[] => [
  {
    id: `flipper-left-${frameNumber}`,
    src: asset(fileName),
    alt: `Left pinball hand frame ${frameNumber}`,
    x: placement.inset,
    y: placement.y,
    width: placement.width,
    height: placement.height,
    mirrored: true,
    rotation: placement.leftRotation ?? 180,
    zIndex: 1,
  },
  {
    id: `flipper-right-${frameNumber}`,
    src: asset(fileName),
    alt: `Right pinball hand frame ${frameNumber}`,
    x: STAGE_WIDTH - placement.inset - placement.width,
    y: placement.y,
    width: placement.width,
    height: placement.height,
    rotation: placement.rightRotation ?? 180,
    zIndex: 1,
  },
];

const frames: Frame[] = [
  {
    name: "flipper hands 1",
    layers: makeFlipperPair("RL_Hands_1.png", 1, {
      y: 705,
      inset: 90,
      width: 1040,
      height: 573,
    }),
  },
  {
    name: "flipper hands 2",
    layers: makeFlipperPair("RL_Hands_2.png", 2, {
      y: 560,
      inset: 245,
      width: 845,
      height: 715,
    }),
  },
  {
    name: "flipper hands 3",
    layers: makeFlipperPair("RL_Hands_3.png", 3, {
      y: 420,
      inset: 345,
      width: 735,
      height: 831,
    }),
  },
  {
    name: "flipper hands 4",
    duration: 220,
    layers: makeFlipperPair("RL_Hands_4.png", 4, {
      y: 330,
      inset: 585,
      width: 650,
      height: 800,
      leftRotation: 172,
      rightRotation: 182,
    }),
  },
  {
    name: "split hands 1",
    duration: 220,
    layers: [
      {
        id: "split-left-1",
        src: asset("L_Hand_1.png"),
        alt: "Left hand frame 1",
        x: 455,
        y: 560,
        width: 790,
        height: 1085,
        rotation: 180,
        zIndex: 1,
      },
      {
        id: "split-right-1",
        src: asset("R_Hand_1.png"),
        alt: "Right hand frame 1",
        x: 1120,
        y: 580,
        width: 808,
        height: 1060,
        rotation: 180,
        zIndex: 2,
      },
    ],
  },
  {
    name: "split hands 2",
    duration: 260,
    layers: [
      {
        id: "split-left-2",
        src: asset("L_Hand_2.png"),
        alt: "Left hand frame 2",
        x: 455,
        y: 565,
        width: 762,
        height: 1059,
        rotation: 180,
        zIndex: 1,
      },
      {
        id: "split-right-2",
        src: asset("R_Hand_2.png"),
        alt: "Right hand frame 2",
        x: 1095,
        y: 575,
        width: 882,
        height: 1033,
        rotation: 180,
        zIndex: 2,
      },
    ],
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getLayerTransform = (layer: Layer) => {
  const transforms = [];

  if (layer.mirrored) transforms.push("scaleX(-1)");
  if (layer.rotation) transforms.push(`rotate(${layer.rotation}deg)`);

  return transforms.length ? transforms.join(" ") : undefined;
};

const layerBoxStyle = (layer: Layer): CSSProperties => ({
  left: `${(layer.x / STAGE_WIDTH) * 100}%`,
  top: `${(layer.y / STAGE_HEIGHT) * 100}%`,
  width: `${(layer.width / STAGE_WIDTH) * 100}%`,
  height: `${(layer.height / STAGE_HEIGHT) * 100}%`,
  zIndex: layer.zIndex ?? 1,
});

const imageStyle = (layer: Layer): CSSProperties => ({
  transform: getLayerTransform(layer),
});

const getLayerPoint = (
  event: ReactPointerEvent,
  stageElement: HTMLDivElement | null
) => {
  if (!stageElement) return null;

  const rect = stageElement.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * STAGE_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * STAGE_HEIGHT,
  };
};

export function PinballHandAnimation() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [showPreviousFrame, setShowPreviousFrame] = useState(false);
  const [overrides, setOverrides] = useState<LayerOverrides>({});
  const [hasLoadedOverrides, setHasLoadedOverrides] = useState(false);

  const frame = frames[currentFrame];
  const previousFrame = frames[(currentFrame - 1 + frames.length) % frames.length];
  const activeLayers = useMemo(
    () =>
      frame.layers.map((layer) => ({
        ...layer,
        ...overrides[layer.id],
      })),
    [frame.layers, overrides]
  );
  const previousLayers = useMemo(
    () =>
      previousFrame.layers.map((layer) => ({
        ...layer,
        ...overrides[layer.id],
      })),
    [overrides, previousFrame.layers]
  );
  const selectedLayer = activeLayers.find((layer) => layer.id === selectedLayerId);
  const frameLabel = useMemo(
    () => `${currentFrame + 1} / ${frames.length}`,
    [currentFrame]
  );

  useEffect(() => {
    try {
      const storedOverrides = window.localStorage.getItem(STORAGE_KEY);
      if (storedOverrides) setOverrides(JSON.parse(storedOverrides));
    } catch {
      setOverrides({});
    } finally {
      setHasLoadedOverrides(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedOverrides) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [hasLoadedOverrides, overrides]);

  useEffect(() => {
    if (activeLayers.some((layer) => layer.id === selectedLayerId)) return;
    setSelectedLayerId(activeLayers[0]?.id ?? null);
  }, [activeLayers, selectedLayerId]);

  useEffect(() => {
    if (!isPlaying) return;

    const timeout = window.setTimeout(() => {
      setCurrentFrame((index) => (index + 1) % frames.length);
    }, frame.duration ?? FRAME_MS);

    return () => window.clearTimeout(timeout);
  }, [currentFrame, frame.duration, isPlaying]);

  const updateLayer = useCallback(
    (
      layerId: string,
      getNextOverride: (currentLayer: Layer) => LayerOverride
    ) => {
      const baseLayer = frames
        .flatMap((animationFrame) => animationFrame.layers)
        .find((layer) => layer.id === layerId);

      if (!baseLayer) return;

      setOverrides((currentOverrides) => {
        const currentLayer = {
          ...baseLayer,
          ...currentOverrides[layerId],
        };

        return {
          ...currentOverrides,
          [layerId]: {
            ...currentOverrides[layerId],
            ...getNextOverride(currentLayer),
          },
        };
      });
    },
    []
  );

  const updateSelectedLayerValue = (key: EditableLayerKey, value: number) => {
    if (!selectedLayer) return;
    updateLayer(selectedLayer.id, () => ({ [key]: value }));
  };

  const resetLayer = (layerId: string) => {
    setOverrides((currentOverrides) => {
      const nextOverrides = { ...currentOverrides };
      delete nextOverrides[layerId];
      return nextOverrides;
    });
  };

  const resetAllLayers = () => setOverrides({});

  const handleLayerPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    layer: Layer
  ) => {
    const startPoint = getLayerPoint(event, stageRef.current);
    if (!startPoint) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPlaying(false);
    setSelectedLayerId(layer.id);
    interactionRef.current = {
      type: "move",
      layerId: layer.id,
      startPoint,
      startLayer: layer,
      aspectRatio: layer.width / layer.height,
    };
  };

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    layer: Layer
  ) => {
    const startPoint = getLayerPoint(event, stageRef.current);
    if (!startPoint) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPlaying(false);
    setSelectedLayerId(layer.id);
    interactionRef.current = {
      type: "resize",
      layerId: layer.id,
      startPoint,
      startLayer: layer,
      aspectRatio: layer.width / layer.height,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    const nextPoint = getLayerPoint(event, stageRef.current);
    if (!interaction || !nextPoint) return;

    event.preventDefault();

    const deltaX = nextPoint.x - interaction.startPoint.x;
    const deltaY = nextPoint.y - interaction.startPoint.y;

    if (interaction.type === "move") {
      updateLayer(interaction.layerId, () => ({
        x: Math.round(
          clamp(
            interaction.startLayer.x + deltaX,
            -interaction.startLayer.width * 0.5,
            STAGE_WIDTH - interaction.startLayer.width * 0.5
          )
        ),
        y: Math.round(
          clamp(
            interaction.startLayer.y + deltaY,
            -interaction.startLayer.height * 0.5,
            STAGE_HEIGHT - interaction.startLayer.height * 0.5
          )
        ),
      }));
      return;
    }

    const widthFromDrag = interaction.startLayer.width + deltaX;
    const heightFromDrag = interaction.startLayer.height + deltaY;
    const nextWidth =
      Math.abs(deltaX) >= Math.abs(deltaY)
        ? widthFromDrag
        : heightFromDrag * interaction.aspectRatio;
    const clampedWidth = clamp(Math.round(nextWidth), 80, STAGE_WIDTH);

    updateLayer(interaction.layerId, () => ({
      width: clampedWidth,
      height: Math.round(clampedWidth / interaction.aspectRatio),
    }));
  };

  const handlePointerEnd = () => {
    interactionRef.current = null;
  };

  const goToPrevious = () => {
    setCurrentFrame((index) => (index - 1 + frames.length) % frames.length);
  };

  const goToNext = () => {
    setCurrentFrame((index) => (index + 1) % frames.length);
  };

  return (
    <main className="min-h-screen bg-[#060505] text-[#f4eadb]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-5 px-4 py-6">
        <section
          ref={stageRef}
          className="relative w-full max-w-[1040px] touch-none overflow-hidden bg-transparent"
          style={{ aspectRatio: `${STAGE_WIDTH} / ${STAGE_HEIGHT}` }}
          aria-label="Pinball hand animation test"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          {showPreviousFrame
            ? previousLayers.map((layer) => (
                <div
                  key={`previous-${layer.id}`}
                  className="pointer-events-none absolute touch-none opacity-25"
                  style={layerBoxStyle(layer)}
                  aria-hidden
                >
                  <img
                    src={layer.src}
                    alt=""
                    className="h-full w-full select-none object-contain"
                    style={imageStyle(layer)}
                    draggable={false}
                  />
                </div>
              ))
            : null}

          {activeLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;

            return (
              <div
                key={layer.id}
                className={[
                  "absolute touch-none",
                  isSelected ? "outline outline-2 outline-[#f4eadb]" : "",
                ].join(" ")}
                style={layerBoxStyle(layer)}
                onPointerDown={(event) => handleLayerPointerDown(event, layer)}
              >
                <img
                  src={layer.src}
                  alt={layer.alt}
                  className="h-full w-full select-none object-contain"
                  style={imageStyle(layer)}
                  draggable={false}
                />
                {isSelected ? (
                  <button
                    type="button"
                    aria-label={`Resize ${layer.alt}`}
                    className="absolute bottom-0 right-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-nwse-resize border border-[#060505] bg-[#f4eadb]"
                    onPointerDown={(event) => handleResizePointerDown(event, layer)}
                  />
                ) : null}
              </div>
            );
          })}
        </section>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <button
            type="button"
            className="border border-[#f4eadb]/50 px-3 py-1 hover:bg-[#f4eadb] hover:text-[#060505]"
            onClick={() => setIsPlaying((value) => !value)}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="border border-[#f4eadb]/50 px-3 py-1 hover:bg-[#f4eadb] hover:text-[#060505]"
            onClick={goToPrevious}
          >
            Previous
          </button>
          <button
            type="button"
            className="border border-[#f4eadb]/50 px-3 py-1 hover:bg-[#f4eadb] hover:text-[#060505]"
            onClick={goToNext}
          >
            Next
          </button>
          <span className="min-w-32 text-center text-[#f4eadb]/70">
            {frameLabel} · {frame.name}
          </span>
          <label className="flex items-center gap-2 border border-[#f4eadb]/30 px-3 py-1 text-[#f4eadb]/80">
            <input
              type="checkbox"
              checked={showPreviousFrame}
              onChange={(event) => setShowPreviousFrame(event.currentTarget.checked)}
            />
            <span>Show previous frame</span>
          </label>
        </div>

        <section className="w-full max-w-3xl border border-[#f4eadb]/25 p-3 text-sm">
          <div className="mb-3 flex flex-wrap gap-2">
            {activeLayers.map((layer) => (
              <button
                key={`select-${layer.id}`}
                type="button"
                className={[
                  "border px-3 py-1",
                  layer.id === selectedLayerId
                    ? "border-[#f4eadb] bg-[#f4eadb] text-[#060505]"
                    : "border-[#f4eadb]/50 hover:bg-[#f4eadb] hover:text-[#060505]",
                ].join(" ")}
                onClick={() => {
                  setIsPlaying(false);
                  setSelectedLayerId(layer.id);
                }}
              >
                {layer.id}
              </button>
            ))}
          </div>

          {selectedLayer ? (
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {(["x", "y", "width", "height", "rotation"] as EditableLayerKey[]).map(
                  (key) => (
                    <label key={key} className="grid gap-1">
                      <span className="text-[#f4eadb]/60">{key}</span>
                      <input
                        type="number"
                        className="w-full border border-[#f4eadb]/40 bg-[#060505] px-2 py-1 text-[#f4eadb]"
                        value={Math.round(selectedLayer[key] ?? 0)}
                        onChange={(event) =>
                          updateSelectedLayerValue(
                            key,
                            Number(event.currentTarget.value)
                          )
                        }
                      />
                    </label>
                  )
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="border border-[#f4eadb]/50 px-3 py-1 hover:bg-[#f4eadb] hover:text-[#060505]"
                  onClick={() => resetLayer(selectedLayer.id)}
                >
                  Reset Layer
                </button>
                <button
                  type="button"
                  className="border border-[#f4eadb]/50 px-3 py-1 hover:bg-[#f4eadb] hover:text-[#060505]"
                  onClick={resetAllLayers}
                >
                  Reset All
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
