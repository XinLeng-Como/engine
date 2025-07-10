var PlanarReflectionSystem = pc.createScript('planarReflectionSystem');

// Script attributes for editor configuration
PlanarReflectionSystem.attributes.add('envAtlas', {
    type: 'asset',
    assetType: 'texture',
    title: 'Environment Atlas',
    description: 'Environment texture for skybox'
});

PlanarReflectionSystem.attributes.add('statueModel', {
    type: 'asset',
    assetType: 'model',
    title: 'Statue Model',
    description: 'Main model to display'
});

PlanarReflectionSystem.attributes.add('planarRendererScript', {
    type: 'asset',
    assetType: 'script',
    title: 'Planar Renderer Script',
    description: 'Planar renderer script asset'
});

PlanarReflectionSystem.attributes.add('mainCamera', {
    type: 'entity',
    title: 'Main Camera',
    description: 'Main camera entity'
});

PlanarReflectionSystem.attributes.add('animateObjects', {
    type: 'boolean',
    default: true,
    title: 'Animate Objects',
    description: 'Whether to animate the primitive objects'
});

PlanarReflectionSystem.attributes.add('animateCamera', {
    type: 'boolean',
    default: true,
    title: 'Animate Camera',
    description: 'Whether to animate the camera'
});

PlanarReflectionSystem.attributes.add('groundSize', {
    type: 'number',
    default: 40,
    title: 'Ground Size',
    description: 'Size of the reflective ground plane'
});

PlanarReflectionSystem.attributes.add('objectCount', {
    type: 'number',
    default: 6,
    min: 1,
    max: 20,
    title: 'Object Count',
    description: 'Number of animated objects to create'
});

// Initialize the reflection system
PlanarReflectionSystem.prototype.initialize = function() {
    this.time = 0;
    this.entities = [];
    this.groundMaterial = null;
    this.reflectionCamera = null;
    
    // Wait for assets to load before setting up
    this.setupReflectionSystem();
};

PlanarReflectionSystem.prototype.setupReflectionSystem = function() {
    // Setup environment
    if (this.envAtlas) {
        this.app.scene.envAtlas = this.envAtlas.resource;
        this.app.scene.skyboxMip = 1;
        this.app.scene.skyboxIntensity = 1.7;
    }

    // Get existing layers
    const worldLayer = this.app.scene.layers.getLayerByName('World');
    const skyboxLayer = this.app.scene.layers.getLayerByName('Skybox');
    const uiLayer = this.app.scene.layers.getLayerByName('UI');

    // Create a layer for objects that do not render into texture
    const excludedLayer = new pc.Layer({ name: 'Excluded' });
    if (worldLayer) {
        this.app.scene.layers.insert(excludedLayer, this.app.scene.layers.getTransparentIndex(worldLayer) + 1);
    }

    // Create reflective ground material
    this.createGroundMaterial();
    
    // Create reflective ground plane
    this.createPrimitive(
        'plane',
        new pc.Vec3(0, 0, 0),
        new pc.Vec3(this.groundSize, 1, this.groundSize),
        new pc.Color(0.5, 0.5, 0.5),
        [excludedLayer.id],
        this.groundMaterial
    );

    // Add statue model if provided
    if (this.statueModel && this.statueModel.resource) {
        const statueEntity = this.statueModel.resource.instantiateRenderEntity();
        if (statueEntity) {
            this.app.root.addChild(statueEntity);
        }
    }

    // Create random primitive objects
    this.createAnimatedObjects(worldLayer);

    // Setup reflection camera
    this.setupReflectionCamera(worldLayer, skyboxLayer, excludedLayer);
};

PlanarReflectionSystem.prototype.createGroundMaterial = function() {
    // Create a basic material for the ground that will receive the reflection texture
    this.groundMaterial = new pc.StandardMaterial();
    this.groundMaterial.diffuse = new pc.Color(0.8, 0.8, 0.8);
    this.groundMaterial.gloss = 0.9;
    this.groundMaterial.metalness = 0.1;
    this.groundMaterial.useMetalness = true;
    this.groundMaterial.update();
};

PlanarReflectionSystem.prototype.createPrimitive = function(primitiveType, position, scale, color, layers, material) {
    if (!material) {
        material = new pc.StandardMaterial();
        material.diffuse = color;
        material.gloss = 0.6;
        material.metalness = 0.7;
        material.useMetalness = true;
        material.update();
    }

    const primitive = new pc.Entity();
    primitive.addComponent('render', {
        type: primitiveType,
        layers: layers,
        material: material
    });

    primitive.setLocalPosition(position);
    primitive.setLocalScale(scale);
    this.app.root.addChild(primitive);

    return primitive;
};

