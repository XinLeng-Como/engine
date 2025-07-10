#include "gammaPS"

// engine built-in constant storing render target size in .xy and inverse size in .zw
uniform vec4 uScreenSize;

// reflection texture
uniform sampler2D uDiffuseMap;

// ocean wave offset
uniform float uTime;

void main(void)
{
    // calculate wave
    float wave = sin(gl_FragCoord.x * 0.05 + uTime) * 0.05;
    vec2 coord = gl_FragCoord.xy * uScreenSize.zw + wave;
    coord.y = 1.0 - coord.y;

    // sample reflection texture
    vec4 reflection = texture2D(uDiffuseMap, coord);

    vec3 oceanColor = reflection.xyz * 0.4 + vec3(0.0, 0.1, 0.2);
    gl_FragColor.rgb = gammaCorrectOutput(oceanColor);
    gl_FragColor.a = 1.0;
}

