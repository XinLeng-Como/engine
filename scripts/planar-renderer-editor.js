// Editor-friendly planar renderer for ocean reflections - PlayCanvas v1.77 Compatible
// How to use:
// - create a reflection entity with a camera component, set up its layers to what you want to reflect.
// - add the planarRendererEditor script to it, set the sceneCameraEntity to the main camera of the scene.
// - call frameUpdate on the script to update the reflection texture. This needs to be called
//   after the main camera properties including the transform has been set already.
// Note: Objects that use the reflected texture cannot be in the layers the reflection camera renders.

var PlanarRendererEditor = pc.createScript('planarRendererEditor');

PlanarRendererEditor.attributes.add('sceneCameraEntity', {
    type: 'entity',
    title: 'Scene Camera',
    description: 'The entity containing the main camera of the scene. If not set, will auto-find camera named "Camera".'
});

PlanarRendererEditor.attributes.add('scale', {
    title: 'Resolution Scale',
    description: 'Scale of the reflection texture compared to the render buffer of the main camera.',
    type: 'number',
    default: 0.5,
    min: 0.1,
    max: 2.0
});

PlanarRendererEditor.attributes.add('maxResolution', {
    type: 'number',
    default: 512,
    min: 128,
    max: 2048,
    title: 'Max Resolution',
    description: 'Maximum resolution for reflection texture. Presets: 256=Low, 512=Medium, 1024=High, 2048=Ultra'
});

PlanarRendererEditor.attributes.add('mipmaps', {
    title: 'Mipmaps',
    description: 'Whether to generate mipmaps for the reflection texture.',
    type: 'boolean',
    default: false
});

PlanarRendererEditor.attributes.add('depth', {
    title: 'Depth Buffer',
    description: 'Whether the reflection render target should have a depth buffer.',
    type: 'boolean',
    default: true
});

PlanarRendererEditor.attributes.add('planePoint', {
    type: 'vec3',
    default: [0, 0, 0],
    title: 'Plane Point',
    description: 'Point on the reflection plane (usually Y=0 for ocean surface).'
});

PlanarRendererEditor.attributes.add('planeNormal', {
    type: 'vec3',
    default: [0, 1, 0],
    title: 'Plane Normal',
    description: 'Normal of the reflection plane (Y-up for horizontal ocean).'
});

PlanarRendererEditor.attributes.add('autoUpdate', {
    type: 'boolean',
    default: true,
    title: 'Auto Update',
    description: 'Automatically update the reflection every frame.'
});

PlanarRendererEditor.attributes.add('layerNames', {
    type: 'string',
    default: 'World,Skybox',
    title: 'Reflection Layers',
    description: 'Comma-separated list of layer names to include in reflections (e.g., "World,Skybox").'
});

// initialize code called once per entity
PlanarRendererEditor.prototype.initialize = function () {
    console.log('📷 PlanarRendererEditor: Initializing on entity:', this.entity.name);
    this.plane = new pc.Plane();
    this.reflectionMatrix = new pc.Mat4();
    this.texture = null;
    this.isValid = false;

    // Auto-find scene camera if not set
    if (!this.sceneCameraEntity) {
        console.log('📷 PlanarRendererEditor: No scene camera set, searching for "Camera"...');
        this.sceneCameraEntity = this.app.root.findByName('Camera');
        if (!this.sceneCameraEntity) {
            console.error('❌ PlanarRendererEditor: No scene camera entity set and could not find entity named "Camera".');
            return;
        }
        console.log('✅ PlanarRendererEditor: Found scene camera:', this.sceneCameraEntity.name);
    } else {
        console.log('✅ PlanarRendererEditor: Using provided scene camera:', this.sceneCameraEntity.name);
    }

    // sceneCameraEntity needs to be set
    var sceneCamera = this.sceneCameraEntity.camera;
    if (!sceneCamera) {
        console.error('❌ PlanarRendererEditor: Scene camera entity does not have a camera component.');
        return;
    }

    // this entity needs to have camera component as well
    var planarCamera = this.entity.camera;
    if (!planarCamera) {
        console.error('❌ PlanarRendererEditor: This entity requires a camera component.');
        return;
    }

    console.log('📷 PlanarRendererEditor: Camera setup details:', {
        sceneCameraFov: sceneCamera.fov,
        planarCameraFov: planarCamera.fov,
        layerNames: this.layerNames,
        autoUpdate: this.autoUpdate,
        scale: this.scale
    });

    // Setup camera layers from layer names
    this.setupCameraLayers();

    // Set camera priority to render before main camera
    planarCamera.priority = -1;
    console.log('📷 PlanarRendererEditor: Set reflection camera priority to -1');

    // When the camera is finished rendering, trigger onPlanarPostRender event on the entity.
    // This can be listened to by the user, and the resulting texture can be further processed (e.g prefiltered)
    var self = this;
    this.evtPostRender = this.app.scene.on('postrender', function(cameraComponent) {
        if (planarCamera === cameraComponent) {
            console.log('📷 PlanarRendererEditor: Reflection camera finished rendering, firing event');
            self.entity.fire('onPlanarPostRender', self.texture);
        }
    });

    // when the script is destroyed, remove event listeners
    this.on('destroy', function() {
        if (self.evtPostRender) {
            self.evtPostRender.off();
        }
        self.cleanup();
    });

    this.isValid = true;
    console.log('✅ PlanarRendererEditor: Initialized successfully');
};

