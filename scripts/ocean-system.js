// Ocean System Controller for PlayCanvas Editor v1.77
// This script coordinates planar reflections with ocean materials
// to create a complete ocean reflection system.
// Compatible with PlayCanvas Engine v1.77.0 and earlier

var OceanSystem = pc.createScript('oceanSystem');

// Script attributes for editor configuration
OceanSystem.attributes.add('oceanPlane', {
    type: 'entity',
    title: 'Ocean Plane',
    description: 'The plane entity that will act as the ocean surface. Should have a render component and ocean material script.'
});

OceanSystem.attributes.add('mainCamera', {
    type: 'entity',
    title: 'Main Camera',
    description: 'The main camera entity. If not set, will auto-find camera named "Camera".'
});

OceanSystem.attributes.add('reflectionLayers', {
    type: 'string',
    default: 'World,Skybox',
    title: 'Reflection Layers',
    description: 'Comma-separated list of layer names to include in reflections.'
});

OceanSystem.attributes.add('reflectionScale', {
    type: 'number',
    default: 0.5,
    min: 0.1,
    max: 2.0,
    title: 'Reflection Resolution Scale',
    description: 'Scale of reflection texture relative to screen resolution (lower = better performance).'
});

OceanSystem.attributes.add('createOceanPlane', {
    type: 'boolean',
    default: true,
    title: 'Auto-Create Ocean Plane',
    description: 'Automatically create an ocean plane if none is specified.'
});

OceanSystem.attributes.add('oceanSize', {
    type: 'number',
    default: 100,
    min: 1,
    max: 1000,
    title: 'Ocean Size',
    description: 'Size of the auto-created ocean plane.'
});

OceanSystem.attributes.add('oceanPosition', {
    type: 'vec3',
    default: [0, 0, 0],
    title: 'Ocean Position',
    description: 'Position of the auto-created ocean plane.'
});

OceanSystem.attributes.add('excludeOceanFromReflection', {
    type: 'boolean',
    default: true,
    title: 'Exclude Ocean from Reflection',
    description: 'Automatically create an "Excluded" layer for the ocean to prevent self-reflection.'
});

// Initialize the ocean system
OceanSystem.prototype.initialize = function() {
    console.log('🌊 OceanSystem: Starting initialization...');
    this.reflectionCamera = null;
    this.oceanPlaneEntity = null;
    this.excludedLayer = null;

    // Auto-find main camera if not set
    if (!this.mainCamera) {
        console.log('🌊 OceanSystem: No main camera set, searching for "Camera" entity...');
        this.mainCamera = this.app.root.findByName('Camera');
        if (!this.mainCamera) {
            console.error('🌊 OceanSystem: No main camera entity set and could not find entity named "Camera".');
            return;
        }
        console.log('🌊 OceanSystem: Found main camera:', this.mainCamera.name);
    } else {
        console.log('🌊 OceanSystem: Using provided main camera:', this.mainCamera.name);
    }

    // Setup the ocean system
    this.setupOceanSystem();
};

OceanSystem.prototype.setupOceanSystem = function() {
    console.log('🌊 OceanSystem: Setting up ocean system...');
    console.log('🌊 Settings:', {
        excludeOceanFromReflection: this.excludeOceanFromReflection,
        createOceanPlane: this.createOceanPlane,
        oceanSize: this.oceanSize,
        oceanPosition: this.oceanPosition,
        reflectionScale: this.reflectionScale,
        reflectionLayers: this.reflectionLayers
    });
    
    // List available scripts for debugging
    console.log('📋 Available scripts in registry:', Object.keys(pc.scripts || {}));
    if (this.app.systems && this.app.systems.script && this.app.systems.script._scripts) {
        console.log('📋 Scripts in script system:', Object.keys(this.app.systems.script._scripts));
    }

    // Create excluded layer if needed
    if (this.excludeOceanFromReflection) {
        console.log('🌊 OceanSystem: Creating excluded layer...');
        this.createExcludedLayer();
    } else {
        console.log('🌊 OceanSystem: Skipping excluded layer creation');
    }

    // Setup or create ocean plane
    console.log('🌊 OceanSystem: Setting up ocean plane...');
    this.setupOceanPlane();

    // Create reflection camera
    console.log('🌊 OceanSystem: Creating reflection camera...');
    this.createReflectionCamera();

    // Connect reflection texture to ocean material
    console.log('🌊 OceanSystem: Connecting reflection to ocean...');
    this.connectReflectionToOcean();

    console.log('✅ OceanSystem: Setup completed successfully');
};

