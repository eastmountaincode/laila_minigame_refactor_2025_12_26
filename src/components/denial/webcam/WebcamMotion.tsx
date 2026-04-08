"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  vertexShaderSource,
  fragmentShaderSource,
  compileShader,
  createProgram,
} from "./motionShaders";

// Motion detection threshold (0-1, lower = more sensitive)
const DEFAULT_THRESHOLD = 0.02; // Desktop threshold
const MOBILE_THRESHOLD = 0.06; // Higher threshold for mobile (less sensitive)

interface WebcamMotionProps {
  /** Whether webcam is active */
  isActive: boolean;
  /** Motion threshold (0-1), default ~0.012 */
  threshold?: number;
  /** Additional CSS classes */
  className?: string;
}

export function WebcamMotion({
  isActive,
  threshold,
  className = "",
}: WebcamMotionProps) {
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Use mobile threshold if on mobile and no custom threshold provided
  const effectiveThreshold = threshold ?? (isMobile ? MOBILE_THRESHOLD : DEFAULT_THRESHOLD);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texturesRef = useRef<WebGLTexture[]>([]);
  const frameIndexRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    // Clear any existing textures from previous mounts
    texturesRef.current = [];

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
      console.error("WebGL not supported");
      return false;
    }
    glRef.current = gl;

    // Compile shaders
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return false;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;
    programRef.current = program;

    // Set up geometry (full-screen quad)
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    const texCoords = new Float32Array([
      0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0,
    ]);

    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Texture coordinate buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    const texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    // Create two textures for frame comparison
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture();
      if (!texture) return false;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // Initialize texture with 1x1 black pixel to prevent undefined data
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
      texturesRef.current.push(texture);
    }

    gl.useProgram(program);
    return true;
  }, []);

  // Render a frame
  const renderFrame = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const video = videoRef.current;
    const textures = texturesRef.current;

    if (!gl || !program || !video || textures.length < 2) return;
    if (video.readyState < video.HAVE_CURRENT_DATA) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const frameCount = frameIndexRef.current;
    const currentIndex = frameCount % 2;
    const previousIndex = (frameCount + 1) % 2;

    // Upload current video frame to current texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[currentIndex]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    // First 2 frames: initialize both textures with video data and show black
    // This ensures we have valid data in both textures before starting motion detection
    if (frameCount < 2) {
      // Also upload to the other texture slot so both have valid data
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[previousIndex]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      // Clear to black during initialization
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    } else {
      // Make sure our shader program is active
      gl.useProgram(program);

      // Bind current frame to texture unit 0
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[currentIndex]);
      gl.uniform1i(gl.getUniformLocation(program, "u_currentFrame"), 0);

      // Bind previous frame to texture unit 1
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[previousIndex]);
      gl.uniform1i(gl.getUniformLocation(program, "u_previousFrame"), 1);

      // Set threshold uniform
      gl.uniform1f(gl.getUniformLocation(program, "u_threshold"), effectiveThreshold);

      // Draw the motion difference
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Increment frame counter
    frameIndexRef.current++;

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [effectiveThreshold]);

  // Start webcam
  const startWebcam = useCallback(async () => {
    // Check if getUserMedia is available (requires HTTPS except on localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn(
        "getUserMedia not available. Webcam requires HTTPS (except on localhost)."
      );
      return;
    }

    // Reset frame counter so we start fresh
    frameIndexRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      // Create video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      await video.play();
      videoRef.current = video;

      // Resize canvas to match video
      const canvas = canvasRef.current;
      if (canvas && glRef.current) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        glRef.current.viewport(0, 0, canvas.width, canvas.height);
      }

      // Start render loop
      renderFrame();
    } catch (err) {
      console.error("Failed to access webcam:", err);
    }
  }, [renderFrame]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }

    // Stop video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }

    // Stop stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear canvas to black
    const gl = glRef.current;
    if (gl) {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }, []);

  // Initialize WebGL on mount
  useEffect(() => {
    initWebGL();

    return () => {
      stopWebcam();
      // Clean up WebGL resources
      const gl = glRef.current;
      if (gl) {
        texturesRef.current.forEach((tex) => gl.deleteTexture(tex));
        if (programRef.current) gl.deleteProgram(programRef.current);
      }
    };
  }, [initWebGL, stopWebcam]);

  // Start/stop webcam based on isActive
  useEffect(() => {
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }
  }, [isActive, startWebcam, stopWebcam]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
