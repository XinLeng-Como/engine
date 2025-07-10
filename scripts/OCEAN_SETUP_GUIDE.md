# Ocean Reflection System Setup Guide
## PlayCanvas Editor v1.77 Compatible

This guide will help you set up a complete ocean reflection system in PlayCanvas Editor using engine version 1.77.

## 📋 What You Get

- **Realistic Ocean Surface**: Animated waves with vertex displacement
- **Real-time Reflections**: Planar reflections of your scene
- **Customizable Parameters**: Wave speed, height, color, and reflection strength
- **Editor Integration**: Easy setup through the PlayCanvas Editor interface

## 🚀 Quick Setup (Recommended)

### Step 1: Upload Scripts

1. In your PlayCanvas Editor project, go to **Assets**
2. Click **Upload** and select these three script files:
   - `ocean-material.js`
   - `planar-renderer-editor.js` 
   - `ocean-system.js`

### Step 2: Add Ocean System

1. Create a new Entity (or select an existing one)
2. Add **Script Component**
3. Click **Add Script** → Select `oceanSystem`
4. The system will automatically create everything you need!

### Step 3: Configure (Optional)

In the Ocean System script component, you can adjust:
- **Ocean Size**: Size of the ocean plane (default: 100)
- **Ocean Position**: Position of the ocean surface (default: 0,0,0)
- **Reflection Scale**: Reflection quality vs performance (default: 0.5)
- **Reflection Layers**: Which layers to reflect (default: "World,Skybox")

## 🛠️ Manual Setup (Advanced)

If you want more control, you can set up components manually:

### Step 1: Create Ocean Plane

1. Create a new Entity named "Ocean"
2. Add **Render Component**
   - Type: Plane
   - Move to position Y=0 (or your desired water level)
   - Scale to desired size (e.g., 100, 1, 100)
3. Add **Script Component**
4. Add script: `oceanMaterial`

### Step 2: Create Reflection Camera

1. Create a new Entity named "ReflectionCamera"
2. Add **Camera Component**
   - Set Priority to -1 (renders before main camera)
   - Set Layers to: World, Skybox (or your desired layers)
3. Add **Script Component**
4. Add script: `planarRendererEditor`
5. Set **Scene Camera** to your main camera entity

### Step 3: Connect System

1. Create another Entity for coordination
2. Add **Script Component** 
3. Add script: `oceanSystem`
4. Set **Ocean Plane** to your ocean entity
5. Set **Main Camera** to your main camera
6. Disable **Auto-Create Ocean Plane**

## ⚙️ Configuration Options

### Ocean Material Settings

| Parameter | Description | Default | Range |
|-----------|-------------|---------|-------|
| Wave Speed | Animation speed | 1.0 | 0.0 - 5.0 |
| Wave Scale | Distortion strength | 0.05 | 0.0 - 0.2 |
| Vertex Wave Height | Physical wave height | 0.1 | 0.0 - 2.0 |
| Ocean Color | Base water color | Blue-green | RGB |
| Reflection Strength | Reflection visibility | 0.4 | 0.0 - 1.0 |

### Planar Renderer Settings

| Parameter | Description | Default | Range |
|-----------|-------------|---------|-------|
| Resolution Scale | Reflection texture quality | 0.5 | 0.1 - 2.0 |
| Reflection Layers | What to reflect | "World,Skybox" | Layer names |
| Plane Point | Ocean surface position | 0,0,0 | Vec3 |
| Auto Update | Update every frame | true | Boolean |

### Ocean System Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| Ocean Size | Auto-created plane size | 100 |
| Ocean Position | Water surface position | 0,0,0 |
| Main Camera | Scene camera entity | Auto-find "Camera" |
| Exclude Ocean from Reflection | Prevent self-reflection | true |

## 🎨 Customization Tips

### Improving Visual Quality

1. **Higher Resolution Reflections**:
   - Increase Reflection Scale (0.7-1.0)
   - Note: Higher values impact performance