OceanSystem.prototype.createExcludedLayer = function() {
    console.log('🔍 OceanSystem: Checking for existing Excluded layer...');
    // Check if excluded layer already exists
    this.excludedLayer = this.app.scene.layers.getLayerByName('Excluded');
    
    if (!this.excludedLayer) {
        console.log('🔍 OceanSystem: Excluded layer not found, creating new one...');
        // Create excluded layer for objects that shouldn't appear in reflections
        this.excludedLayer = new pc.Layer({ name: 'Excluded' });
        
        // Insert it after the World layer
        var worldLayer = this.app.scene.layers.getLayerByName('World');
        if (worldLayer) {
            var insertIndex = this.app.scene.layers.getTransparentIndex(worldLayer) + 1;
            this.app.scene.layers.insert(this.excludedLayer, insertIndex);
            console.log('✅ OceanSystem: Created "Excluded" layer and inserted after World layer at index', insertIndex);
        } else {
            this.app.scene.layers.push(this.excludedLayer);
            console.log('⚠️ OceanSystem: World layer not found, added Excluded layer to end of list');
        }
        
        // Add excluded layer to main camera so it's visible
        if (this.mainCamera && this.mainCamera.camera) {
            var currentLayers = this.mainCamera.camera.layers.slice();
            // Only add if not already present
            if (currentLayers.indexOf(this.excludedLayer.id) === -1) {
                currentLayers.push(this.excludedLayer.id);
                this.mainCamera.camera.layers = currentLayers;
                console.log('✅ OceanSystem: Added Excluded layer to main camera layers:', currentLayers);
            } else {
                console.log('ℹ️ OceanSystem: Excluded layer already in main camera layers');
            }
        }
    } else {
        console.log('✅ OceanSystem: Found existing Excluded layer');
    }
};

OceanSystem.prototype.setupOceanPlane = function() {
    console.log('🌊 OceanSystem: Setting up ocean plane...');
    console.log('🌊 oceanPlane entity provided:', !!this.oceanPlane);
    console.log('🌊 createOceanPlane enabled:', this.createOceanPlane);
    
    if (this.oceanPlane) {
        // Use provided ocean plane
        console.log('✅ OceanSystem: Using provided ocean plane entity:', this.oceanPlane.name);
        this.oceanPlaneEntity = this.oceanPlane;
    } else if (this.createOceanPlane) {
        // Create ocean plane automatically
        console.log('🔧 OceanSystem: Creating ocean plane automatically...');
        this.createOceanPlaneEntity();
    } else {
        console.warn('⚠️ OceanSystem: No ocean plane specified and auto-create is disabled.');
        return;
    }

    // Log ocean plane details
    if (this.oceanPlaneEntity) {
        console.log('🌊 Ocean plane details:', {
            name: this.oceanPlaneEntity.name,
            hasRender: !!this.oceanPlaneEntity.render,
            currentLayers: this.oceanPlaneEntity.render ? this.oceanPlaneEntity.render.layers : 'no render',
            position: this.oceanPlaneEntity.getPosition().toString(),
            scale: this.oceanPlaneEntity.getLocalScale().toString()
        });
    }

    // Move ocean to excluded layer if we have one
    if (this.excludeOceanFromReflection && this.excludedLayer && this.oceanPlaneEntity && this.oceanPlaneEntity.render) {
        var currentLayers = this.oceanPlaneEntity.render.layers.slice();
        console.log('🔄 OceanSystem: Moving ocean from layers', currentLayers, 'to Excluded layer', this.excludedLayer.id);
        
        // Remove from other layers and add to excluded layer
        this.oceanPlaneEntity.render.layers = [this.excludedLayer.id];
        console.log('✅ OceanSystem: Moved ocean plane to Excluded layer');
    } else if (!this.excludeOceanFromReflection) {
        console.log('🌊 OceanSystem: Leaving ocean plane in current layers (exclude disabled)');
    } else {
        console.log('⚠️ OceanSystem: Cannot move to excluded layer - missing requirements:', {
            excludeEnabled: this.excludeOceanFromReflection,
            hasExcludedLayer: !!this.excludedLayer,
            hasOceanEntity: !!this.oceanPlaneEntity,
            hasRenderComponent: !!(this.oceanPlaneEntity && this.oceanPlaneEntity.render)
        });
    }
};

