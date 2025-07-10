/**
 * Wobble Shader Script
 * Apply this script to any entity with a render component to add a wobble effect.
 * The wobble effect displaces vertices using sine and cosine functions based on time.
 */

var WobbleShader = pc.createScript('wobbleShader');

// Script attributes
WobbleShader.attributes.add('wobbleStrength', {
    type: 'number',
    default: 0.1,
    title: 'Wobble Strength',
    description: 'Controls the intensity of the wobble effect'
});

WobbleShader.attributes.add('wobbleSpeed', {
    type: 'number',
    default: 1.0,
    title: 'Wobble Speed',
    description: 'Controls the speed of the wobble animation'
});

// Shader source code
WobbleShader.prototype.vertexShaderGLSL = `
attribute vec3 aPosition;
attribute vec2 aUv0;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
uniform float uTime;
uniform float uWobbleStrength;

varying vec2 vUv0;

void main(void)
{
    vec4 pos = matrix_model * vec4(aPosition, 1.0);
    pos.x += sin(uTime + pos.y * 4.0) * uWobbleStrength;
    pos.y += cos(uTime + pos.x * 4.0) * uWobbleStrength;
    vUv0 = aUv0;
    gl_Position = matrix_viewProjection * pos;
}
`;

WobbleShader.prototype.fragmentShaderGLSL = `
#include "gammaPS"

uniform sampler2D uDiffuseMap;

varying vec2 vUv0;

void main(void)
{
    vec4 linearColor = texture2D(uDiffuseMap, vUv0);
    gl_FragColor.rgb = gammaCorrectOutput(linearColor.rgb);
    gl_FragColor.a = 1.0;
}
`;

WobbleShader.prototype.vertexShaderWGSL = `
attribute aPosition: vec3f;
attribute aUv0: vec2f;

uniform matrix_model: mat4x4f;
uniform matrix_viewProjection: mat4x4f;
uniform uTime: f32;
uniform uWobbleStrength: f32;

varying vUv0: vec2f;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    var pos: vec4f = uniform.matrix_model * vec4f(input.aPosition, 1.0);
    pos.x = pos.x + sin(uniform.uTime + pos.y * 4.0) * uniform.uWobbleStrength;
    pos.y = pos.y + cos(uniform.uTime + pos.x * 4.0) * uniform.uWobbleStrength;
    output.vUv0 = input.aUv0;
    output.position = uniform.matrix_viewProjection * pos;
    return output;
}
`;

WobbleShader.prototype.fragmentShaderWGSL = `
#include "gammaPS"

var uDiffuseMap: texture_2d<f32>;
var uDiffuseMapSampler: sampler;

varying vUv0: vec2f;

@fragment
fn fragmentMain(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;
    let linearColor: vec4f = textureSample(uDiffuseMap, uDiffuseMapSampler, input.vUv0);
    let corrected_rgb: vec3f = gammaCorrectOutput(linearColor.rgb);
    output.color = vec4f(corrected_rgb, 1.0);
    return output;
}
`;

// Initialize the script
WobbleShader.prototype.initialize = function() {
    this.time = 0;
    this.originalMaterials = [];
    this.wobbleMaterial = null;
    
    // Get the render component
    var render = this.entity.render;
    if (!render) {
        console.warn('WobbleShader: Entity must have a render component');
        return;
    }
    
    // Store original materials
    render.meshInstances.forEach((meshInstance, index) => {
        this.originalMaterials[index] = meshInstance.material;
    });
    
    // Create the wobble material
    this.createWobbleMaterial();
    
    // Apply the material to all mesh instances
    this.applyWobbleMaterial();
};

// Create the custom wobble material
WobbleShader.prototype.createWobbleMaterial = function() {
    this.wobbleMaterial = new pc.ShaderMaterial({
        uniqueName: 'wobble-' + this.entity.getGuid(),
        vertexGLSL: this.vertexShaderGLSL,
        fragmentGLSL: this.fragmentShaderGLSL,
        vertexWGSL: this.vertexShaderWGSL,
        fragmentWGSL: this.fragmentShaderWGSL,
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0
        }
    });
    
    // Set initial parameters
    this.wobbleMaterial.setParameter('uTime', 0);
    this.wobbleMaterial.setParameter('uWobbleStrength', this.wobbleStrength);
};

// Apply the wobble material to mesh instances
WobbleShader.prototype.applyWobbleMaterial = function() {
    var render = this.entity.render;
    if (!render) return;
    
    render.meshInstances.forEach((meshInstance, index) => {
        var originalMaterial = this.originalMaterials[index];
        
        // Copy the diffuse texture from the original material if it exists
        if (originalMaterial && originalMaterial.diffuseMap) {
            this.wobbleMaterial.setParameter('uDiffuseMap', originalMaterial.diffuseMap);
        } else if (originalMaterial && originalMaterial.emissiveMap) {
            // Fallback to emissive map if no diffuse map
            this.wobbleMaterial.setParameter('uDiffuseMap', originalMaterial.emissiveMap);
        }
        
        // Apply the wobble material
        meshInstance.material = this.wobbleMaterial;
    });
    
    this.wobbleMaterial.update();
};

// Restore original materials
WobbleShader.prototype.restoreOriginalMaterials = function() {
    var render = this.entity.render;
    if (!render) return;
    
    render.meshInstances.forEach((meshInstance, index) => {
        if (this.originalMaterials[index]) {
            meshInstance.material = this.originalMaterials[index];
        }
    });
};

// Update the shader parameters
WobbleShader.prototype.update = function(dt) {
    if (!this.wobbleMaterial) return;
    
    this.time += dt * this.wobbleSpeed;
    
    // Update shader parameters
    this.wobbleMaterial.setParameter('uTime', this.time);
    this.wobbleMaterial.setParameter('uWobbleStrength', this.wobbleStrength);
    this.wobbleMaterial.update();
};

// Handle attribute changes in the editor
WobbleShader.prototype.postUpdate = function() {
    if (this.wobbleMaterial) {
        this.wobbleMaterial.setParameter('uWobbleStrength', this.wobbleStrength);
        this.wobbleMaterial.update();
    }
};

// Clean up when the script is destroyed
WobbleShader.prototype.swap = function(old) {
    if (old && old.wobbleMaterial) {
        this.restoreOriginalMaterials();
    }
}; 