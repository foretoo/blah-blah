uniform sampler2D positionTexture;
uniform sampler2D responsedPositionTexture;
uniform sampler2D velocityTexture;
uniform vec4 pointer;
uniform vec3 prevPointer;
uniform float time;

const float PI  = 3.14159265359;
const float PHI = 1.61803398875;
const float LEN = PHI;



void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 initialPosition = texture(positionTexture, uv).xyz;
  vec3 currentPosition = texture(responsedPositionTexture, uv).xyz;
  vec3 velocity = texture(velocityTexture, uv).xyz;
  vec3 ptr  = pointer.xyx     * vec3(cos(time), 1.0, sin(time));
  vec3 pptr = prevPointer.xyx * vec3(cos(time), 1.0, sin(time));



    vec3 pdiff = ptr - pptr;
    pdiff = length(pdiff) > 0.0 ? normalize(pdiff) : vec3(0.0);
    vec3 diff = currentPosition - ptr;
    float dlen = length(diff);
    float force = dlen < LEN
      ? 1.0 - pow(1.0 - pow(1.0 - dlen / LEN, 3.0), 0.333) // cos((dlen / LEN) * PI) * 0.5 + 0.5
      : 0.0;
    force *= pointer.w * 0.5;

    // push from pointer
    velocity += mix(normalize(diff), pdiff, 0.333) * force;

    // damp velocity of pushing away
    velocity *= 0.95;

    // pull back to initiate position
    diff = initialPosition - currentPosition;
    velocity += diff * 0.0001;



  gl_FragColor = vec4(velocity, 1.0);
}