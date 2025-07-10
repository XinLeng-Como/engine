attribute vec4 aPosition;
attribute vec2 aUv0;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
uniform float uTime;

varying vec2 vUv0;

void main(void)
{
    vec4 position = aPosition;
    
    // create wave effect on vertex level
    float wave = sin(position.x * 0.5 + uTime) * 0.1 + sin(position.z * 0.3 + uTime * 1.5) * 0.1;
    position.y += wave;
    
    gl_Position = matrix_viewProjection * matrix_model * position;
    vUv0 = aUv0;
}
