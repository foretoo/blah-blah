uniform sampler2D positionTexture;
uniform sampler2D responsedPositionTexture;
uniform sampler2D velocityTexture;



void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 position = texture(positionTexture, uv);
  vec4 resPosition = texture(responsedPositionTexture, uv);
  vec4 velocity = texture(velocityTexture, uv);



  resPosition.x += velocity.x;
  resPosition.y += velocity.y;
  resPosition.z += velocity.z;



  gl_FragColor = mix(position, resPosition, 0.618);
}