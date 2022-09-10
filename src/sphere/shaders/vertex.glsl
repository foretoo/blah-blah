attribute vec2 ref;

uniform sampler2D positionTexture;
uniform float dotSize;



void main() {

  vec4 pos = texture(positionTexture, ref);

  vec4 mvPosition = modelViewMatrix * pos;
  gl_Position = projectionMatrix * mvPosition;

  // gl_Position = pos;

  gl_PointSize = dotSize;
}