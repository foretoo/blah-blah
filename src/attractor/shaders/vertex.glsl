attribute vec2 reference;
uniform float dotSize;
uniform sampler2D positionTexture;



void main() {
  gl_PointSize = dotSize;

  vec4 pos = texture(positionTexture, reference);

  gl_Position = projectionMatrix * modelViewMatrix * pos;
}