OceanSystem.prototype.createOceanPlaneEntity = function() {
    // Create ocean plane entity
    this.oceanPlaneEntity = new pc.Entity('Ocean');
    
    // Add render component
    this.oceanPlaneEntity.addComponent('render', {
        type: 'plane'
    });
    
    // Add script component and ocean material script
    this.oceanPlaneEntity.addComponent('script');
    
    // Set position and scale
    this.oceanPlaneEntity.setLocalPosition(this.oceanPosition);
    this.oceanPlaneEntity.setLocalScale(this.oceanSize, 1, this.oceanSize);
    
    // Add to scene
    this.app.root.addChild(this.oceanPlaneEntity);
    
    // Wait for scripts to be loaded and add ocean material script
    var self = this;
    var addScriptAttempts = 0;
    var maxScriptAttempts = 10;
    
    var tryAddScript = function() {
        addScriptAttempts++;
        console.log('🔧 OceanSystem: Attempting to add oceanMaterial script (attempt ' + addScriptAttempts + '/' + maxScriptAttempts + ')...');
        
        if (self.oceanPlaneEntity.script) {
            try {
                var script = self.oceanPlaneEntity.script.create('oceanMaterial');
                if (script) {
                    console.log('✅ OceanSystem: Successfully created oceanMaterial script');
                    
                    // Wait for initialization and trigger connection
                    setTimeout(function() {
                        console.log('🔍 OceanSystem: Checking oceanMaterial initialization...', {
                            scriptExists: !!self.oceanPlaneEntity.script.oceanMaterial,
                            hasShader: !!(self.oceanPlaneEntity.script.oceanMaterial && self.oceanPlaneEntity.script.oceanMaterial.oceanShader),
                            hasMaterial: !!(self.oceanPlaneEntity.script.oceanMaterial && self.oceanPlaneEntity.script.oceanMaterial.oceanMaterial)
                        });
                        
                        // Trigger connection check
                        setTimeout(function() {
                            self.connectReflectionToOcean();
                        }, 500);
                    }, 200);
                    
                    return; // Success, stop trying
                } else {
                    console.warn('⚠️ OceanSystem: Script creation returned null - script may not be loaded yet');
                }
            } catch (error) {
                console.warn('⚠️ OceanSystem: Error creating oceanMaterial script:', error.message);
            }
        } else {
            console.error('❌ OceanSystem: Ocean plane entity has no script component');
            return; // No point retrying without script component
        }
        
        // Retry if not successful and we haven't exceeded max attempts
        if (addScriptAttempts < maxScriptAttempts) {
            setTimeout(tryAddScript, 100);
        } else {
            console.error('❌ OceanSystem: Failed to create oceanMaterial script after ' + maxScriptAttempts + ' attempts');
            console.log('💡 OceanSystem: Please manually add the "oceanMaterial" script to your ocean plane entity');
        }
    };
    
    // Start trying after a short delay
    setTimeout(tryAddScript, 100);
    
    console.log('OceanSystem: Created ocean plane entity');
};

