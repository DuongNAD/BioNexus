// BioNexus ParticleMorph Fragment Shader
// Chấm tròn mềm mại (Soft Circular Disc) với hàm mũ mượt mà

precision mediump float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  // Khoảng cách từ tâm điểm hạt (gl_PointCoord nằm trong [0, 1])
  float dist = length(gl_PointCoord - vec2(0.5));
  
  // Cắt bỏ phần ngoài rìa hình tròn
  if (dist > 0.5) {
    discard;
  }

  // Làm mịn rìa hạt bằng hàm smoothstep luỹ thừa 1.6
  float strength = pow(smoothstep(0.5, 0.0, dist), 1.6);

  gl_FragColor = vec4(vColor, strength * vAlpha);
}
