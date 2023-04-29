uniform float time;
uniform vec2 pixels;
float PI = 3.1415926535897932384626433832;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vColor;


void main() {
    gl_FragColor = vec4(vUv,0.0, 1.);
    gl_FragColor = vec4(vColor,1.);

}