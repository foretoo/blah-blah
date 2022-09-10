uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D positionTexture;

uniform float time;
uniform float seed;
uniform float sphereScale;
uniform float noiseScale;
uniform float roughness;

#include ../../shared/cnoise;
#include ../../shared/rough3D;

const float PI = 3.14159265359;



void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 position = texture(positionTexture, uv).xyz;

  float t = time * 0.15 + seed * 10.0;

  vec3 rpos = rough3D(position);
  float rlen = length(rpos);
  rpos *= rlen * roughness;

  vec3 cpos = cnoise((position + rpos) * noiseScale + t) * sphereScale;

  // float n = snoise(position + t) * 0.5 + 0.5;
  // vec3 pos = mix(position, cpos, 1.0 - n * 0.1);

  gl_FragColor = vec4(cpos, 1.0);

  // vec4 mvPos = modelViewMatrix * vec4(cpos, 1.0);
  // gl_FragColor = projectionMatrix * mvPos;

}