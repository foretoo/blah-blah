uniform sampler2D positionTexture;
uniform sampler2D responsedPositionTexture;
uniform sampler2D velocityTexture;
uniform vec4 pointer;

const float PI  = 3.14159265359;
const float PHI = 0.61803398875;
const float LEN = PHI * PI;



void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 initialPosition = texture(positionTexture, uv).xyz;
  vec3 currentPosition = texture(responsedPositionTexture, uv).xyz;
  vec2 velocity = texture(velocityTexture, uv).xy;



    vec2 diff = currentPosition.xy - pointer.xy;
    float dlen = length(diff);
    float force = dlen < LEN
      ? cos((dlen / LEN) * PI) * 0.5 + 0.5
      : 0.0;
    force *= pow(force, 3.0) * pointer.w * 0.1;

    // push from pointer
    velocity += normalize(diff) * force;

    // damp velocity of pushing away
    velocity *= 0.94;

    // pull back to initiate position
    diff = initialPosition.xy - currentPosition.xy;
    velocity += diff * 0.001;



  gl_FragColor = vec4(velocity, 0.0, 1.0);
  // gl_FragColor = vec4(diff, 0.0, 1.0);
}