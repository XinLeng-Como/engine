#include "gammaPS"

struct FragmentInput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv0: vec2<f32>,
};

struct FragmentOutput {
    @location(0) color: vec4<f32>,
};

// engine built-in constant storing render target size in .xy and inverse size in .zw
@group(0) @binding(3) var<uniform> uScreenSize: vec4<f32>;

// reflection texture
@group(1) @binding(0) var uDiffuseMap: texture_2d<f32>;
@group(1) @binding(1) var uDiffuseMapSampler: sampler;

// ocean wave offset
@group(0) @binding(2) var<uniform> uTime: f32;

@fragment
fn fragmentMain(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;

    // calculate wave
    let wave: f32 = sin(input.position.x * 0.05 + uTime) * 0.05;
    var coord: vec2f = input.position.xy * uScreenSize.zw + vec2f(wave, 0.0);
    coord.y = 1.0 - coord.y;

    // sample reflection texture
    let reflection: vec4f = textureSample(uDiffuseMap, uDiffuseMapSampler, coord);

    let oceanColor: vec3f = reflection.xyz * 0.4 + vec3f(0.0, 0.1, 0.2);
    output.color = vec4f(gammaCorrectOutput(oceanColor), 1.0);
    return output;
}
