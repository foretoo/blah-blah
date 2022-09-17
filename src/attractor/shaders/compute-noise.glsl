uniform float seed;
uniform float time;
uniform float attractorScale;
uniform float noiseScale;
uniform float noiseStrength;
uniform float platonicness;

uniform float isTetra;
uniform float isOcta;
uniform float isCube;
uniform float isDodeca;
uniform float isIcosa;

uniform sampler2D attractorTexture;

#include ../../shared/cnoise;
#include ../../shared/platonic;



void main() {

  vec2 reference = gl_FragCoord.xy / resolution.xy;

  float t = time * 0.2 + seed;

  vec3 pos = texture(attractorTexture, reference).xyz;
  vec3 cpos = cnoise(pos * noiseScale + t) * noiseStrength;
  pos = mix(pos, cpos, 0.9);

  vec3 ppos = platonic(pos, 2.0);

  pos = mix(pos, ppos, platonicness) * attractorScale;

  gl_FragColor = vec4(pos, 1.0);
}