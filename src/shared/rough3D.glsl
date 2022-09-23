#include random;

vec3 rough3D (vec3 point) {
  float u = random(point.xy);
  float v = random(point.yz);
  float theta = u * 6.28318530718;
  float phi = acos(2.0 * v - 1.0);

  float sinTheta = sin(theta);
  float cosTheta = cos(theta);
  float sinPhi = sin(phi);
  float cosPhi = cos(phi);

  float r = sqrt(random(point.zx));
  float x = r * sinPhi * cosTheta;
  float y = r * sinPhi * sinTheta;
  float z = r * cosPhi;

  return vec3(x, y, z);
}