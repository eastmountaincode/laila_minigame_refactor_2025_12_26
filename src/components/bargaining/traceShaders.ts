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

// High-contrast B&W threshold shader with aspect ratio correction
export const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_frame;
  uniform float u_threshold;
  uniform float u_opacity;
  uniform vec2 u_videoAspect;  // video width/height ratio correction

  varying vec2 v_texCoord;

  void main() {
    // Adjust UV to cover (crop to fill) rather than stretch
    vec2 uv = v_texCoord;
    uv = (uv - 0.5) * u_videoAspect + 0.5;

    // Discard pixels outside the video frame
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
      return;
    }

    vec4 color = texture2D(u_frame, uv);

    // Convert to grayscale
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Threshold to B&W
    float bw = step(u_threshold, gray);

    // White for bright areas, dark for shadow areas
    gl_FragColor = vec4(vec3(bw), u_opacity);
  }
`;

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
