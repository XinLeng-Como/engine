# GLTF Entity Exporter Script for PlayCanvas Editor

This script allows you to export any entity and its children to a GLB file at runtime in PlayCanvas Editor 1.77+.

## Installation

1. Copy the `gltf-entity-exporter.js` file to your PlayCanvas project's Scripts folder
2. The script will automatically appear in the Scripts panel

## Usage

### Adding the Script to an Entity

1. Select the entity you want to make exportable in the Hierarchy
2. In the Inspector panel, click "Add Component" → "Script"
3. Click "Add Script" and select `gltfEntityExporter` from the dropdown
4. Configure the script attributes as needed

### Script Attributes

The script provides several configurable attributes:

- **Button Text** (string): Text displayed on the export button
  - Default: "Export to GLB"

- **Button Position** (vec2): Position of the button from the top-left corner
  - Default: [10, 10] (10px from top, 10px from left)

- **Button Size** (vec2): Width and height of the button in pixels
  - Default: [150, 40]

- **Max Texture Size** (number): Maximum texture resolution in the exported GLB
  - Default: 1024 (set to 0 for no limit)
  - Higher values = better quality but larger file size

- **File Name** (string): Name of the downloaded GLB file
  - Default: "exported-entity.glb"

- **Export Children** (boolean): Whether to include child entities in the export
  - Default: true
  - When false, only the entity with the script will be exported

### How It Works

1. When you launch your project, a blue export button will appear at the configured position
2. Clicking the button will:
   - Export the entity (and children if enabled) to GLB format
   - Automatically download the file to your browser's download folder
   - Show progress feedback on the button

### Button States

The button provides visual feedback:
- **Blue**: Ready to export
- **Gray**: Export in progress
- **Green**: Export completed successfully
- **Red**: Export failed

### Example Use Cases

1. **Export a single 3D model**: Attach to a model entity with `Export Children` disabled
2. **Export a complete scene section**: Attach to a parent entity with `Export Children` enabled
3. **Export with optimized textures**: Set `Max Texture Size` to 512 or 1024 for smaller files

### Technical Notes

- The script uses PlayCanvas's built-in `GltfExporter` class
- Exported GLB files are compatible with standard 3D software and web viewers
- The script automatically handles cleanup of temporary resources
- Multiple export buttons can be used simultaneously on different entities

### Troubleshooting

- **Export fails**: Check the browser console for error details
- **Button not visible**: Verify the button position is within the viewport
- **Large file sizes**: Reduce the `Max Texture Size` setting
- **Missing geometry**: Ensure the entity has render components or child entities with render components

### Compatibility

- PlayCanvas Editor 1.77+
- Modern browsers with support for Blob and download APIs
- Works in both development and published projects 