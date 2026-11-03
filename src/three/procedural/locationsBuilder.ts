import * as THREE from 'three';
import { proceduralTextures } from './textures';
import { InteractiveObjectData, IslandLocationId } from '../../types';

export interface BuiltLocationsResult {
  locationsGroup: THREE.Group;
  interactiveObjects: Array<{
    mesh: THREE.Object3D;
    data: InteractiveObjectData;
  }>;
  dynamicFrames: Map<string, THREE.Mesh>;
  update: (delta: number, time: number) => void;
}

export function buildAllLocations(): BuiltLocationsResult {
  const locationsGroup = new THREE.Group();
  locationsGroup.name = 'island_locations';

  const interactiveObjects: Array<{
    mesh: THREE.Object3D;
    data: InteractiveObjectData;
  }> = [];

  const dynamicFrames = new Map<string, THREE.Mesh>();

  // Shared Materials
  const woodTex = proceduralTextures.createWoodTexture();
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: 0xa67c65,
    roughness: 0.7,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: 0x6e4a36,
    roughness: 0.6,
  });

  const pastelWallMat = new THREE.MeshStandardMaterial({
    color: 0xfff6eb, // Soft cream pastel
    roughness: 0.9,
    metalness: 0.05,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xd98b99, // Dusty rose terracotta
    roughness: 0.65,
    metalness: 0.1,
  });

  const warmGlassMat = new THREE.MeshStandardMaterial({
    color: 0xffe299,
    emissive: 0xffaa44,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe6b85c,
    roughness: 0.3,
    metalness: 0.85,
  });

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x93889b,
    roughness: 0.85,
  });

  // Helper to register interactive object
  const registerInteractive = (mesh: THREE.Object3D, data: InteractiveObjectData) => {
    mesh.userData = { interactiveData: data };
    interactiveObjects.push({ mesh, data });
  };

  // Helper to build a 3D Photo Frame
  const buildPhotoFrame = (frameId: string, locationId: IslandLocationId, title: string, subtitle: string) => {
    const frameGroup = new THREE.Group();
    frameGroup.name = `frame_${frameId}`;

    // Outer wooden border
    const borderGeo = new THREE.BoxGeometry(2.4, 1.8, 0.18);
    const borderMesh = new THREE.Mesh(borderGeo, darkWoodMat);
    borderMesh.castShadow = true;
    frameGroup.add(borderMesh);

    // Inner photo canvas
    const photoGeo = new THREE.PlaneGeometry(2.1, 1.5);
    const photoTexture = proceduralTextures.createPhotoTexture('', title);
    const photoMat = new THREE.MeshBasicMaterial({
      map: photoTexture,
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.z = 0.1;
    frameGroup.add(photoMesh);

    dynamicFrames.set(frameId, photoMesh);

    registerInteractive(borderMesh, {
      id: frameId,
      type: 'photo_frame',
      title,
      subtitle,
      locationId,
      position: [0, 0, 0],
      dataPayload: { frameId },
    });

    return frameGroup;
  };

  // =========================================================================
  // 1. LOCATION A: THE MEMORY HOUSE (Cottage at Center: x=0, z=0)
  // =========================================================================
  const houseGroup = new THREE.Group();
  houseGroup.position.set(0, 3.0, 0);

  // Main walls
  const wallsGeo = new THREE.BoxGeometry(8, 5, 7);
  const wallsMesh = new THREE.Mesh(wallsGeo, pastelWallMat);
  wallsMesh.position.y = 2.5;
  wallsMesh.castShadow = true;
  wallsMesh.receiveShadow = true;
  houseGroup.add(wallsMesh);

  // Roof (pitched prism)
  const roofGeo = new THREE.ConeGeometry(6.4, 3.2, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.y = 6.6;
  roofMesh.scale.set(1.1, 1, 1.25);
  roofMesh.castShadow = true;
  houseGroup.add(roofMesh);

  // Chimney
  const chimneyGeo = new THREE.BoxGeometry(1.0, 3.5, 1.0);
  const chimneyMesh = new THREE.Mesh(chimneyGeo, stoneMat);
  chimneyMesh.position.set(2.4, 6.2, 1.8);
  chimneyMesh.castShadow = true;
  houseGroup.add(chimneyMesh);

  // Wooden Front Door
  const doorGeo = new THREE.BoxGeometry(1.6, 2.8, 0.1);
  const doorMesh = new THREE.Mesh(doorGeo, darkWoodMat);
  doorMesh.position.set(0, 1.4, 3.55);
  doorMesh.castShadow = true;
  houseGroup.add(doorMesh);

  // Brass Door Handle
  const knobGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const knobMesh = new THREE.Mesh(knobGeo, brassMat);
  knobMesh.position.set(0.6, 1.4, 3.65);
  houseGroup.add(knobMesh);

  // Windows with warm interior lighting
  const windowGeo = new THREE.PlaneGeometry(1.2, 1.4);
  const winFrontLeft = new THREE.Mesh(windowGeo, warmGlassMat);
  winFrontLeft.position.set(-2.2, 2.6, 3.55);
  houseGroup.add(winFrontLeft);

  const winFrontRight = new THREE.Mesh(windowGeo, warmGlassMat);
  winFrontRight.position.set(2.2, 2.6, 3.55);
  houseGroup.add(winFrontRight);

  // Flower Box under window
  const flowerBoxGeo = new THREE.BoxGeometry(1.4, 0.35, 0.4);
  const flowerBoxMat = new THREE.MeshStandardMaterial({ color: 0x8a5a44 });
  const flowerBox = new THREE.Mesh(flowerBoxGeo, flowerBoxMat);
  flowerBox.position.set(-2.2, 1.7, 3.7);
  houseGroup.add(flowerBox);

  // Mailbox at garden path
  const mailboxGroup = new THREE.Group();
  mailboxGroup.position.set(2.2, 0, 5.0);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), darkWoodMat);
  post.position.y = 0.75;
  mailboxGroup.add(post);

  const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.9), brassMat);
  boxMesh.position.set(0, 1.5, 0);
  boxMesh.castShadow = true;
  mailboxGroup.add(boxMesh);

  // Mailbox flag
  const flagMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.3, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xee5577 })
  );
  flagMesh.position.set(0.34, 1.6, 0.2);
  mailboxGroup.add(flagMesh);

  registerInteractive(boxMesh, {
    id: 'mailbox_letters',
    type: 'mailbox',
    title: 'The Relationship Mailbox',
    subtitle: 'Check for unread love letters & send new messages',
    locationId: 'memory_house',
    position: [2.2, 4.5, 5.0],
  });
  houseGroup.add(mailboxGroup);

  // Interactive Fireplace on Side Wall with live anniversary counter
  const fireplaceGeo = new THREE.BoxGeometry(2.0, 2.2, 0.6);
  const fireplaceMesh = new THREE.Mesh(fireplaceGeo, stoneMat);
  fireplaceMesh.position.set(-3.6, 1.1, 0);
  fireplaceMesh.rotation.y = Math.PI / 2;
  houseGroup.add(fireplaceMesh);

  // Fireplace Ember Glow
  const fireGlowGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const fireGlowMat = new THREE.MeshStandardMaterial({
    color: 0xff6622,
    emissive: 0xff3300,
    emissiveIntensity: 1.5,
  });
  const fireGlow = new THREE.Mesh(fireGlowGeo, fireGlowMat);
  fireGlow.position.set(-3.5, 0.6, 0);
  houseGroup.add(fireGlow);

  registerInteractive(fireplaceMesh, {
    id: 'house_fireplace',
    type: 'fireplace',
    title: 'The Hearth of Us',
    subtitle: 'Live Days-Together counter & relationship journey',
    locationId: 'memory_house',
    position: [-3.6, 4.2, 0],
  });

  // Photo Frame on Fireplace Mantel
  const cottageFrame = buildPhotoFrame(
    'frame_fireplace',
    'memory_house',
    'Fireplace Memory',
    'Click to inspect photograph'
  );
  cottageFrame.position.set(-3.55, 2.8, 0);
  cottageFrame.rotation.y = Math.PI / 2;
  cottageFrame.scale.set(0.8, 0.8, 0.8);
  houseGroup.add(cottageFrame);

  // Bookshelf (Scrapbook / Diary)
  const shelfGeo = new THREE.BoxGeometry(0.6, 3.0, 2.2);
  const shelfMesh = new THREE.Mesh(shelfGeo, darkWoodMat);
  shelfMesh.position.set(3.6, 1.5, -1.0);
  shelfMesh.rotation.y = Math.PI / 2;
  houseGroup.add(shelfMesh);

  registerInteractive(shelfMesh, {
    id: 'house_bookshelf',
    type: 'bookshelf',
    title: 'Shared & Private Diary',
    subtitle: 'Read our reflections and write new memories',
    locationId: 'memory_house',
    position: [3.6, 4.5, -1.0],
  });

  locationsGroup.add(houseGroup);

  // =========================================================================
  // 2. LOCATION B: CHERRY BLOSSOM GARDEN (x = -18, z = 10)
  // =========================================================================
  const gardenGroup = new THREE.Group();
  gardenGroup.position.set(-18, 3.0, 10);

  // Helper to build stylized Cherry Blossom Tree
  const buildCherryTree = (tx: number, tz: number, scale = 1.0) => {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);
    tree.scale.set(scale, scale, scale);

    // Twisted trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 4.5, 8);
    const trunk = new THREE.Mesh(trunkGeo, darkWoodMat);
    trunk.position.y = 2.25;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    tree.add(trunk);

    // Fluffy pink blossom canopies
    const blossomMat = new THREE.MeshStandardMaterial({
      color: 0xf5ccd9,
      roughness: 0.8,
      metalness: 0.0,
      flatShading: true,
    });

    const canopyPositions = [
      [0, 4.8, 0, 2.4],
      [1.4, 4.2, 0.5, 1.8],
      [-1.2, 4.4, -0.6, 1.9],
      [0.4, 5.4, 0.8, 1.6],
      [-0.5, 5.2, -0.8, 1.7],
    ];

    canopyPositions.forEach(([cx, cy, cz, cr]) => {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), blossomMat);
      puff.position.set(cx, cy, cz);
      puff.castShadow = true;
      tree.add(puff);
    });

    return tree;
  };

  // Add 5 cherry trees
  const treeCoords = [
    [0, 0, 1.1],
    [-6, 4, 1.0],
    [-4, -6, 0.95],
    [5, -4, 1.05],
    [4, 5, 0.9],
  ];
  treeCoords.forEach(([tx, tz, s]) => {
    gardenGroup.add(buildCherryTree(tx, tz, s));
  });

  // Garden Gazebo
  const gazeboGroup = new THREE.Group();
  gazeboGroup.position.set(-2, 0, -1);
  const gazeboBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.4, 8), stoneMat);
  gazeboBase.position.y = 0.2;
  gazeboGroup.add(gazeboBase);

  // Gazebo Pillars
  for (let p = 0; p < 8; p++) {
    const pAngle = (p / 8) * Math.PI * 2;
    const px = Math.cos(pAngle) * 3.0;
    const pz = Math.sin(pAngle) * 3.0;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), darkWoodMat);
    pillar.position.set(px, 1.8, pz);
    pillar.castShadow = true;
    gazeboGroup.add(pillar);
  }

  // Gazebo Roof
  const gazeboRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.0, 8), roofMat);
  gazeboRoof.position.y = 4.2;
  gazeboRoof.castShadow = true;
  gazeboGroup.add(gazeboRoof);
  gardenGroup.add(gazeboGroup);

  // Romantic Wooden Memory Bench
  const benchGroup = new THREE.Group();
  benchGroup.position.set(1.5, 0, 3.2);
  benchGroup.rotation.y = -0.6;
  const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.8), woodMat);
  benchSeat.position.y = 0.6;
  benchSeat.castShadow = true;
  benchGroup.add(benchSeat);

  const benchBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.12), woodMat);
  benchBack.position.set(0, 1.1, -0.35);
  benchBack.castShadow = true;
  benchGroup.add(benchBack);

  registerInteractive(benchSeat, {
    id: 'garden_bench',
    type: 'memory_bench',
    title: 'The Lovers’ Garden Bench',
    subtitle: 'Sit together & read our favorite memory',
    locationId: 'cherry_garden',
    position: [-16.5, 3.6, 13.2],
  });
  gardenGroup.add(benchGroup);

  // Garden Polaroid on Tree
  const gardenFrame = buildPhotoFrame(
    'frame_garden',
    'cherry_garden',
    'Blossom Moment',
    'Polaroid tucked into the cherry tree'
  );
  gardenFrame.position.set(0, 2.6, 1.2);
  gardenFrame.rotation.y = 0.4;
  gardenFrame.scale.set(0.7, 0.7, 0.7);
  gardenGroup.add(gardenFrame);

  // Stone Lantern with Hidden Message
  const lanternGeo = new THREE.BoxGeometry(0.7, 1.4, 0.7);
  const lanternMesh = new THREE.Mesh(lanternGeo, stoneMat);
  lanternMesh.position.set(-5, 0.7, 1);
  lanternMesh.castShadow = true;
  gardenGroup.add(lanternMesh);

  const lanternGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd277,
      emissive: 0xffaa22,
      emissiveIntensity: 1.2,
    })
  );
  lanternGlow.position.set(-5, 0.8, 1);
  gardenGroup.add(lanternGlow);

  registerInteractive(lanternMesh, {
    id: 'garden_lantern',
    type: 'lantern',
    title: 'Glowing Stone Lantern',
    subtitle: 'A hidden whisper written for you',
    locationId: 'cherry_garden',
    position: [-23, 3.7, 11],
  });

  locationsGroup.add(gardenGroup);

  // =========================================================================
  // 3. LOCATION C: CRYSTAL LAKE (x = -20, z = 16)
  // =========================================================================
  const lakeGroup = new THREE.Group();
  lakeGroup.position.set(-20, 2.3, 16);

  // Floating Glass Memory Bottle
  const bottleGroup = new THREE.Group();
  bottleGroup.position.set(3, 0.1, -2);
  const bottleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.25, 0.8, 12),
    new THREE.MeshPhysicalMaterial({
      color: 0xdff5fa,
      transmission: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    })
  );
  bottleMesh.rotation.z = Math.PI / 4;
  bottleGroup.add(bottleMesh);

  // Glowing parchment note inside bottle
  const noteInside = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffe2aa,
      emissive: 0xaa7722,
      emissiveIntensity: 0.6,
    })
  );
  noteInside.rotation.z = Math.PI / 4;
  bottleGroup.add(noteInside);

  registerInteractive(bottleMesh, {
    id: 'lake_memory_bottle',
    type: 'memory_bottle',
    title: 'Drifting Glass Bottle',
    subtitle: 'A sweet message cast into the waters',
    locationId: 'crystal_lake',
    position: [-17, 2.5, 14],
  });
  lakeGroup.add(bottleGroup);

  // Wish Fountain on the shore
  const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.8, 12), stoneMat);
  fountainBase.position.set(7.5, 0.4, 0);
  fountainBase.castShadow = true;
  lakeGroup.add(fountainBase);

  const fountainWater = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.75, 12),
    new THREE.MeshPhysicalMaterial({
      color: 0x88d5e8,
      transmission: 0.8,
      roughness: 0.1,
    })
  );
  fountainWater.position.set(7.5, 0.45, 0);
  lakeGroup.add(fountainWater);

  registerInteractive(fountainBase, {
    id: 'lake_wish_fountain',
    type: 'wish_fountain',
    title: 'The Lake Wish Fountain',
    subtitle: 'Cast a coin and make a shared relationship wish',
    locationId: 'crystal_lake',
    position: [-12.5, 2.8, 16],
  });

  locationsGroup.add(lakeGroup);

  // =========================================================================
  // 4. LOCATION D: PHOTO MUSEUM (x = 22, z = -12)
  // =========================================================================
  const museumGroup = new THREE.Group();
  museumGroup.position.set(22, 3.0, -12);

  // Open neoclassical rotunda / gallery with columns
  const museumFloor = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 8.0, 0.5, 16), stoneMat);
  museumFloor.position.y = 0.25;
  museumFloor.receiveShadow = true;
  museumGroup.add(museumFloor);

  // Back Gallery Curved Wall
  const wallGeo = new THREE.CylinderGeometry(7.0, 7.0, 4.2, 16, 1, true, 0, Math.PI * 0.9);
  const museumWall = new THREE.Mesh(wallGeo, pastelWallMat);
  museumWall.position.y = 2.4;
  museumWall.castShadow = true;
  museumGroup.add(museumWall);

  // Columns
  for (let c = 0; c < 6; c++) {
    const angle = (c / 6) * (Math.PI * 0.9);
    const cx = Math.cos(angle) * 6.8;
    const cz = Math.sin(angle) * 6.8;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 4.2, 12), stoneMat);
    col.position.set(cx, 2.4, cz);
    col.castShadow = true;
    museumGroup.add(col);
  }

  // Museum Gallery Photo Frames
  const museumFrame1 = buildPhotoFrame(
    'frame_museum_1',
    'photo_museum',
    'Gallery Highlight I',
    'Click to view & reassign'
  );
  museumFrame1.position.set(-3.2, 2.6, 4.8);
  museumFrame1.rotation.y = -Math.PI / 3;
  museumGroup.add(museumFrame1);

  const museumFrame2 = buildPhotoFrame(
    'frame_museum_2',
    'photo_museum',
    'Gallery Highlight II',
    'Click to view & reassign'
  );
  museumFrame2.position.set(0, 2.6, 6.2);
  museumFrame2.rotation.y = 0;
  museumGroup.add(museumFrame2);

  const museumFrame3 = buildPhotoFrame(
    'frame_museum_3',
    'photo_museum',
    'Gallery Highlight III',
    'Click to view & reassign'
  );
  museumFrame3.position.set(3.2, 2.6, 4.8);
  museumFrame3.rotation.y = Math.PI / 3;
  museumGroup.add(museumFrame3);

  // Center Album Pedestal
  const pedestalGeo = new THREE.CylinderGeometry(0.7, 0.9, 1.2, 12);
  const pedestal = new THREE.Mesh(pedestalGeo, stoneMat);
  pedestal.position.set(0, 0.6, 2.0);
  pedestal.castShadow = true;
  museumGroup.add(pedestal);

  // Scrapbook on pedestal
  const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.6), darkWoodMat);
  bookMesh.position.set(0, 1.3, 2.0);
  museumGroup.add(bookMesh);

  registerInteractive(bookMesh, {
    id: 'museum_album',
    type: 'memory_album',
    title: 'The Master Scrapbook & Gallery',
    subtitle: 'Browse all photos, upload memories & organize albums',
    locationId: 'photo_museum',
    position: [22, 4.3, -10],
  });

  locationsGroup.add(museumGroup);

  // =========================================================================
  // 5. LOCATION E: LETTER POST OFFICE (x = 12, z = -24)
  // =========================================================================
  const postGroup = new THREE.Group();
  postGroup.position.set(12, 3.0, -24);

  // Fantasy Postal Cottage
  const postWalls = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.8, 4.5), pastelWallMat);
  postWalls.position.y = 1.9;
  postWalls.castShadow = true;
  postGroup.add(postWalls);

  const postRoof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2.4, 4), roofMat);
  postRoof.position.y = 4.8;
  postRoof.rotation.y = Math.PI / 4;
  postGroup.add(postRoof);

  // Wooden counter / desk
  const counterMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.0), darkWoodMat);
  counterMesh.position.set(0, 0.55, 2.4);
  counterMesh.castShadow = true;
  postGroup.add(counterMesh);

  // Stack of envelopes
  const envelopeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.12, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xffeedd })
  );
  envelopeMesh.position.set(0, 1.18, 2.4);
  postGroup.add(envelopeMesh);

  registerInteractive(counterMesh, {
    id: 'post_office_desk',
    type: 'letter_desk',
    title: 'The Letter Writing Desk',
    subtitle: 'Write, seal and schedule love letters',
    locationId: 'post_office',
    position: [12, 4.2, -21.6],
  });

  locationsGroup.add(postGroup);

  // =========================================================================
  // 6. LOCATION F: THE OBSERVATORY (Hilltop: x = -4, z = -26)
  // =========================================================================
  const obsGroup = new THREE.Group();
  obsGroup.position.set(-4, 9.2, -26);

  // Stone circular base
  const obsBase = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.5, 4.0, 16), stoneMat);
  obsBase.position.y = 2.0;
  obsBase.castShadow = true;
  obsGroup.add(obsBase);

  // Glass Dome with bronze ribs
  const domeGeo = new THREE.SphereGeometry(4.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshPhysicalMaterial({
    color: 0x99aacc,
    transmission: 0.9,
    roughness: 0.15,
    metalness: 0.2,
    transparent: true,
    opacity: 0.6,
  });
  const domeMesh = new THREE.Mesh(domeGeo, domeMat);
  domeMesh.position.y = 4.0;
  obsGroup.add(domeMesh);

  // Brass Telescope pointing up at 45 degrees
  const teleGroup = new THREE.Group();
  teleGroup.position.set(0, 4.5, 0);
  teleGroup.rotation.x = -Math.PI / 4;

  const teleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.2, 12), brassMat);
  teleBody.castShadow = true;
  teleGroup.add(teleBody);

  const teleTripod = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.5, 3), darkWoodMat);
  teleTripod.position.y = -1.2;
  teleTripod.rotation.x = Math.PI / 4;
  obsGroup.add(teleTripod);
  obsGroup.add(teleGroup);

  registerInteractive(teleBody, {
    id: 'observatory_telescope',
    type: 'telescope',
    title: 'Celestial Telescope',
    subtitle: 'Inspect relationship constellations & future dreams',
    locationId: 'observatory',
    position: [-4, 13.7, -26],
  });

  // Glowing Constellation Stars above Observatory
  const starCoords = [
    { id: 'star_1', title: 'The Day We Met Star', pos: [-4, 16, -26] },
    { id: 'star_2', title: 'First Journey Star', pos: [-2, 17.5, -28] },
    { id: 'star_3', title: 'One Year Anniversary Star', pos: [-6, 18, -25] },
    { id: 'star_4', title: 'Future Dream Star', pos: [-3, 19, -24] },
  ];

  starCoords.forEach((s) => {
    const starMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfff4c2,
        emissive: 0xffdd66,
        emissiveIntensity: 1.8,
      })
    );
    starMesh.position.set(s.pos[0] + 4, s.pos[1] - 9.2, s.pos[2] + 26);
    obsGroup.add(starMesh);

    registerInteractive(starMesh, {
      id: s.id,
      type: 'constellation_star',
      title: s.title,
      subtitle: 'Click to view milestone details',
      locationId: 'observatory',
      position: [s.pos[0], s.pos[1], s.pos[2]],
    });
  });

  locationsGroup.add(obsGroup);

  // =========================================================================
  // 7. LOCATION G: MUSIC PAVILION (x = 16, z = 16)
  // =========================================================================
  const musicGroup = new THREE.Group();
  musicGroup.position.set(16, 3.0, 16);

  // Octagonal platform
  const musicFloor = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.2, 0.4, 8), woodMat);
  musicFloor.position.y = 0.2;
  musicFloor.receiveShadow = true;
  musicGroup.add(musicFloor);

  // Pavilion Roof
  const musicRoof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.2, 8), roofMat);
  musicRoof.position.y = 4.2;
  musicRoof.castShadow = true;
  musicGroup.add(musicRoof);

  // Pavilion Posts
  for (let p = 0; p < 8; p++) {
    const angle = (p / 8) * Math.PI * 2;
    const px = Math.cos(angle) * 4.4;
    const pz = Math.sin(angle) * 4.4;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8), darkWoodMat);
    post.position.set(px, 2.0, pz);
    musicGroup.add(post);
  }

  // Vintage Gramophone / Record Player
  const gramoGroup = new THREE.Group();
  gramoGroup.position.set(0, 0.4, 0);

  // Cabinet
  const gramoBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), darkWoodMat);
  gramoBox.position.y = 0.4;
  gramoGroup.add(gramoBox);

  // Rotating Vinyl Disc
  const vinylGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16);
  const vinylMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.2,
    metalness: 0.7,
  });
  const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
  vinylMesh.position.set(0, 0.82, 0);
  gramoGroup.add(vinylMesh);

  // Brass Horn
  const hornGeo = new THREE.ConeGeometry(0.6, 1.4, 16, 1, true);
  hornGeo.rotateX(-Math.PI / 3);
  const hornMesh = new THREE.Mesh(hornGeo, brassMat);
  hornMesh.position.set(0, 1.4, -0.2);
  gramoGroup.add(hornMesh);

  registerInteractive(gramoBox, {
    id: 'music_record_player',
    type: 'record_player',
    title: 'Vintage Record Player',
    subtitle: 'Listen to our relationship soundtrack & romantic melodies',
    locationId: 'music_pavilion',
    position: [16, 4.4, 16],
  });
  musicGroup.add(gramoGroup);

  locationsGroup.add(musicGroup);

  // =========================================================================
  // 8. LOCATION H: SUNSET VIEWPOINT (Cliff Overlook: x = 24, z = 20)
  // =========================================================================
  const viewGroup = new THREE.Group();
  viewGroup.position.set(24, 4.5, 20);

  // Overhanging wooden deck
  const deckGeo = new THREE.BoxGeometry(6.5, 0.35, 6.5);
  const deckMesh = new THREE.Mesh(deckGeo, woodMat);
  deckMesh.position.y = 0.2;
  deckMesh.rotation.y = 0.4;
  deckMesh.castShadow = true;
  viewGroup.add(deckMesh);

  // Wooden Railing
  const railGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
  [-2.8, 0, 2.8].forEach((rx) => {
    const post = new THREE.Mesh(railGeo, darkWoodMat);
    post.position.set(rx, 0.8, 3.0);
    viewGroup.add(post);
  });

  // Romantic Cliff Easel with Featured Memory Frame
  const cliffFrame = buildPhotoFrame(
    'frame_cliff',
    'sunset_viewpoint',
    'Sunset on the Horizon',
    'Our featured memory photograph'
  );
  cliffFrame.position.set(0, 1.8, 1.0);
  cliffFrame.rotation.y = -0.3;
  cliffFrame.scale.set(1.1, 1.1, 1.1);
  viewGroup.add(cliffFrame);

  // Secret Treasure Chest on deck (Reasons I Love You)
  const chestBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.7), darkWoodMat);
  chestBase.position.set(-2.0, 0.5, 0.5);
  chestBase.castShadow = true;
  viewGroup.add(chestBase);

  registerInteractive(chestBase, {
    id: 'viewpoint_chest',
    type: 'treasure_chest',
    title: 'The Love Reasons Keepsake Box',
    subtitle: 'Pull out a handwritten reason why I love you',
    locationId: 'sunset_viewpoint',
    position: [22, 5.5, 20.5],
  });

  locationsGroup.add(viewGroup);

  // Animation updates
  const update = (delta: number, time: number) => {
    // Spin vinyl record
    vinylMesh.rotation.y += delta * 1.5;

    // Bob bottle in water
    bottleGroup.position.y = 0.1 + Math.sin(time * 2.0) * 0.08;
    bottleGroup.rotation.z = Math.PI / 4 + Math.sin(time * 1.5) * 0.05;

    // Twinkle constellation stars
    obsGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.OctahedronGeometry) {
        child.rotation.y += delta * 0.5;
        child.rotation.x += delta * 0.3;
      }
    });
  };

  return {
    locationsGroup,
    interactiveObjects,
    dynamicFrames,
    update,
  };
}
