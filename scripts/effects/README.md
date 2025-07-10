# Wobble Shader Effect for PlayCanvas Editor

This script applies a wobble effect to any entity with a render component using custom shaders.

## Version Compatibility

**Two versions are available:**

### 🆕 wobble-shader.js (Latest PlayCanvas)
- For PlayCanvas Engine v1.80+ (with `pc.ShaderMaterial`)
- Supports both WebGL (GLSL) and WebGPU (WGSL)
- Modern shader API with built-in gamma correction

### 🔄 wobble-shader-v1.77.js (Legacy PlayCanvas)
- **For PlayCanvas Engine v1.77.0 and earlier**
- Uses the classic `pc.Shader` and `pc.Material` API
- WebGL (GLSL) only
- If you're getting `pc.ShaderMaterial is not a constructor` errors, use this version

## How to Use

1. **Choose the Right Version**
   - Check your PlayCanvas Engine version in the Editor settings
   - Use `wobble-shader-v1.77.js` for v1.77.0 and earlier
   - Use `wobble-shader.js` for v1.80 and later

2. **Add the Script to Your Project**
   - Upload the appropriate `.js` file to your PlayCanvas project
   - Or copy and paste the script content into a new script asset

3. **Apply to an Entity**
   - Select any entity that has a **Render Component** (e.g., a 3D model)
   - In the Inspector panel, click **Add Component** → **Script**
   - Add the `wobbleShader` script to the entity

4. **Configure the Effect**
   The script provides two adjustable parameters:
   - **Wobble Strength** (default: 0.1) - Controls how intense the wobble effect is
   - **Wobble Speed** (default: 1.0) - Controls how fast the wobble animation plays

## Features

- **Version Compatible**: Works with both old and new PlayCanvas Engine versions
- **Texture Preservation**: Automatically uses the entity's existing diffuse texture
- **Real-time Editing**: Adjust parameters in the editor and see changes immediately
- **Non-Destructive**: Preserves original materials and can be easily removed
- **Fallback Textures**: Creates white texture if no diffuse map is found

## Technical Details

The wobble effect works by:
- Displacing vertices in the vertex shader using sine and cosine functions
- Using the entity's position and time to create a wave-like motion
- Maintaining the original texturing properties

### Key Differences Between Versions

| Feature | Latest (v1.80+) | Legacy (v1.77.0) |
|---------|----------------|-------------------|
| Shader API | `pc.ShaderMaterial` | `pc.Shader` + `pc.Material` |
| WebGPU Support | ✅ WGSL included | ❌ WebGL only |
| Gamma Correction | ✅ Built-in | ❌ Basic |
| Shader Definition | Inline strings | Array join |
| Precision Handling | Automatic | Manual |

## Requirements

- Entity must have a **Render Component**
- Choose version based on your PlayCanvas Engine version
- Works with any 3D model format supported by PlayCanvas

## Example Use Cases

- Animated flags or banners
- Underwater or heat distortion effects
- Magical or supernatural object animations
- UI element attention-grabbing effects

## Troubleshooting

### Common Errors

**`pc.ShaderMaterial is not a constructor`**
- Solution: Use `wobble-shader-v1.77.js` instead of the latest version
- This means you're using PlayCanvas Engine v1.77.0 or earlier

**No effect visible**
- Make sure the entity has a Render Component
- Check console for any error messages
- Verify the script is properly attached to the entity

**Console warnings**
- Check that the entity has mesh instances with materials
- Ensure the render component is properly configured

**Performance issues**
- Reduce wobble strength value
- Apply to fewer entities
- Consider using simpler geometry for wobbling objects

## Version History

- **v2.0**: Added support for both legacy and modern PlayCanvas APIs
- **v1.0**: Initial release with modern `pc.ShaderMaterial` API 