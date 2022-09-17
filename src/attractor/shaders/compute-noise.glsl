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

  vec2 reference = gl_FragCoord.xy / resolution.xy;

  float t = time * 0.2 + seed;

  vec3 pos = texture(attractorTexture, reference).xyz;
  vec3 cpos = cnoise(pos * noiseScale + t) * noiseStrength;
  pos = mix(pos, cpos, 0.9);

  vec3 platonic = pos;
  platonic *= tetr(cpos, 2.0);
  platonic *= oct(cpos, 2.0);
  platonic *= cube(cpos, 2.0);
  platonic *= dodec(cpos, 2.0);
  platonic *= icos(cpos, 2.0);

  pos = mix(pos, platonic, platonicness) * attractorScale;

  gl_FragColor = vec4(pos, 1.0);
}