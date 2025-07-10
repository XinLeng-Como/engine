// Ocean Material Script for PlayCanvas Editor v1.77
// Compatible with PlayCanvas Engine v1.77.0 and earlier
var OceanMaterial = pc.createScript('oceanMaterial');

// Script attributes for editor configuration
OceanMaterial.attributes.add('reflectionTexture', {
    type: 'asset',
    assetType: 'texture',
    title: 'Reflection Texture',
    description: 'Reflection texture from planar renderer (will be set automatically by ocean system)'
});

OceanMaterial.attributes.add('waveSpeed', {
    type: 'number',
    default: 0.0,  // Disabled for testing reflections
    min: 0.0,
    max: 5.0,
    title: 'Wave Speed',
    description: 'Speed of wave animation'
});

OceanMaterial.attributes.add('waveScale', {
    type: 'number',
    default: 0.0,  // Disabled for testing reflections
    min: 0.0,
    max: 0.2,
    title: 'Wave Scale',
    description: 'Scale of wave distortion effect'
});

OceanMaterial.attributes.add('vertexWaveHeight', {
    type: 'number',
    default: 0.0,  // Disabled for testing reflections
    min: 0.0,
    max: 2.0,
    title: 'Vertex Wave Height',
    description: 'Height of vertex-level wave displacement'
});

OceanMaterial.attributes.add('oceanColor', {
    type: 'rgb',
    default: [0.0, 0.1, 0.2],
    title: 'Ocean Color',
    description: 'Base color tint for the ocean'
});

OceanMaterial.attributes.add('reflectionStrength', {
    type: 'number',
    default: 0.8,
    min: 0.0,
    max: 1.0,
    title: 'Reflection Strength',
    description: 'Strength of reflection effect'
});

// Ocean vertex shader (GLSL only - v1.77 compatible)
OceanMaterial.prototype.getVertexShaderGLSL = function() {
    return [
        'attribute vec4 aPosition;',
        'attribute vec2 aUv0;',
        '',
        'uniform mat4 matrix_model;',
        'uniform mat4 matrix_viewProjection;',
        'uniform float uTime;',
        'uniform float uVertexWaveHeight;',
        '',
        'varying vec2 vUv0;',
        '',
        'void main(void)',
        '{',
        '    vec4 position = aPosition;',
        '    ',
        '    // create wave effect on vertex level',
        '    float wave = sin(position.x * 0.5 + uTime) * uVertexWaveHeight + sin(position.z * 0.3 + uTime * 1.5) * uVertexWaveHeight;',
        '    position.y += wave;',
        '    ',
        '    gl_Position = matrix_viewProjection * matrix_model * position;',
        '    vUv0 = aUv0;',
        '}'
    ].join('\n');
};

// Ocean fragment shader (GLSL only - v1.77 compatible)
OceanMaterial.prototype.getFragmentShaderGLSL = function() {
    var precision = this.app.graphicsDevice.precision;
    return [
        'precision ' + precision + ' float;',
        '',
        '// engine built-in constant storing render target size in .xy and inverse size in .zw',
        'uniform vec4 uScreenSize;',
        '',
        '// reflection texture',
        'uniform sampler2D uDiffuseMap;',
        '',
        '// ocean parameters',
        'uniform float uTime;',
        'uniform float uWaveScale;',
        'uniform vec3 uOceanColor;',
        'uniform float uReflectionStrength;',
        '',
        'varying vec2 vUv0;',
        '',
        'void main(void)',
        '{',
        '    // calculate reflection coordinates (screen space)',
        '    vec2 screenCoord = gl_FragCoord.xy * uScreenSize.zw;',
        '    ',
        '    // add wave distortion',
        '    float wave = sin(gl_FragCoord.x * 0.05 + uTime) * uWaveScale;',
        '    screenCoord.x += wave;',
        '    ',
        '    // flip Y coordinate for reflection (mirror effect)',
        '    screenCoord.y = 1.0 - screenCoord.y;',
        '',
        '    // sample reflection texture',
        '    vec4 reflection = texture2D(uDiffuseMap, screenCoord);',
        '',
        '    // mix reflection with ocean color',
        '    vec3 reflectionColor = reflection.xyz * uReflectionStrength;',
        '    vec3 finalColor = mix(uOceanColor, reflectionColor, uReflectionStrength);',
        '    ',
        '    gl_FragColor = vec4(finalColor, 1.0);',
        '}'
    ].join('\n');
};

