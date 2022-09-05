uniform float vel;
uniform float roughness;

uniform float aa;
uniform float ab;
uniform float ac;
uniform float ad;
uniform float ae;
uniform float af;

uniform sampler2D positionTexture;

#include ../../shared/rough;

void main() {
  vec2 reference = gl_FragCoord.xy / resolution.xy;
  vec4 prev = texture(positionTexture, reference);
  float x = prev.x;
  float y = prev.y;
  float z = prev.z;
  float v = vel / 100.0;

  vec3 next = vec3(
    x + v * ((z - ab) * x - ad * y),
    y + v * (ad * x + (z - ab) * y),
    z + v * (ac + aa * z - z * z * z / 3.0 - (x * x + y * y) * (1.0 + ae * z) + af * z * x * x * x)
  );
  next.x += rough(next.xy) * roughness * 0.1;
  next.y += rough(next.yz) * roughness * 0.1;
  next.z += rough(next.zx) * roughness * 0.1;

  gl_FragColor = vec4(next, 1.0);
}