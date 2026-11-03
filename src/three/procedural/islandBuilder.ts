import * as THREE from 'three';
import { proceduralTextures } from './textures';

export function buildFloatingIsland(): {
  islandGroup: THREE.Group;
  waterMesh: THREE.Mesh;
  cloudMeshes: THREE.Group[];
  update: (delta: number, time: number) => void;
} {
  const islandGroup = new THREE.Group();
  islandGroup.name = 'floating_island_root';

  // 1. Grassy Top Surface & Layered Terrain
  // Stylized multi-faceted organic island geometry
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x9ec79c, // Richer soft pastel meadow green
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });

  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e7769, // Warm earthy rock
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  const woodTex = proceduralTextures.createWoodTexture();
  const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: 0xa88572,
    roughness: 0.75,
    metalness: 0.1,
  });

  // Top surface: Cylinder with custom vertices displacement
  const topGeo = new THREE.CylinderGeometry(38, 42, 6, 32, 4);
  const pos = topGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Organic perimeter distortion
    const angle = Math.atan2(z, x);
    const dist = Math.sqrt(x * x + z * z);
    const wobble = Math.sin(angle * 3.5) * 4.0 + Math.cos(angle * 6.0) * 2.5;

    // Island height variation (hill on North for Observatory, dip for Lake on South-West)
    let heightOffset = 0;
    if (z < -8 && Math.abs(x) < 20) {
      // Hill for observatory
      heightOffset += Math.sin((z + 8) * -0.1) * 7.5;
    }
    if (x < -10 && z > 5) {
      // Lake depression
      const lakeDist = Math.hypot(x - -20, z - 16);
      if (lakeDist < 12) {
        heightOffset -= (12 - lakeDist) * 0.35;
      }
    }

    pos.setXYZ(i, x + (x > 0 ? wobble * 0.3 : -wobble * 0.3), y + heightOffset, z + wobble * 0.3);
  }
  topGeo.computeVertexNormals();

  const mainTopMesh = new THREE.Mesh(topGeo, grassMaterial);
  mainTopMesh.position.y = 0;
  mainTopMesh.receiveShadow = true;
  islandGroup.add(mainTopMesh);

  // Underside Inverted Mountain Roots
  const bottomGeo = new THREE.ConeGeometry(40, 32, 24, 6);
  bottomGeo.rotateX(Math.PI);
  const bPos = bottomGeo.attributes.position;
  for (let i = 0; i < bPos.count; i++) {
    const x = bPos.getX(i);
    const y = bPos.getY(i);
    const z = bPos.getZ(i);
    const noise = Math.sin(x * 0.4) * Math.cos(z * 0.4) * 3.0;
    bPos.setXYZ(i, x + noise * 0.5, y + noise * 0.8, z + noise * 0.5);
  }
  bottomGeo.computeVertexNormals();

  const bottomMesh = new THREE.Mesh(bottomGeo, rockMaterial);
  bottomMesh.position.y = -18;
  bottomMesh.castShadow = true;
  bottomMesh.receiveShadow = true;
  islandGroup.add(bottomMesh);

  // Satellite small floating rocks with miniature crystals/trees
  const satelliteCoords = [
    { x: -48, y: -4, z: -15, s: 6 },
    { x: 46, y: -2, z: 22, s: 7 },
    { x: -32, y: 3, z: 42, s: 5 },
    { x: 38, y: -8, z: -38, s: 8 },
    { x: -44, y: -10, z: 26, s: 5.5 },
    { x: 15, y: -12, z: 52, s: 6 },
  ];

  satelliteCoords.forEach((c, idx) => {
    const satGroup = new THREE.Group();
    satGroup.position.set(c.x, c.y, c.z);

    const satRockGeo = new THREE.DodecahedronGeometry(c.s, 1);
    const satMesh = new THREE.Mesh(satRockGeo, rockMaterial);
    satMesh.castShadow = true;
    satMesh.receiveShadow = true;
    satGroup.add(satMesh);

    // Mini grass cap
    const capGeo = new THREE.CylinderGeometry(c.s * 0.9, c.s * 0.95, 1.2, 8);
    const capMesh = new THREE.Mesh(capGeo, grassMaterial);
    capMesh.position.y = c.s * 0.6;
    satGroup.add(capMesh);

    // Tiny glowing crystal or flower
    const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: idx % 2 === 0 ? 0xffc5df : 0xb5d4ff,
      roughness: 0.2,
      metalness: 0.8,
      emissive: idx % 2 === 0 ? 0x662244 : 0x224466,
      emissiveIntensity: 0.6,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.y = c.s * 0.6 + 1.2;
    satGroup.add(crystalMesh);

    islandGroup.add(satGroup);
  });

  // 2. Crystal Lake Basin & Water
  const waterGeo = new THREE.CircleGeometry(11, 32);
  waterGeo.rotateX(-Math.PI / 2);

  // Custom transparent, shimmering water material
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9cdbe9,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.333,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMaterial);
  waterMesh.position.set(-20, 2.2, 16);
  waterMesh.receiveShadow = true;
  islandGroup.add(waterMesh);

  // Lake Border Rocks & Water Lilies
  for (let a = 0; a < Math.PI * 2; a += 0.45) {
    const rx = -20 + Math.cos(a) * (10.5 + (Math.sin(a * 4) * 0.8));
    const rz = 16 + Math.sin(a) * (10.5 + (Math.cos(a * 4) * 0.8));
    const rockR = 0.8 + Math.random() * 0.7;
    const bGeo = new THREE.DodecahedronGeometry(rockR, 1);
    const borderRock = new THREE.Mesh(bGeo, rockMaterial);
    borderRock.position.set(rx, 2.3, rz);
    borderRock.rotation.set(Math.random(), Math.random(), Math.random());
    borderRock.castShadow = true;
    islandGroup.add(borderRock);
  }

  // Water Lilies
  const lilyMat = new THREE.MeshStandardMaterial({
    color: 0x5a9462,
    roughness: 0.6,
  });
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xfce4ec,
    emissive: 0x4a2030,
    emissiveIntensity: 0.3,
  });
  for (let i = 0; i < 5; i++) {
    const lilyGroup = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 12), lilyMat);
    lilyGroup.add(pad);
    const flower = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 8), flowerMat);
    flower.position.y = 0.3;
    lilyGroup.add(flower);

    lilyGroup.position.set(
      -20 + (Math.random() - 0.5) * 12,
      2.25,
      16 + (Math.random() - 0.5) * 12
    );
    islandGroup.add(lilyGroup);
  }

  // Wooden Lake Pier
  const pierGroup = new THREE.Group();
  pierGroup.position.set(-13, 2.4, 16);
  pierGroup.rotation.y = -0.3;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 2.5), woodMaterial);
  deck.castShadow = true;
  pierGroup.add(deck);

  // Pier support posts
  [-2.6, 0, 2.6].forEach((xPos) => {
    [-1, 1].forEach((zPos) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.5, 8), woodMaterial);
      post.position.set(xPos, -1.0, zPos);
      post.castShadow = true;
      pierGroup.add(post);
    });
  });
  islandGroup.add(pierGroup);

  // 3. Waterfall falling over cliff gap into clouds
  const waterfallGeo = new THREE.PlaneGeometry(3.5, 22, 12, 24);
  const waterfallMat = new THREE.MeshStandardMaterial({
    color: 0xb5e8f7,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  const waterfallMesh = new THREE.Mesh(waterfallGeo, waterfallMat);
  waterfallMesh.position.set(-30.5, -8, 20.5);
  waterfallMesh.rotation.y = -Math.PI / 4;
  islandGroup.add(waterfallMesh);

  // 4. Cobblestone Pathways connecting the island
  const cobbleTex = proceduralTextures.createCobblestoneTexture();
  const pathMat = new THREE.MeshStandardMaterial({
    map: cobbleTex,
    roughness: 0.85,
    color: 0xdfd8e8,
  });

  // Radiating path ribbons
  const pathRoutes = [
    // Center House to Garden
    [new THREE.Vector3(0, 3.1, 4), new THREE.Vector3(-8, 3.1, 7), new THREE.Vector3(-16, 3.1, 10)],
    // Center House to Lake
    [new THREE.Vector3(-2, 3.1, 2), new THREE.Vector3(-8, 2.9, 10), new THREE.Vector3(-14, 2.6, 15)],
    // Center House to Photo Museum
    [new THREE.Vector3(3, 3.1, 0), new THREE.Vector3(12, 3.1, -4), new THREE.Vector3(20, 3.1, -10)],
    // Center House to Post Office
    [new THREE.Vector3(2, 3.1, -2), new THREE.Vector3(8, 3.1, -14), new THREE.Vector3(12, 3.1, -22)],
    // Center House to Observatory Hill
    [new THREE.Vector3(0, 3.1, -4), new THREE.Vector3(-2, 5.0, -16), new THREE.Vector3(-4, 9.2, -26)],
    // Center House to Music Pavilion
    [new THREE.Vector3(2, 3.1, 4), new THREE.Vector3(10, 3.1, 10), new THREE.Vector3(16, 3.1, 16)],
    // Center House to Sunset Viewpoint
    [new THREE.Vector3(4, 3.1, 6), new THREE.Vector3(14, 4.2, 14), new THREE.Vector3(24, 5.2, 20)],
  ];

  pathRoutes.forEach((points) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 1.1, 6, false);
    // Flatten slightly
    tubeGeo.scale(1, 0.15, 1);
    const pathMesh = new THREE.Mesh(tubeGeo, pathMat);
    pathMesh.receiveShadow = true;
    islandGroup.add(pathMesh);
  });

  // 5. Surrounding Volumetric Cloud Layers below the island
  const cloudMeshes: THREE.Group[] = [];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xfdf7fa,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
  });

  for (let c = 0; c < 16; c++) {
    const cloudCluster = new THREE.Group();
    const angle = (c / 16) * Math.PI * 2;
    const radius = 55 + (Math.sin(c * 2) * 12);
    const height = -16 + (Math.cos(c * 3) * 6);

    cloudCluster.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);

    // Assemble 5-7 overlapping spheres for each fluffy cloud
    const sphereCount = 5 + Math.floor(Math.random() * 3);
    for (let s = 0; s < sphereCount; s++) {
      const puffGeo = new THREE.SphereGeometry(6 + Math.random() * 5, 8, 8);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 14
      );
      cloudCluster.add(puff);
    }

    islandGroup.add(cloudCluster);
    cloudMeshes.push(cloudCluster);
  }

  // Animation update function
  const update = (delta: number, time: number) => {
    // Gentle floating island breathing motion
    islandGroup.position.y = Math.sin(time * 0.6) * 0.4;

    // Slowly rotate clouds
    cloudMeshes.forEach((cg, idx) => {
      cg.rotation.y += delta * 0.02 * (idx % 2 === 0 ? 1 : -1);
    });

    // Shimmer water
    const wPos = waterGeo.attributes.position;
    for (let i = 0; i < wPos.count; i++) {
      const u = wPos.getX(i);
      const v = wPos.getY(i);
      const wave = Math.sin(u * 1.5 + time * 2.0) * Math.cos(v * 1.5 + time * 1.8) * 0.08;
      wPos.setZ(i, wave);
    }
    waterGeo.computeVertexNormals();
    waterGeo.attributes.position.needsUpdate = true;
  };

  return {
    islandGroup,
    waterMesh,
    cloudMeshes,
    update,
  };
}
