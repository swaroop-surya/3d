import * as THREE from 'three';

// Procedural texture generators to guarantee ZERO external 404 dependencies
export const proceduralTextures = {
  // Wood grain texture for cottage, pier, benches, and frames
  createWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base warm wood
    ctx.fillStyle = '#9b7653';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle grain lines
    for (let i = 0; i < 500; i++) {
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(80, 50, 30, 0.15)' : 'rgba(180, 140, 100, 0.12)';
      ctx.fillRect(0, y, 512, Math.random() * 3 + 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  // Stone path cobblestone texture
  createCobblestoneTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#8f889c';
    ctx.fillRect(0, 0, 512, 512);

    // Draw stylized cobblestone stones
    ctx.strokeStyle = 'rgba(70, 60, 80, 0.4)';
    ctx.lineWidth = 4;
    for (let y = 0; y < 512; y += 48) {
      for (let x = 0; x < 512; x += 48) {
        const ox = (Math.random() - 0.5) * 8;
        const oy = (Math.random() - 0.5) * 8;
        ctx.fillStyle = Math.random() > 0.5 ? '#9f98ac' : '#857e92';
        ctx.beginPath();
        ctx.roundRect(x + 4 + ox, y + 4 + oy, 40, 40, 8);
        ctx.fill();
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  // Blossom petal particle texture
  createPetalTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#F2C2D6';
    ctx.beginPath();
    // Heart/oval petal shape
    ctx.moveTo(32, 10);
    ctx.bezierCurveTo(46, 12, 52, 28, 46, 44);
    ctx.bezierCurveTo(40, 54, 32, 58, 32, 58);
    ctx.bezierCurveTo(32, 58, 24, 54, 18, 44);
    ctx.bezierCurveTo(12, 28, 18, 12, 32, 10);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  // Soft glow sprite for stars, fireflies, and magic lights
  createGlowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 230, 210, 0.8)');
    grad.addColorStop(0.5, 'rgba(240, 180, 220, 0.3)');
    grad.addColorStop(1, 'rgba(240, 180, 220, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  // Musical note sprite
  createNoteTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#FFE5B4';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', 32, 32);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  // Dynamic canvas texture for photo frames
  createPhotoTexture(imageUrl: string, fallbackTitle: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Initial placeholder drawing
    ctx.fillStyle = '#f0e6e9';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#8f7e8a';
    ctx.font = '24px Cormorant Garamond, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackTitle, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Load actual image asynchronously with crossOrigin
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, 512, 512);
        // Draw image cover cropped
        const scale = Math.max(512 / img.width, 512 / img.height);
        const x = 512 / 2 - (img.width / 2) * scale;
        const y = 512 / 2 - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Soft romantic vignette
        const grad = ctx.createRadialGradient(256, 256, 180, 256, 256, 320);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(40,25,35,0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        texture.needsUpdate = true;
      };
      img.onerror = () => {
        // Leave placeholder
        texture.needsUpdate = true;
      };
      img.src = imageUrl;
    }

    return texture;
  },
};