OceanSystem.prototype.createReflectionCamera = function() {
    // Create reflection camera entity
    this.reflectionCamera = new pc.Entity('ReflectionCamera');
    
    // Add camera component
    this.reflectionCamera.addComponent('camera', {
        fov: 60,
        priority: -1, // Render before main camera
        toneMapping: pc.TONEMAP_ACES,
        enabled: true
    });
    
    // Add script component
    this.reflectionCamera.addComponent('script');
    
    // Add to scene
    this.app.root.addChild(this.reflectionCamera);
    
    // Wait a frame for the script component to be ready
    var self = this;
    this.app.once('update', function() {
        console.log('🔧 OceanSystem: Attempting to add planarRendererEditor script to reflection camera...');
        if (self.reflectionCamera.script) {
            try {
                // Create planar renderer script
                var script = self.reflectionCamera.script.create('planarRendererEditor', {
                    attributes: {
                        sceneCameraEntity: self.mainCamera,
                        scale: self.reflectionScale,
                        planePoint: self.oceanPosition,
                        planeNormal: [0, 1, 0],
                        layerNames: self.reflectionLayers,
                        autoUpdate: true,
                        mipmaps: false,
                        depth: true
                    }
                });
                
                if (script) {
                    console.log('✅ OceanSystem: Successfully created planarRendererEditor script with config:', {
                        mainCamera: self.mainCamera ? self.mainCamera.name : 'none',
                        reflectionScale: self.reflectionScale,
                        oceanPosition: self.oceanPosition.toString(),
                        reflectionLayers: self.reflectionLayers,
                        cameraLayers: self.reflectionCamera.camera.layers
                    });
                } else {
                    console.error('❌ OceanSystem: Failed to create planarRendererEditor script - script not found or invalid');
                }
            } catch (error) {
                console.error('❌ OceanSystem: Error creating planarRendererEditor script:', error);
            }
        } else {
            console.error('❌ OceanSystem: Reflection camera entity has no script component');
        }
    });
};

OceanSystem.prototype.connectReflectionToOcean = function() {
    console.log('🔗 OceanSystem: Connecting reflection to ocean...');
    if (!this.oceanPlaneEntity) {
        console.error('❌ OceanSystem: No ocean plane entity to connect to');
        return;
    }
    
    // Wait for both ocean material and reflection camera to be ready
    var self = this;
    var attemptCount = 0;
    var maxAttempts = 60; // Try for 60 frames (about 1 second at 60fps)
    
    var checkConnection = function() {
        attemptCount++;
        console.log('🔗 OceanSystem: Connection attempt', attemptCount + '/' + maxAttempts);
        
        var oceanMaterial = self.oceanPlaneEntity.script && self.oceanPlaneEntity.script.oceanMaterial;
        var planarRenderer = self.reflectionCamera && self.reflectionCamera.script && self.reflectionCamera.script.planarRendererEditor;
        
        console.log('🔗 Connection status:', {
            hasOceanScript: !!(self.oceanPlaneEntity.script),
            hasOceanMaterial: !!oceanMaterial,
            hasReflectionCamera: !!self.reflectionCamera,
            hasReflectionScript: !!(self.reflectionCamera && self.reflectionCamera.script),
            hasPlanarRenderer: !!planarRenderer
        });
        
        // Debug: What scripts are actually on the ocean plane?
        if (self.oceanPlaneEntity.script) {
            console.log('🔍 Scripts on ocean plane:', Object.keys(self.oceanPlaneEntity.script));
            if (self.oceanPlaneEntity.script.oceanMaterial) {
                console.log('🔍 OceanMaterial properties:', {
                    hasShader: !!self.oceanPlaneEntity.script.oceanMaterial.oceanShader,
                    hasMaterial: !!self.oceanPlaneEntity.script.oceanMaterial.oceanMaterial,
                    hasSetReflectionTexture: typeof self.oceanPlaneEntity.script.oceanMaterial.setReflectionTexture === 'function'
                });
            }
        }
        
        if (oceanMaterial && planarRenderer) {
            console.log('🎯 OceanSystem: Both ocean material and planar renderer found - starting continuous update');
            
            // Set up continuous reflection texture updates in update loop
            var updateReflectionTexture = function() {
                var reflectionTexture = planarRenderer.frameUpdate();
                
                if (reflectionTexture) {
                    console.log('🖼️ OceanSystem: Updating ocean with reflection texture:', {
                        textureSize: reflectionTexture.width + 'x' + reflectionTexture.height,
                        hasSetMethod: typeof oceanMaterial.setReflectionTexture === 'function'
                    });
                    
                    if (oceanMaterial.setReflectionTexture) {
                        oceanMaterial.setReflectionTexture(reflectionTexture);
                    }
                } else {
                    console.warn('📷 OceanSystem: No reflection texture returned from frameUpdate');
                }
            };
            
            // Add to app update loop
            self.app.on('update', updateReflectionTexture);
            
            // Also do an immediate update
            updateReflectionTexture();
            
            console.log('✅ OceanSystem: Connected reflection texture to ocean material');
        } else if (attemptCount < maxAttempts) {
            // Try again next frame
            self.app.once('update', checkConnection);
        } else {
            console.error('❌ OceanSystem: Failed to connect reflection after', maxAttempts, 'attempts');
        }
    };
    
    // Start checking for connection
    this.app.once('update', checkConnection);
};

