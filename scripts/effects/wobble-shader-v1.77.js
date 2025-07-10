/**
 * Wobble Shader Script for PlayCanvas Engine v1.77.0
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

// Initialize the script
WobbleShader.prototype.initialize = function() {
    this.time = 0;
    this.originalMaterials = [];
    this.wobbleMaterial = null;
    this.shader = null;
    
    // Get the render component
    var render = this.entity.render;
    if (!render) {
        console.warn('WobbleShader: Entity must have a render component');
        return;
    }
    
    // Store original materials
    var meshInstances = render.meshInstances;
    for (var i = 0; i < meshInstances.length; i++) {
        this.originalMaterials[i] = meshInstances[i].material;
    }
    
    // Create the wobble material
    this.createWobbleMaterial();
    
    // Apply the material to all mesh instances
    this.applyWobbleMaterial();
};

// Create the custom wobble material
WobbleShader.prototype.createWobbleMaterial = function() {
    var app = this.app;
    var gd = app.graphicsDevice;
    
    // Vertex shader source
    var vertexShader = [
        'attribute vec3 aPosition;',
        'attribute vec2 aUv0;',
        '',
        'uniform mat4 matrix_model;',
        'uniform mat4 matrix_viewProjection;',
        'uniform float uTime;',
        'uniform float uWobbleStrength;',
        '',
        'varying vec2 vUv0;',
        '',
        'void main(void)',
        '{',
        '    vec4 pos = matrix_model * vec4(aPosition, 1.0);',
        '    pos.x += sin(uTime + pos.y * 4.0) * uWobbleStrength;',
        '    pos.y += cos(uTime + pos.x * 4.0) * uWobbleStrength;',
        '    vUv0 = aUv0;',
        '    gl_Position = matrix_viewProjection * pos;',
        '}'
    ].join('\n');
    
    // Fragment shader source (with precision)
    var fragmentShader = [
        'precision ' + gd.precision + ' float;',
        '',
        'uniform sampler2D uDiffuseMap;',
        '',
        'varying vec2 vUv0;',
        '',
        'void main(void)',
        '{',
        '    vec4 color = texture2D(uDiffuseMap, vUv0);',
        '    gl_FragColor = color;',
        '}'
    ].join('\n');
    
    // Shader definition for PlayCanvas 1.77.0
    var shaderDefinition = {
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0
        },
        vshader: vertexShader,
        fshader: fragmentShader
    };
    
    // Create the shader
    this.shader = new pc.Shader(gd, shaderDefinition);
    
    // Create a new material and assign the shader
    this.wobbleMaterial = new pc.Material();
    this.wobbleMaterial.shader = this.shader;
    
    // Set initial parameters
    this.wobbleMaterial.setParameter('uTime', 0);
    this.wobbleMaterial.setParameter('uWobbleStrength', this.wobbleStrength);
};

// Apply the wobble material to mesh instances
WobbleShader.prototype.applyWobbleMaterial = function() {
    var render = this.entity.render;
    if (!render || !this.wobbleMaterial) return;
    
    var meshInstances = render.meshInstances;
    for (var i = 0; i < meshInstances.length; i++) {
        var meshInstance = meshInstances[i];
        var originalMaterial = this.originalMaterials[i];
        
        // Copy the diffuse texture from the original material if it exists
        if (originalMaterial && originalMaterial.diffuseMap) {
            this.wobbleMaterial.setParameter('uDiffuseMap', originalMaterial.diffuseMap);
        } else if (originalMaterial && originalMaterial.emissiveMap) {
            // Fallback to emissive map if no diffuse map
            this.wobbleMaterial.setParameter('uDiffuseMap', originalMaterial.emissiveMap);
        } else {
            // Create a white texture as fallback
            var whiteTexture = this.createWhiteTexture();
            this.wobbleMaterial.setParameter('uDiffuseMap', whiteTexture);
        }
        
        // Apply the wobble material
        meshInstance.material = this.wobbleMaterial;
    }
    
    // Update the material
    this.wobbleMaterial.update();
};

// Create a simple white texture as fallback
WobbleShader.prototype.createWhiteTexture = function() {
    if (this.whiteTexture) return this.whiteTexture;
    
    var device = this.app.graphicsDevice;
    this.whiteTexture = new pc.Texture(device, {
        width: 1,
        height: 1,
        format: pc.PIXELFORMAT_R8_G8_B8_A8
    });
    
    var pixels = new Uint8Array([255, 255, 255, 255]);
    this.whiteTexture.lock().set(pixels);
    this.whiteTexture.unlock();
    
    return this.whiteTexture;
};

// Restore original materials
WobbleShader.prototype.restoreOriginalMaterials = function() {
    var render = this.entity.render;
    if (!render) return;
    
    var meshInstances = render.meshInstances;
    for (var i = 0; i < meshInstances.length; i++) {
        if (this.originalMaterials[i]) {
            meshInstances[i].material = this.originalMaterials[i];
        }
    }
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

// Clean up when the script is destroyed or swapped
WobbleShader.prototype.swap = function(old) {
    // Restore original materials from the old script
    if (old && old.restoreOriginalMaterials) {
        old.restoreOriginalMaterials();
    }
    
    // Clean up old resources
    if (old && old.shader) {
        old.shader.destroy();
    }
    
    if (old && old.whiteTexture) {
        old.whiteTexture.destroy();
    }
};

// Clean up when the entity is destroyed
WobbleShader.prototype.destroy = function() {
    this.restoreOriginalMaterials();
    
    if (this.shader) {
        this.shader.destroy();
        this.shader = null;
    }
    
    if (this.whiteTexture) {
        this.whiteTexture.destroy();
        this.whiteTexture = null;
    }
    
    this.wobbleMaterial = null;
}; 