// Create a fallback texture for when reflection isn't available
OceanMaterial.prototype.createFallbackTexture = function() {
    console.log('🖼️ OceanMaterial: Creating fallback texture...');
    
    try {
        var device = this.app.graphicsDevice;
        
        // Create a simple 1x1 blue texture as fallback
        this.fallbackTexture = new pc.Texture(device, {
            width: 1,
            height: 1,
            format: pc.PIXELFORMAT_R8_G8_B8_A8
        });
        
        // Set blue ocean color (RGBA)
        var pixels = new Uint8Array([0, 32, 64, 255]); // Dark blue
        this.fallbackTexture.lock().set(pixels);
        this.fallbackTexture.unlock();
        
        console.log('✅ OceanMaterial: Fallback texture created successfully');
    } catch (error) {
        console.error('❌ OceanMaterial: Failed to create fallback texture:', error);
        this.fallbackTexture = null;
    }
};

// Initialize the ocean material
OceanMaterial.prototype.initialize = function() {
    console.log('🌊 OceanMaterial: Starting initialization on entity:', this.entity.name);
    
    try {
        this.time = 0;
        this.oceanShader = null;
        this.oceanMaterial = null;
        
        // Check if entity has render component
        if (!this.entity.render) {
            console.error('❌ OceanMaterial: Entity has no render component!');
            return;
        }
        
        console.log('🌊 OceanMaterial: Entity render details:', {
            type: this.entity.render.type,
            layers: this.entity.render.layers,
            currentMaterial: this.entity.render.material ? 'has material' : 'no material'
        });
        
        // Create fallback texture for when reflection isn't ready
        this.createFallbackTexture();
        
        // Create the ocean shader and material (v1.77 compatible)
        this.createOceanMaterial();
        
        // Apply to the entity's render component
        this.applyMaterialToEntity();
        
        console.log('✅ OceanMaterial: Initialization completed successfully');
        
    } catch (error) {
        console.error('❌ OceanMaterial: Initialization failed:', error);
        console.error('❌ Stack trace:', error.stack);
    }
};

OceanMaterial.prototype.createOceanMaterial = function() {
    console.log('🔧 OceanMaterial: Creating ocean shader and material...');
    var device = this.app.graphicsDevice;
    
    try {
        // Create shader definition (v1.77 compatible)
        var shaderDefinition = {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION,
                aUv0: pc.SEMANTIC_TEXCOORD0
            },
            vshader: this.getVertexShaderGLSL(),
            fshader: this.getFragmentShaderGLSL()
        };
        
        console.log('🔧 OceanMaterial: Shader definition created, compiling...');
        
        // Create shader and material (legacy API)
        this.oceanShader = new pc.Shader(device, shaderDefinition);
        this.oceanMaterial = new pc.Material();
        this.oceanMaterial.shader = this.oceanShader;
        
        console.log('✅ OceanMaterial: Shader compiled successfully');
        
        // Set initial parameters
        this.updateShaderParameters();
        
        console.log('✅ OceanMaterial: Material creation completed');
    } catch (error) {
        console.error('❌ OceanMaterial: Failed to create shader/material:', error);
    }
};

OceanMaterial.prototype.updateShaderParameters = function() {
    if (!this.oceanMaterial) return;
    
    // Update time and ocean parameters
    this.oceanMaterial.setParameter('uTime', this.time * this.waveSpeed);
    this.oceanMaterial.setParameter('uWaveScale', this.waveScale);
    this.oceanMaterial.setParameter('uVertexWaveHeight', this.vertexWaveHeight);
    this.oceanMaterial.setParameter('uOceanColor', [this.oceanColor.r, this.oceanColor.g, this.oceanColor.b]);
    this.oceanMaterial.setParameter('uReflectionStrength', this.reflectionStrength);
    
    // Set reflection texture if available, otherwise use fallback
    if (this.reflectionTexture && this.reflectionTexture.resource) {
        this.oceanMaterial.setParameter('uDiffuseMap', this.reflectionTexture.resource);
        console.log('🖼️ OceanMaterial: Using reflection texture');
    } else if (this.fallbackTexture) {
        this.oceanMaterial.setParameter('uDiffuseMap', this.fallbackTexture);
        console.log('🖼️ OceanMaterial: Using fallback texture');
    } else {
        console.warn('⚠️ OceanMaterial: No texture available for uDiffuseMap');
    }
    
    this.oceanMaterial.update();
};