// Update reflection settings
OceanSystem.prototype.updateReflectionSettings = function() {
    if (this.reflectionCamera && this.reflectionCamera.script && this.reflectionCamera.script.planarRendererEditor) {
        var planarRenderer = this.reflectionCamera.script.planarRendererEditor;
        planarRenderer.scale = this.reflectionScale;
        planarRenderer.layerNames = this.reflectionLayers;
        planarRenderer.planePoint = this.oceanPosition;
        planarRenderer.setupCameraLayers();
    }
};

// Get ocean material for external access
OceanSystem.prototype.getOceanMaterial = function() {
    if (this.oceanPlaneEntity && this.oceanPlaneEntity.script && this.oceanPlaneEntity.script.oceanMaterial) {
        return this.oceanPlaneEntity.script.oceanMaterial;
    }
    return null;
};

// Get reflection camera for external access
OceanSystem.prototype.getReflectionCamera = function() {
    return this.reflectionCamera;
};

// Manual reflection update
OceanSystem.prototype.updateReflection = function() {
    if (this.reflectionCamera && this.reflectionCamera.script && this.reflectionCamera.script.planarRendererEditor) {
        return this.reflectionCamera.script.planarRendererEditor.updateReflection();
    }
    return null;
};

// Handle attribute changes in editor
OceanSystem.prototype.postInitialize = function() {
    var self = this;
    this.on('attr:reflectionScale', function() {
        self.updateReflectionSettings();
    });
    this.on('attr:reflectionLayers', function() {
        self.updateReflectionSettings();
    });
    this.on('attr:oceanPosition', function() {
        self.updateReflectionSettings();
    });
    this.on('attr:mainCamera', function() {
        // Reinitialize when main camera changes
        self.initialize();
    });
};

// Cleanup when script is destroyed
OceanSystem.prototype.destroy = function() {
    // Clean up created entities
    if (this.reflectionCamera && this.reflectionCamera.parent) {
        this.reflectionCamera.destroy();
    }
    
    if (this.createOceanPlane && this.oceanPlaneEntity && this.oceanPlaneEntity.parent) {
        this.oceanPlaneEntity.destroy();
    }
    
    console.log('OceanSystem: Cleaned up resources');
}; 