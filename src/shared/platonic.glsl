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
    d = pow(pow(d, 1.0/100.0) - r, 100.0) * 0.9;
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



vec3 platonic(vec3 pos, float r) {
  pos *= tetr(pos, 2.0);
  pos *= oct(pos, 2.0);
  pos *= cube(pos, 2.0);
  pos *= dodec(pos, 2.0);
  pos *= icos(pos, 2.0);
  return pos;
}