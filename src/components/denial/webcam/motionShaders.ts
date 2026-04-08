// Vertex shader - just passes through positions and texture coordinates
export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Flip horizontally for mirror effect
    v_texCoord = vec2(1.0 - a_texCoord.x, a_texCoord.y);
  }
`;

// Fragment shader - compares current and previous frame, outputs motion
export const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_currentFrame;
  uniform sampler2D u_previousFrame;
  uniform float u_threshold;

  varying vec2 v_texCoord;

  void main() {
    vec4 current = texture2D(u_currentFrame, v_texCoord);
    vec4 previous = texture2D(u_previousFrame, v_texCoord);

    // Calculate absolute difference for each channel
    vec3 diff = abs(current.rgb - previous.rgb);

    // Check if any channel exceeds threshold
    float maxDiff = max(max(diff.r, diff.g), diff.b);

    if (maxDiff > u_threshold) {
      // Amplify the difference to make it more visible
      vec3 amplified = diff * 4.0;
      gl_FragColor = vec4(amplified, 1.0);
    } else {
      // No motion - black
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }
`;

// Helper to compile a shader
export function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Helper to create and link a program
export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}
