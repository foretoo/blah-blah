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

#define PI  3.14159265359
#define PHI 1.61803398875



float tetr(vec3 pos, float r) {
  pos.xz = abs(pos.xz);
  vec3 n = normalize(vec3(0.0, sqrt(0.5), 1.0));
  float d = max(dot(pos, n.xyz), dot(pos, n.zyx * vec3(1.0, -1.0, 1.0)));
  return pow(pow(d, 1.0/100.0) - r, 100.0);
}

float oct(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = normalize(vec3(1.0));
  float d = dot(pos, n);
  return pow(pow(d, 1.0/100.0) - r, 100.0);
}

float cube(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = vec3(1.0, 0.0, 0.0);
  float d =    dot(pos, n.xyz);
    d = max(d, dot(pos, n.zxy));
    d = max(d, dot(pos, n.yzx));
  return pow(pow(d, 1.0/100.0) - r, 100.0);
}

float dodec(vec3 pos, float r){
  pos = abs(pos);
	vec3 n = normalize(vec3(PHI, 1.0, 0.0));
	float d =    dot(pos, n.xyz);
    d = max(d, dot(pos, n.yzx));
    d = max(d, dot(pos, n.zxy));
	return pow(pow(d, 1.0/100.0) - r, 100.0);
}

float icos(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = normalize(vec3(0, 1.0 / PHI, PHI));
  float d =    dot(pos, normalize(vec3(1)));
    d = max(d, dot(pos, n.xyz));
    d = max(d, dot(pos, n.yzx));
    d = max(d, dot(pos, n.zxy));
  return pow(pow(d, 1.0/100.0) - r, 100.0);
}



void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 position = texture(positionTexture, uv).xyz;

  float t = time * 0.15 + seed * 10.0;

  vec3 rpos = rough3D(position);
  float rlen = length(rpos);
  rpos *= rlen * roughness;

  vec3 cpos = cnoise((position + rpos) * noiseScale + t);
  cpos *= cube(cpos, 2.0) * sphereScale;

  // float n = snoise(position + t) * 0.5 + 0.5;
  // vec3 pos = mix(position, cpos, 1.0 - n * 0.1);

  gl_FragColor = vec4(cpos, 1.0);

  // vec4 mvPos = modelViewMatrix * vec4(cpos, 1.0);
  // gl_FragColor = projectionMatrix * mvPos;

}