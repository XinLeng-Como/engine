<div align="center">

<img width="200" src="https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/platform/images/logo/playcanvas-logo-medium.png"/>

# PlayCanvas WebGL Game Engine

[API Reference](https://api.playcanvas.com/engine/) | [User Manual](https://developer.playcanvas.com) | [Examples](https://playcanvas.github.io) | [Forum](https://forum.playcanvas.com) | [Blog](https://blog.playcanvas.com)

PlayCanvas is an open-source game engine. It uses HTML5 and WebGL to run games and other interactive 3D content in any mobile or desktop browser.

[![NPM version][npm-badge]][npm-url]
[![Minzipped size][minzip-badge]][minzip-url]
[![Average time to resolve an issue][resolution-badge]][isitmaintained-url]
[![Percentage of issues still open][open-issues-badge]][isitmaintained-url]
[![Twitter][twitter-badge]][twitter-url]

[English](https://github.com/playcanvas/engine/blob/dev/README.md)
[中文](https://github.com/playcanvas/engine/blob/dev/README-zh.md)
[日本語](https://github.com/playcanvas/engine/blob/dev/README-ja.md)
[한글](https://github.com/playcanvas/engine/blob/dev/README-kr.md)

## Project Showcase

[Many games and apps](https://github.com/playcanvas/awesome-playcanvas) have been published using the PlayCanvas engine. Here is a small selection:

[![Seemore](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/14705/319531/O4J4VU-image-25.jpg)](https://playcanv.as/p/MflWvdTW/) [![After The Flood](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/14928/440410/98554E-image-25.jpg)](https://playcanv.as/p/44MRmJRU/) [![Casino](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/14928/349824/U88HJQ-image-25.jpg)](https://playcanv.as/p/LpmXGUe6/)  
[![Swooop](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/12/4763/TKYXB8-image-25.jpg)](https://playcanv.as/p/JtL2iqIH/) [![dev Archer](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/12/415995/10A5A9-image-25.jpg)](https://playcanv.as/p/JERg21J8/) [![Flappy Bird](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/8/375389/23PRTL-image-25.jpg)](https://playcanv.as/p/2OlkUaxF/)  
[![Car](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/12/347824/7ULQ3Y-image-25.jpg)](https://playcanv.as/p/RqJJ9oU9/) [![Star-Lord](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/12/333626/BGQN9H-image-25.jpg)](https://playcanv.as/p/SA7hVBLt/) [![Global Illumination](https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/4373/625081/6AB32D-image-25.jpg)](https://playcanv.as/p/ZV4PW6wr/ )

You can see more games on the [PlayCanvas website](https://playcanvas.com/explore).

</div>

## Users

PlayCanvas is used by leading companies in video games, advertising and visualization such as:  
**Animech, Arm, BMW, Disney, Facebook, Famobi, Funday Factory, IGT, King, Miniclip, Leapfrog, Mojiworks, Mozilla, Nickelodeon, Nordeus, NOWWA, PikPok, PlaySide Studios, Polaris, Product Madness, Samsung, Snap, Spry Fox, Zeptolab, Zynga**

## Features

PlayCanvas is a fully-featured game engine.

* 🧊 **Graphics** - Advanced 2D + 3D graphics engine built on WebGL2 & WebGPU.
* 🏃 **Animation** - Powerful state-based animations for characters and arbitrary scene properties
* ⚛️ **Physics** - Full integration with 3D rigid-body physics engine [ammo.js](https://github.com/kripken/ammo.js)
* 🎮 **Input** - Mouse, keyboard, touch, gamepad and VR controller APIs
* 🔊 **Sound** - 3D positional sounds built on the Web Audio API
* 📦 **Assets** - Asynchronous streaming system built on [glTF 2.0](https://www.khronos.org/gltf/), [Draco](https://google.github.io/draco/) and [Basis](https://github.com/BinomialLLC/basis_universal) compression
* 📜 **Scripts** - Write game behaviors in Typescript or JavaScript

## Usage

Here's a super-simple Hello World example - a spinning cube!

```js
import * as pc from 'playcanvas';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const app = new pc.Application(canvas);

// fill the available space at full resolution
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

// ensure canvas is resized when window changes size
window.addEventListener('resize', () => app.resizeCanvas());

// create box entity
const box = new pc.Entity('cube');
box.addComponent('model', {
  type: 'box'
});
app.root.addChild(box);

// create camera entity
const camera = new pc.Entity('camera');
camera.addComponent('camera', {
  clearColor: new pc.Color(0.1, 0.2, 0.3)
});
app.root.addChild(camera);
camera.setPosition(0, 0, 3);

// create directional light entity
const light = new pc.Entity('light');
light.addComponent('light');
app.root.addChild(light);
light.setEulerAngles(45, 0, 0);

// rotate the box according to the delta time since the last frame
app.on('update', dt => box.rotate(10 * dt, 20 * dt, 30 * dt));

app.start();
```

Want to play with the code yourself? Edit it on [CodePen](https://codepen.io/playcanvas/pen/NPbxMj).

A full guide to setting up a local development environment based on the PlayCanvas Engine can be found [here](https://developer.playcanvas.com/user-manual/engine/standalone/).

## How to build

Ensure you have [Node.js 18+](https://nodejs.org) installed. Then, install all of the required Node.js dependencies:

```sh
npm install
```

Now you can run various build options:

| Command         | Description                                    | Outputs To |
| --------------- | ---------------------------------------------- | ---------- |
| `npm run build` | Build all engine flavors and type declarations | `build`    |
| `npm run docs`  | Build engine [API reference docs][docs]        | `docs`     |

## PlayCanvas Editor

The PlayCanvas Engine is an open-source engine that you can use to create HTML5 apps/games. In addition to the engine, we also make the [PlayCanvas Editor](https://playcanvas.com/):

[![Editor](https://github.com/playcanvas/editor/blob/main/images/editor.png?raw=true)](https://github.com/playcanvas/editor)

For Editor-related bugs and issues, please refer to the [Editor's repo](https://github.com/playcanvas/editor).

[npm-badge]: https://img.shields.io/npm/v/playcanvas
[npm-url]: https://www.npmjs.com/package/playcanvas
[minzip-badge]: https://img.shields.io/bundlephobia/minzip/playcanvas
[minzip-url]: https://bundlephobia.com/result?p=playcanvas
[resolution-badge]: https://isitmaintained.com/badge/resolution/playcanvas/engine.svg
[open-issues-badge]: https://isitmaintained.com/badge/open/playcanvas/engine.svg
[isitmaintained-url]: https://isitmaintained.com/project/playcanvas/engine
[twitter-badge]: https://img.shields.io/twitter/follow/playcanvas.svg?style=social&label=Follow
[twitter-url]: https://twitter.com/intent/follow?screen_name=playcanvas
[docs]: https://api.playcanvas.com/modules/Engine.html

# Planar Reflection System for PlayCanvas Editor

This script creates a planar reflection system that can be used in the PlayCanvas Editor. It's adapted from the reflection-planar engine example and provides a reflective ground plane with animated objects.

## Files Included

- `planar-reflection-system.js` - Main script that creates the reflection system
- `planar-renderer.js` - Utility script for planar reflection rendering
- `README.md` - This documentation file

## Features

- ✨ Reflective ground plane with real-time reflections
- 🎯 Configurable animated primitive objects
- 📷 Optional camera animation
- 🎨 Customizable environment and materials
- 🔧 Easy-to-use editor interface

## Installation

1. **Upload Both Scripts**
   - Download both `planar-reflection-system.js` and `planar-renderer.js`
   - In your PlayCanvas Editor project, go to **Assets**
   - Click **Upload** and select both script files
   - Both scripts will appear in your assets panel

2. **Add Required Assets**
   You'll need these assets in your project:
   
   - **Environment Texture**: A cubemap or environment atlas for the skybox
   - **Model Asset** (optional): A 3D model to display (like the statue in the original example)
   - **Both Script Files**: Both `planar-reflection-system.js` and `planar-renderer.js` are required

## Setup Instructions

### Step 1: Add the Script to an Entity

1. Create a new Entity or select an existing one (this will be your reflection system controller)
2. In the **Inspector**, click **Add Component** → **Script**
3. Click **Add Script** and select `planarReflectionSystem`

### Step 2: Configure Script Attributes

In the script component, you'll see these configurable properties:

#### Required Assets
- **Environment Atlas**: Drag your environment texture asset here
- **Planar Renderer Script**: Drag the `planar-renderer.js` script asset here

#### Optional Assets
- **Statue Model**: Drag a 3D model asset if you want a central object
- **Main Camera**: Drag your main camera entity (if not set, it will find "Camera" automatically)

#### Animation Settings
- **Animate Objects**: Enable/disable object animation (default: true)
- **Animate Camera**: Enable/disable camera animation (default: true)
- **Ground Size**: Size of the reflective ground plane (default: 40)
- **Object Count**: Number of animated primitive objects (default: 6, range: 1-20)

### Step 3: Setup Your Scene

1. **Camera Setup**:
   - Make sure you have a camera in your scene
   - If using camera animation, the script will control its position
   - If not using camera animation, position your camera manually

2. **Lighting**:
   - Add some lights to your scene for better reflection visibility
   - The script will set up the skybox automatically if you provide an environment atlas

3. **Ground Positioning**:
   - The reflective ground plane is created at (0, 0, 0)
   - Position other objects in your scene accordingly

## How It Works

The script creates several components:

1. **Reflective Ground Plane**: A plane that receives reflection textures
2. **Reflection Camera**: A secondary camera that renders the reflection
3. **Animated Objects**: Random primitive shapes that move in orbit patterns
4. **Layer Management**: Creates an "Excluded" layer for objects that shouldn't appear in reflections

## Customization

### Modifying Materials
You can customize the ground material by modifying the `createGroundMaterial()` function:

```javascript
PlanarReflectionSystem.prototype.createGroundMaterial = function() {
    this.groundMaterial = new pc.StandardMaterial();
    this.groundMaterial.diffuse = new pc.Color(0.8, 0.8, 0.8); // Change ground color
    this.groundMaterial.gloss = 0.9;     // Adjust glossiness
    this.groundMaterial.metalness = 0.1; // Adjust metalness
    this.groundMaterial.useMetalness = true;
    this.groundMaterial.update();
};
```

### Adding Custom Objects
To add your own objects instead of random primitives, modify the `createAnimatedObjects()` function or disable object animation and add objects manually to your scene.

### Custom Animation Patterns
Modify the `updateAnimatedObjects()` and `updateCamera()` functions to change animation patterns.

## Troubleshooting

### Common Issues

1. **No Reflections Visible**
   - Ensure the Planar Renderer Script asset is properly assigned
   - Check that your environment atlas is loaded
   - Verify the camera is positioned above the ground plane

2. **Script Errors**
   - Make sure all required assets are assigned
   - Check the browser console for specific error messages
   - Ensure the planar-renderer script is compatible

3. **Performance Issues**
   - Reduce the object count
   - Disable camera or object animation if not needed
   - Consider reducing the ground size

### Layer Configuration
If you need to customize which objects appear in reflections:
- Objects in the "World" layer will appear in reflections
- Objects in the "Excluded" layer will not appear in reflections
- The reflective ground itself is in the "Excluded" layer

## Dependencies

- PlayCanvas Engine (latest version recommended)
- `planar-renderer.js` script (from PlayCanvas engine examples)

## Notes

- The script automatically cleans up created entities when destroyed
- Camera animation moves in a circular orbit pattern
- Object animation creates orbital motion with rotation
- The reflection texture is updated every frame for real-time reflections

## License

This script is adapted from PlayCanvas engine examples and follows the same licensing terms.