2. **More Realistic Waves**:
   - Adjust Wave Speed (0.5-2.0)
   - Increase Vertex Wave Height (0.2-0.5)
   - Fine-tune Wave Scale (0.02-0.1)

3. **Better Ocean Color**:
   - Use realistic water colors: `rgb(0, 0.15, 0.3)`
   - Adjust Reflection Strength based on lighting

### Performance Optimization

1. **Lower Resolution**:
   - Reduce Reflection Scale (0.25-0.4)
   - Disable mipmaps if not needed

2. **Selective Reflection**:
   - Only include essential layers
   - Exclude UI and effects layers

3. **Conditional Rendering**:
   - Disable ocean on mobile devices
   - Use distance-based LOD

## 🐛 Troubleshooting

### No Reflections Visible

**Check:**
- Planar Renderer script is attached to reflection camera
- Scene Camera is set correctly
- Ocean plane is in "Excluded" layer
- Main camera layers include the ocean

### Console Errors

**Common Issues:**
- `pc.ShaderMaterial is not a constructor` → Scripts are v1.77 compatible, check engine version
- `Layer not found` → Verify layer names in Reflection Layers setting
- Missing camera → Set Main Camera entity manually

### Performance Issues

**Solutions:**
- Reduce Reflection Scale
- Limit reflection layers
- Decrease ocean plane subdivisions
- Use simpler shaders on reflected objects

### Wave Animation Not Working

**Check:**
- Ocean Material script is attached to ocean plane
- Time parameter is updating (check console)
- Vertex Wave Height > 0

## 📱 Platform Support

### Engine Compatibility
- ✅ PlayCanvas Engine v1.77.0
- ✅ PlayCanvas Engine v1.76.x (legacy)
- ❌ Earlier versions (missing shader APIs)

### Rendering Support
- ✅ WebGL 1.0 & 2.0
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ❌ WebGPU (not supported in v1.77)

### Performance Notes
- **Desktop**: Full quality recommended
- **Mobile**: Use Reflection Scale 0.25-0.4
- **Low-end devices**: Consider disabling reflections

## 🔧 Advanced Modifications

### Custom Shader Effects

To modify the ocean shader:

1. Edit `ocean-material.js`
2. Modify `getFragmentShaderGLSL()` function
3. Add custom uniforms in `updateShaderParameters()`

### Multiple Ocean Planes

For multiple water bodies:

1. Create separate ocean entities
2. Add Ocean Material script to each
3. Use one Ocean System with manual setup
4. Set different plane positions in Planar Renderer

### Environment Integration

For realistic scenes:

1. Add skybox for reflections
2. Use environment lighting
3. Match ocean color to scene mood
4. Consider fog and atmospheric effects

## 📚 Script Reference

### Ocean Material API
```javascript
// Access ocean material
var oceanMat = entity.script.oceanMaterial;

// Set reflection texture manually
oceanMat.setReflectionTexture(texture);

// Update parameters
oceanMat.waveSpeed = 2.0;
oceanMat.updateShaderParameters();
```

### Planar Renderer API
```javascript
// Access planar renderer
var renderer = entity.script.planarRendererEditor;

// Manual update
var reflectionTexture = renderer.updateReflection();

// Get texture
var texture = renderer.getReflectionTexture();
```

### Ocean System API
```javascript
// Access ocean system
var system = entity.script.oceanSystem;

// Get components
var oceanMaterial = system.getOceanMaterial();
var reflectionCamera = system.getReflectionCamera();

// Manual update
system.updateReflection();
```

## 📄 License

These scripts are based on PlayCanvas Engine examples and are provided under the same MIT license terms.

---

**Need Help?** Check the PlayCanvas community forums or engine documentation for additional support.

**Last Updated:** January 2025  
**Engine Version:** PlayCanvas v1.77.0  
**Script Compatibility:** Legacy API compatible 