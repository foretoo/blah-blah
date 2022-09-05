uniform float vel;
uniform float roughness;

uniform float tb;

uniform sampler2D positionTexture;

#include ../../shared/rough;

void main() {
  vec2 reference = gl_FragCoord.xy / resolution.xy;
  vec4 prev = texture(positionTexture, reference);

  float v = vel / 50.0;

  vec3 next = vec3(
    prev.x + v * (sin(prev.y) - tb * prev.x),
    prev.y + v * (sin(prev.z) - tb * prev.y),
    prev.z + v * (sin(prev.x) - tb * prev.z)
  );
  next.x += rough(next.xy) * roughness * 0.1;
  next.y += rough(next.yz) * roughness * 0.1;
  next.z += rough(next.zx) * roughness * 0.1;

  gl_FragColor = vec4(next, 1.0);
}