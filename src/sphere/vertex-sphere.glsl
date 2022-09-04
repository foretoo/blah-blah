uniform float time;
uniform float seed;
uniform float sphereScale;
uniform float noiseScale;
uniform float roughness;

#include ../shared/cnoise;
const float PI = 3.14159265;



void main() {

  float t = time * 0.15 + seed * 10.0;

  vec3 cpos = cnoise(position * noiseScale + t) * sphereScale;

  // float n = snoise(position + t) * 0.5 + 0.5;
  // vec3 pos = mix(position, cpos, 1.0 - n * 0.1);

  vec4 mvPos = modelViewMatrix * vec4(cpos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  gl_PointSize = 1.0;
  // gl_PointSize = cos(abs(mvPos.z * PI / 2.0)) * 2.0;
}