struct VertexInput {
    @location(0) position: vec4<f32>,
    @location(1) uv0: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv0: vec2<f32>,
};

@group(0) @binding(0) var<uniform> matrix_model: mat4x4<f32>;
@group(0) @binding(1) var<uniform> matrix_viewProjection: mat4x4<f32>;
@group(0) @binding(2) var<uniform> uTime: f32;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    var position = input.position;
    
    // create wave effect on vertex level
    let wave: f32 = sin(position.x * 0.5 + uTime) * 0.1 + sin(position.z * 0.3 + uTime * 1.5) * 0.1;
    position.y = position.y + wave;
    
    output.position = matrix_viewProjection * matrix_model * position;
    output.uv0 = input.uv0;
    
    return output;
}