PlanarReflectionSystem.prototype.createAnimatedObjects = function(worldLayer) {
    if (!worldLayer) return;
    
    const shapes = ['box', 'cone', 'cylinder', 'sphere', 'capsule'];
    
    for (let i = 0; i < this.objectCount; i++) {
        const shapeName = shapes[Math.floor(Math.random() * shapes.length)];
        const color = new pc.Color(Math.random(), Math.random(), Math.random());
        const entity = this.createPrimitive(
            shapeName, 
            pc.Vec3.ZERO, 
            new pc.Vec3(3, 3, 3), 
            color, 
            [worldLayer.id]
        );
        this.entities.push(entity);
    }
};

PlanarReflectionSystem.prototype.setupReflectionCamera = function(worldLayer, skyboxLayer, excludedLayer) {
    if (!worldLayer || !skyboxLayer) return;

    // Create reflection camera
    this.reflectionCamera = new pc.Entity('ReflectionCamera');
    this.reflectionCamera.addComponent('camera', {
        fov: 60,
        layers: [worldLayer.id, skyboxLayer.id],
        priority: -1,
        toneMapping: pc.TONEMAP_ACES
    });

    // Add planar renderer script if available
    if (this.planarRendererScript) {
        this.reflectionCamera.addComponent('script');
        
        // Wait for script to be loaded
        this.planarRendererScript.ready(() => {
            if (this.reflectionCamera.script) {
                this.reflectionCamera.script.create('planarRenderer', {
                    attributes: {
                        sceneCameraEntity: this.mainCamera || this.app.root.findByName('Camera'),
                        scale: 1,
                        mipmaps: false,
                        depth: true,
                        planePoint: pc.Vec3.ZERO,
                        planeNormal: pc.Vec3.UP
                    }
                });
            }
        });
    }

    this.app.root.addChild(this.reflectionCamera);
};

// Update function called every frame
PlanarReflectionSystem.prototype.update = function(dt) {
    this.time += dt;

    // Animate objects if enabled
    if (this.animateObjects) {
        this.updateAnimatedObjects();
    }

    // Animate camera if enabled and camera exists
    if (this.animateCamera && this.mainCamera) {
        this.updateCamera();
    }

    // Update reflection
    this.updateReflection();
};

PlanarReflectionSystem.prototype.updateAnimatedObjects = function() {
    for (let e = 0; e < this.entities.length; e++) {
        const entity = this.entities[e];
        if (!entity) continue;
        
        const scale = (e + 1) / this.entities.length;
        const offset = this.time + e * 200;
        
        entity.setLocalPosition(
            7 * Math.sin(offset), 
            e + 5, 
            7 * Math.cos(offset)
        );
        entity.rotate(1 * scale, 2 * scale, 3 * scale);
    }
};

PlanarReflectionSystem.prototype.updateCamera = function() {
    if (!this.mainCamera || !this.mainCamera.camera) return;
    
    // Orbit camera around center
    this.mainCamera.setLocalPosition(
        30 * Math.cos(this.time * 0.2), 
        10, 
        30 * Math.sin(this.time * 0.2)
    );
    this.mainCamera.lookAt(pc.Vec3.ZERO);
    
    // Animate FOV
    this.mainCamera.camera.fov = 60 + 20 * Math.sin(this.time * 0.5);
};

PlanarReflectionSystem.prototype.updateReflection = function() {
    if (!this.reflectionCamera || !this.reflectionCamera.script || !this.groundMaterial) return;
    
    const planarRenderer = this.reflectionCamera.script.planarRenderer;
    if (planarRenderer && planarRenderer.frameUpdate) {
        const reflectionTexture = planarRenderer.frameUpdate();
        if (reflectionTexture) {
            this.groundMaterial.diffuseMap = reflectionTexture;
            this.groundMaterial.update();
        }
    }
};

// Cleanup when script is destroyed
PlanarReflectionSystem.prototype.destroy = function() {
    // Clean up created entities
    if (this.entities) {
        this.entities.forEach(entity => {
            if (entity && entity.parent) {
                entity.destroy();
            }
        });
    }
    
    if (this.reflectionCamera && this.reflectionCamera.parent) {
        this.reflectionCamera.destroy();
    }
}; 