PlanarRendererEditor.prototype.setupCameraLayers = function() {
    console.log('🎭 PlanarRendererEditor: Setting up camera layers...');
    if (!this.layerNames) {
        console.warn('⚠️ PlanarRendererEditor: No layer names specified');
        return;
    }
    
    var planarCamera = this.entity.camera;
    if (!planarCamera) {
        console.error('❌ PlanarRendererEditor: No camera component found');
        return;
    }

    var layerIds = [];
    var layerNameArray = this.layerNames.split(',');
    console.log('🎭 PlanarRendererEditor: Processing layers:', layerNameArray);
    
    for (var i = 0; i < layerNameArray.length; i++) {
        var layerName = layerNameArray[i].trim();
        var layer = this.app.scene.layers.getLayerByName(layerName);
        if (layer) {
            layerIds.push(layer.id);
            console.log('✅ Found layer "' + layerName + '" with ID:', layer.id);
        } else {
            console.warn('⚠️ PlanarRendererEditor: Layer "' + layerName + '" not found.');
        }
    }
    
    if (layerIds.length > 0) {
        planarCamera.layers = layerIds;
        console.log('✅ PlanarRendererEditor: Set camera layers to:', layerIds);
    } else {
        console.error('❌ PlanarRendererEditor: No valid layers found');
    }
};

PlanarRendererEditor.prototype.updateRenderTarget = function () {
    if (!this.isValid) return;

    // main camera resolution
    var sceneCamera = this.sceneCameraEntity.camera;
    var sceneCameraWidth = sceneCamera.renderTarget?.width ?? this.app.graphicsDevice.width;
    var sceneCameraHeight = sceneCamera.renderTarget?.height ?? this.app.graphicsDevice.height;

    // reflection texture resolution
    var width = Math.floor(sceneCameraWidth * this.scale);
    var height = Math.floor(sceneCameraHeight * this.scale);

    // apply performance limits - cap resolution for better performance
    width = Math.min(width, this.maxResolution);
    height = Math.min(height, this.maxResolution);

    // limit maximum texture size by hardware
    width = Math.min(width, this.app.graphicsDevice.maxTextureSize);
    height = Math.min(height, this.app.graphicsDevice.maxTextureSize);

    var planarCamera = this.entity.camera;
    if (!planarCamera.renderTarget || planarCamera.renderTarget.width !== width || planarCamera.renderTarget.height !== height) {

        // destroy old render target
        if (planarCamera.renderTarget) {
            this.cleanup();
        }

        // Create texture render target with specified resolution and mipmap generation
        this.texture = new pc.Texture(this.app.graphicsDevice, {
            name: `${this.entity.name}:PlanarRenderer-`,
            width: width,
            height: height,
            format: pc.PIXELFORMAT_SRGBA8,
            mipmaps: this.mipmaps,
            addressU: pc.ADDRESS_CLAMP_TO_EDGE,
            addressV: pc.ADDRESS_CLAMP_TO_EDGE,
            minFilter: this.mipmaps ? pc.FILTER_LINEAR_MIPMAP_LINEAR : pc.FILTER_LINEAR,
            magFilter: pc.FILTER_LINEAR
        });

        // render target
        var renderTarget = new pc.RenderTarget({
            colorBuffer: this.texture,
            depth: this.depth
        });

        planarCamera.renderTarget = renderTarget;
        
        console.log('📷 PlanarRendererEditor: Created reflection texture:', {
            resolution: width + 'x' + height,
            scale: this.scale,
            maxResolution: this.maxResolution,
            originalSize: sceneCameraWidth + 'x' + sceneCameraHeight,
            mipmaps: this.mipmaps
        });
    }
};

