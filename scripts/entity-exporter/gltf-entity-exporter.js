var GltfEntityExporter = pc.createScript('gltfEntityExporter');

// Script attributes
GltfEntityExporter.attributes.add('buttonText', {
    type: 'string',
    default: 'Export to GLB',
    title: 'Button Text',
    description: 'Text displayed on the export button'
});

GltfEntityExporter.attributes.add('buttonPosition', {
    type: 'vec2',
    default: [10, 10],
    title: 'Button Position',
    description: 'Button position from top-left corner (x, y)'
});

GltfEntityExporter.attributes.add('buttonSize', {
    type: 'vec2',
    default: [150, 40],
    title: 'Button Size',
    description: 'Button width and height'
});

GltfEntityExporter.attributes.add('maxTextureSize', {
    type: 'number',
    default: 1024,
    title: 'Max Texture Size',
    description: 'Maximum texture size in exported GLB (0 = no limit)'
});

GltfEntityExporter.attributes.add('fileName', {
    type: 'string',
    default: 'exported-entity.glb',
    title: 'File Name',
    description: 'Name of the exported GLB file'
});

GltfEntityExporter.attributes.add('exportChildren', {
    type: 'boolean',
    default: true,
    title: 'Export Children',
    description: 'Include all child entities in export'
});

// Initialize the script
GltfEntityExporter.prototype.initialize = function() {
    this.createExportButton();
    this.isExporting = false;
};

// Create the export button UI
GltfEntityExporter.prototype.createExportButton = function() {
    // Create button element
    this.button = document.createElement('button');
    this.button.textContent = this.buttonText;
    this.button.style.cssText = `
        position: absolute;
        top: ${this.buttonPosition.y}px;
        left: ${this.buttonPosition.x}px;
        width: ${this.buttonSize.x}px;
        height: ${this.buttonSize.y}px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    
    // Add hover effects
    this.button.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#0056b3';
    });
    
    this.button.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#007bff';
    });
    
    // Add click handler
    this.button.addEventListener('click', this.exportEntity.bind(this));
    
    // Add button to the page
    document.body.appendChild(this.button);
};

// Export the entity to GLB
GltfEntityExporter.prototype.exportEntity = function() {
    if (this.isExporting) {
        console.log('Export already in progress...');
        return;
    }
    
    this.isExporting = true;
    this.updateButtonState('Exporting...');
    
    try {
        // Determine what to export
        var entityToExport = this.entity;
        
        // If not exporting children, create a temporary entity with just this entity's components
        if (!this.exportChildren) {
            entityToExport = this.createSingleEntityClone();
        }
        
        // Set up export options
        var options = {};
        if (this.maxTextureSize > 0) {
            options.maxTextureSize = this.maxTextureSize;
        }
        
        // Export to GLB
        var exporter = new pc.GltfExporter();
        exporter.build(entityToExport, options)
            .then(this.handleExportSuccess.bind(this))
            .catch(this.handleExportError.bind(this));
            
    } catch (error) {
        this.handleExportError(error);
    }
};

// Create a clone of just this entity (without children) for export
GltfEntityExporter.prototype.createSingleEntityClone = function() {
    var clone = this.entity.clone();
    
    // Remove all children from the clone
    var children = clone.children.slice(); // Create a copy of the children array
    for (var i = 0; i < children.length; i++) {
        children[i].destroy();
    }
    
    return clone;
};

// Handle successful export
GltfEntityExporter.prototype.handleExportSuccess = function(arrayBuffer) {
    try {
        // Create blob and download link
        var blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
        var url = URL.createObjectURL(blob);
        
        // Create temporary download link
        var downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = this.fileName;
        downloadLink.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up URL
        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('GLB export completed successfully!');
        this.updateButtonState('Export Complete!');
        
        // Reset button after delay
        setTimeout(this.resetButton.bind(this), 2000);
        
    } catch (error) {
        this.handleExportError(error);
    }
};

// Handle export errors
GltfEntityExporter.prototype.handleExportError = function(error) {
    console.error('GLB export failed:', error);
    this.updateButtonState('Export Failed');
    
    // Reset button after delay
    setTimeout(this.resetButton.bind(this), 3000);
};

// Update button appearance and text
GltfEntityExporter.prototype.updateButtonState = function(text) {
    if (this.button) {
        this.button.textContent = text;
        if (text.includes('Failed')) {
            this.button.style.backgroundColor = '#dc3545';
        } else if (text.includes('Complete')) {
            this.button.style.backgroundColor = '#28a745';
        } else {
            this.button.style.backgroundColor = '#6c757d';
        }
    }
};

// Reset button to original state
GltfEntityExporter.prototype.resetButton = function() {
    this.isExporting = false;
    if (this.button) {
        this.button.textContent = this.buttonText;
        this.button.style.backgroundColor = '#007bff';
    }
};

// Clean up when script is destroyed
GltfEntityExporter.prototype.destroy = function() {
    if (this.button && this.button.parentNode) {
        this.button.parentNode.removeChild(this.button);
    }
};

// Handle attribute changes in the editor
GltfEntityExporter.prototype.onAttributeChanged = function(name, oldValue, newValue) {
    if (name === 'buttonText' && this.button) {
        this.button.textContent = newValue;
    } else if (name === 'buttonPosition' && this.button) {
        this.button.style.top = newValue.y + 'px';
        this.button.style.left = newValue.x + 'px';
    } else if (name === 'buttonSize' && this.button) {
        this.button.style.width = newValue.x + 'px';
        this.button.style.height = newValue.y + 'px';
    }
}; 