float random (vec2 st) {
  return fract( sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123 );
}

float rough (vec2 st) {
  return roughness * 0.05 * sign(random(st) - 0.5);
}