PlanarRendererEditor.prototype.frameUpdate = function () {
    if (!this.isValid) {
        console.warn('📷 PlanarRendererEditor: frameUpdate called but not valid');
        return null;
    }

    this.updateRenderTarget();

    var planarCamera = this.entity.camera;
    if (planarCamera.enabled && this.sceneCameraEntity) {
        console.log('📷 PlanarRendererEditor: Updating reflection camera position...');

        // update reflection camera orientation by mirroring the scene camera by the plane
        this.plane.setFromPointNormal(this.planePoint, this.planeNormal);
        this.reflectionMatrix.setReflection(this.plane.normal, this.plane.distance);

        var pos = this.sceneCameraEntity.getPosition();
        var reflectedPos = this.reflectionMatrix.transformPoint(pos);

        var target = pos.clone().add(this.sceneCameraEntity.forward);
        var reflectedTarget = this.reflectionMatrix.transformPoint(target);

        this.entity.setPosition(reflectedPos);
        this.entity.lookAt(reflectedTarget);

        console.log('📷 Reflection camera details:', {
            sceneCameraPos: pos.toString(),
            reflectedPos: reflectedPos.toString(),
            textureSize: this.texture ? this.texture.width + 'x' + this.texture.height : 'no texture',
            renderTarget: !!planarCamera.renderTarget,
            cameraEnabled: planarCamera.enabled
        });

        // copy other properties from the scene camera
        var sceneCamera = this.sceneCameraEntity.camera;
        planarCamera.fov = sceneCamera.fov;
        planarCamera.orthoHeight = sceneCamera.orthoHeight;
        planarCamera.nearClip = sceneCamera.nearClip;
        planarCamera.farClip = sceneCamera.farClip;
        planarCamera.aperture = sceneCamera.aperture;
        planarCamera.sensitivity = sceneCamera.sensitivity;
        planarCamera.shutter = sceneCamera.shutter;

        return this.texture;
    } else {
        console.warn('📷 PlanarRendererEditor: Camera disabled or no scene camera:', {
            cameraEnabled: planarCamera ? planarCamera.enabled : 'no camera',
            hasSceneCamera: !!this.sceneCameraEntity
        });
    }

    return null;
};

// Update function for auto-update
PlanarRendererEditor.prototype.update = function() {
    if (this.autoUpdate) {
        this.frameUpdate();
    }
};

// Get the reflection texture (for manual access)
PlanarRendererEditor.prototype.getReflectionTexture = function() {
    return this.texture;
};

// Manual update method
PlanarRendererEditor.prototype.updateReflection = function() {
    return this.frameUpdate();
};

// Cleanup resources
PlanarRendererEditor.prototype.cleanup = function() {
    if (this.texture) {
        this.texture.destroy();
        this.texture = null;
    }
    
    var planarCamera = this.entity.camera;
    if (planarCamera && planarCamera.renderTarget) {
        planarCamera.renderTarget.destroy();
        planarCamera.renderTarget = null;
    }
};

// Handle attribute changes
PlanarRendererEditor.prototype.postInitialize = function() {
    var self = this;
    this.on('attr:layerNames', function() {
        self.setupCameraLayers();
    });
    this.on('attr:sceneCameraEntity', function() {
        // Reinitialize when scene camera changes
        self.initialize();
    });
    this.on('attr:scale', function() {
        // Force render target update when scale changes
        self.updateRenderTarget();
    });
    this.on('attr:maxResolution', function() {
        // Force render target update when max resolution changes
        self.updateRenderTarget();
    });
}; 