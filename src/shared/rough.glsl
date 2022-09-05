float random (vec2 st) {
  return fract( sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123 );
}

float rough (vec2 st) {
  return (random(st) - 0.5) * 2.0;
}