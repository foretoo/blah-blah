#define PHI 1.61803398875

const int tetr_factor = 8;
const int oct_factor = 4;
const int cube_factor = 6;
const int dodec_factor = 4;
const int icos_factor = 4;



float tetr(vec3 pos, float r) {
  pos.xz = abs(pos.xz);
  vec3 n = normalize(vec3(0.0, sqrt(0.5), 1.0));
  float d = max(dot(pos, n.xyz), dot(pos, n.zyx * vec3(1.0, -1.0, 1.0)));

  for (int i = 0; i < tetr_factor; i++) d = sqrt(d);
    d -= 2.0;
  for (int i = 0; i < tetr_factor; i++) d = d * d;

  return d * isTetra + 1.0 - isTetra;
}

float oct(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = normalize(vec3(1.0));
  float d = dot(pos, n);

  for (int i = 0; i < oct_factor; i++) d = sqrt(d);
    d -= 2.0;
  for (int i = 0; i < oct_factor; i++) d = d * d;

  return d * isOcta + 1.0 - isOcta;
}

float cube(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = vec3(1.0, 0.0, 0.0);
  float d =    dot(pos, n.xyz);
    d = max(d, dot(pos, n.zxy));
    d = max(d, dot(pos, n.yzx));
  
  for (int i = 0; i < cube_factor; i++) d = sqrt(d);
    d -= 2.0;
  for (int i = 0; i < cube_factor; i++) d = d * d;

  return d * isCube + 1.0 - isCube;
}

float dodec(vec3 pos, float r){
  pos = abs(pos);
	vec3 n = normalize(vec3(PHI, 1.0, 0.0));
	float d =    dot(pos, n.xyz);
    d = max(d, dot(pos, n.yzx));
    d = max(d, dot(pos, n.zxy));

  for (int i = 0; i < dodec_factor; i++) d = sqrt(d);
    d -= 2.0;
  for (int i = 0; i < dodec_factor; i++) d = d * d;

  return d * isDodeca + 1.0 - isDodeca;
}

float icos(vec3 pos, float r) {
  pos = abs(pos);
  vec3 n = normalize(vec3(0, 1.0 / PHI, PHI));
  float d =    dot(pos, normalize(vec3(1)));
    d = max(d, dot(pos, n.xyz));
    d = max(d, dot(pos, n.yzx));
    d = max(d, dot(pos, n.zxy));

  for (int i = 0; i < icos_factor; i++) d = sqrt(d);
    d -= 2.0;
  for (int i = 0; i < icos_factor; i++) d = d * d;

  return d * isIcosa + 1.0 - isIcosa;
}



vec3 platonic(vec3 pos, float r) {
  pos *= tetr(pos, 2.0) * 0.618;
  pos *= oct(pos, 2.0)  * 0.8;
  pos *= cube(pos, 2.0) * 0.9;
  pos *= dodec(pos, 2.0);
  pos *= icos(pos, 2.0);
  return pos;
}