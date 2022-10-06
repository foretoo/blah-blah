uniform sampler2D positionTexture;

uniform float time;
uniform float seed;
uniform float sphereScale;
uniform float noiseScale;
uniform float roughness;
uniform float platonicness;

uniform float isTetra;
uniform float isOcta;
uniform float isCube;
uniform float isDodeca;
uniform float isIcosa;

#include ../../shared/cnoise;
#include ../../shared/rough3D;
#include ../../shared/platonic;



void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 position = texture(positionTexture, uv).xyz;

  float t = time * 0.15 + seed * 10.0;

  vec3 rpos = rough3D(position);
  float rlen = length(rpos);
  rpos *= rlen * roughness;

  vec3 cpos = cnoise((position + rpos) * noiseScale + t);

  vec3 ppos = platonic(cpos, 2.0);

  position = mix(cpos, ppos, platonicness) * sphereScale;

  // float n = snoise(position + t) * 0.5 + 0.5;
  // vec3 pos = mix(position, cpos, 1.0 - n * 0.1);

  gl_FragColor = vec4(position, 1.0);

}