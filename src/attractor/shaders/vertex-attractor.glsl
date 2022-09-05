attribute vec2 reference;

uniform float seed;
uniform float time;
uniform float dotSize;
uniform float attractorScale;
uniform float noiseScale;
uniform float noiseStrength;

uniform sampler2D positionTexture;

#include ../../shared/cnoise;



void main() {
  gl_PointSize = dotSize;

  float t = time * 0.2 + seed;

  vec3 pos = texture(positionTexture, reference).xyz;
  vec3 cpos = cnoise(pos * noiseScale + t) * noiseStrength;
  pos = mix(pos, cpos, 0.9) * attractorScale;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}