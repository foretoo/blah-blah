uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

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

#define PI  3.14159265359
#define PHI 1.61803398875



float tetr(vec3 pos, float r) {
  pos.xz = abs(pos.xz);
  vec3 n = normalize(vec3(0.0, sqrt(0.5), 1.0));
  float d = max(dot(pos, n.xyz), dot(pos, n.zyx * vec3(1.0, -1.0, 1.0)));
    d = pow(pow(d, 1.0/100.0) - r, 100.0) * 0.618;
  float result = d * isTetra + 1.0 - isTetra;
  return result;
}

float oct(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = normalize(vec3(1.0));
  float d = dot(pos, n);
    d = pow(pow(d, 1.0/100.0) - r, 100.0) * 0.8;
  float result = d * isOcta + 1.0 - isOcta;
  return result;
}

float cube(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = vec3(1.0, 0.0, 0.0);
  float d =    dot(pos, n.xyz);
    d = max(d, dot(pos, n.zxy));
    d = max(d, dot(pos, n.yzx));
    d = pow(pow(d, 1.0/100.0) - r, 100.0) * 0.8;
  float result = d * isCube + 1.0 - isCube;
  return result;
}

float dodec(vec3 pos, float r){
  pos = abs(pos);
	vec3 n = normalize(vec3(PHI, 1.0, 0.0));
	float d =    dot(pos, n.xyz);
    d = max(d, dot(pos, n.yzx));
    d = max(d, dot(pos, n.zxy));
	  d = pow(pow(d, 1.0/100.0) - r, 100.0);
  float result = d * isDodeca + 1.0 - isDodeca;
  return result;
}

float icos(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = normalize(vec3(0, 1.0 / PHI, PHI));
  float d =    dot(pos, normalize(vec3(1)));
    d = max(d, dot(pos, n.xyz));
    d = max(d, dot(pos, n.yzx));
    d = max(d, dot(pos, n.zxy));
    d = pow(pow(d, 1.0/100.0) - r, 100.0);
  float result = d * isIcosa + 1.0 - isIcosa;
  return result;
}



void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 position = texture(positionTexture, uv).xyz;

  float t = time * 0.15 + seed * 10.0;

  vec3 rpos = rough3D(position);
  float rlen = length(rpos);
  rpos *= rlen * roughness;

  vec3 cpos = cnoise((position + rpos) * noiseScale + t);
  vec3 platonic = cpos;
  platonic *= tetr(cpos, 2.0);
  platonic *= oct(cpos, 2.0);
  platonic *= cube(cpos, 2.0);
  platonic *= dodec(cpos, 2.0);
  platonic *= icos(cpos, 2.0);

  position = mix(cpos, platonic, platonicness) * sphereScale;

  // float n = snoise(position + t) * 0.5 + 0.5;
  // vec3 pos = mix(position, cpos, 1.0 - n * 0.1);

  gl_FragColor = vec4(position, 1.0);

  // vec4 mvPos = modelViewMatrix * vec4(cpos, 1.0);
  // gl_FragColor = projectionMatrix * mvPos;

}