OceanMaterial.prototype.applyMaterialToEntity = function() {
    console.log('🎨 OceanMaterial: Applying material to entity...');
    // Apply the material to the entity's render component
    if (this.entity.render && this.oceanMaterial) {
        var oldMaterial = this.entity.render.material;
        this.entity.render.material = this.oceanMaterial;
        console.log('✅ OceanMaterial: Material applied successfully', {
            oldMaterial: oldMaterial ? 'had material' : 'no material',
            newMaterial: 'ocean shader material'
        });
    } else {
        console.error('❌ OceanMaterial: Cannot apply material:', {
            hasRender: !!this.entity.render,
            hasMaterial: !!this.oceanMaterial
        });
    }
};

// Set reflection texture (called by ocean system)
OceanMaterial.prototype.setReflectionTexture = function(texture) {
    console.log('🖼️ OceanMaterial: Setting reflection texture...', {
        hasMaterial: !!this.oceanMaterial,
        hasTexture: !!texture,
        textureSize: texture ? texture.width + 'x' + texture.height : 'N/A',
        textureFormat: texture ? texture.format : 'N/A',
        isReady: texture ? texture.ready : 'N/A'
    });
    
    if (this.oceanMaterial && texture) {
        // Temporarily store texture for debugging
        this.debugTexture = texture;
        
        // Set the texture parameter
        this.oceanMaterial.setParameter('uDiffuseMap', texture);
        this.oceanMaterial.update();
        
        // Force refresh the mesh instances to ensure the material is updated
        if (this.entity.render && this.entity.render.meshInstances) {
            for (var i = 0; i < this.entity.render.meshInstances.length; i++) {
                this.entity.render.meshInstances[i].material = this.oceanMaterial;
            }
        }
        
        console.log('✅ OceanMaterial: Reflection texture applied successfully', {
            materialParams: Object.keys(this.oceanMaterial.parameters || {}),
            meshInstanceCount: this.entity.render ? this.entity.render.meshInstances.length : 0
        });
    } else {
        console.warn('⚠️ OceanMaterial: Cannot set reflection texture:', {
            hasMaterial: !!this.oceanMaterial,
            hasTexture: !!texture
        });
    }
};

// Update function called every frame
OceanMaterial.prototype.update = function(dt) {
    this.time += dt;
    this.updateShaderParameters();
};

// Handle attribute changes in editor
OceanMaterial.prototype.postInitialize = function() {
    console.log('🔧 OceanMaterial: Running postInitialize...');
    var self = this;
    
    // Check if initialization was successful
    console.log('🔍 OceanMaterial: PostInit status check:', {
        hasShader: !!this.oceanShader,
        hasMaterial: !!this.oceanMaterial,
        entityName: this.entity.name
    });
    
    // Listen for attribute changes (v1.77 compatible)
    this.on('attr:waveSpeed', function() {
        self.updateShaderParameters();
    });
    this.on('attr:waveScale', function() {
        self.updateShaderParameters();
    });
    this.on('attr:vertexWaveHeight', function() {
        self.updateShaderParameters();
    });
    this.on('attr:oceanColor', function() {
        self.updateShaderParameters();
    });
    this.on('attr:reflectionStrength', function() {
        self.updateShaderParameters();
    });
    this.on('attr:reflectionTexture', function() {
        self.updateShaderParameters();
    });
    
    console.log('✅ OceanMaterial: PostInitialize completed');
};

// Handle script swapping (v1.77 compatibility)
OceanMaterial.prototype.swap = function(old) {
    // Restore original material if it exists
    if (old && old.entity && old.entity.render && old.entity.render.material) {
        if (old.oceanMaterial) {
            // Store reference to the new material before cleanup
            var newMaterial = this.oceanMaterial;
            
            // Clean up old shader and material
            if (old.oceanShader) {
                old.oceanShader.destroy();
            }
            
            // Apply new material
            if (newMaterial) {
                old.entity.render.material = newMaterial;
            }
        }
    }
};

// Cleanup (v1.77 compatibility)
OceanMaterial.prototype.destroy = function() {
    // Clean up shader
    if (this.oceanShader) {
        this.oceanShader.destroy();
        this.oceanShader = null;
    }
    
    // Clean up fallback texture
    if (this.fallbackTexture) {
        this.fallbackTexture.destroy();
        this.fallbackTexture = null;
    }
    
    // Note: Material cleanup is handled by the engine
    this.oceanMaterial = null;
}; 