import "./style.css";

import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  sRGBEncoding,
  PMREMGenerator,
  FloatType,
  Mesh,
  SphereGeometry,
  BoxGeometry,
  CylinderGeometry,
  Vector2,
  TextureLoader,
  MeshPhysicalMaterial,
  PCFSoftShadowMap,
  PointLight,
  DoubleSide,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { createNoise2D } from "simplex-noise";


const scene = new Scene();
scene.background = new Color("#FFEECC");

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-17, 31, 33);
//camera.position.set(0, 0, 50);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//const light = new PointLight(new Color("#FFCB8E").convertSRGBToLinear().convertSRGBToLinear(), 80, 200);
const light = new PointLight(0xffffff, 80, 200);
light.position.set(10, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
scene.add(light);

let envmap;

const MAP_SIZE = 10;
const MAX_HEIGHT = 10;
const STONE_HEIGHT = MAX_HEIGHT * 0.8;
const DIRT_HEIGHT = MAX_HEIGHT * 0.7;
const GRASS_HEIGHT = MAX_HEIGHT * 0.5;
const SAND_HEIGHT = MAX_HEIGHT * 0.3;
const DIRT2_HEIGHT = MAX_HEIGHT * 0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

(async function() {
  let pmrem = new PMREMGenerator(renderer);
  //let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("limpopo_golf_course_4k.hdr");
  let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("envmap.hdr");
  envmap = pmrem.fromEquirectangular(envmapTexture).texture;

  let textures = {
    dirt: await new TextureLoader().loadAsync("dirt.png"),
    dirt2: await new TextureLoader().loadAsync("dirt2.jpg"),
    grass: await new TextureLoader().loadAsync("grass.jpg"),
    sand: await new TextureLoader().loadAsync("sand.jpg"),
    stone: await new TextureLoader().loadAsync("stone.png"),
    water: await new TextureLoader().loadAsync("water.jpg"),
  };

  
  const noise2D = createNoise2D(Math.random);

  for (let i = -1*MAP_SIZE; i <= MAP_SIZE; ++i) {
    for (let j = -1*MAP_SIZE; j <= MAP_SIZE; ++j) {
      let position = tileToPosition(i, j);

      if (position.length() > MAP_SIZE) continue;
      
      let noise = (noise2D(i * 0.1, j * 0.1) + 1) * 0.5;
      noise = Math.pow(noise, 1.5);

      makeHex(noise * MAX_HEIGHT, position);
    }
  }

  let stoneMesh = hexMesh(stoneGeo, textures.stone);
  let dirtMesh = hexMesh(dirtGeo, textures.dirt);
  let dirt2Mesh = hexMesh(dirt2Geo, textures.dirt2);
  let sandMesh = hexMesh(sandGeo, textures.sand);
  let grassMesh = hexMesh(grassGeo, textures.grass);

  scene.add(stoneMesh, dirtMesh, dirt2Mesh, sandMesh, grassMesh);  
 
  let seaMesh = new Mesh(
    new CylinderGeometry(MAP_SIZE + 1, MAP_SIZE + 1, MAX_HEIGHT * 0.2, 50),
    new MeshPhysicalMaterial({
      envMap: envmap,
      color: new Color("#55aaff").convertSRGBToLinear().multiplyScalar(3),
      ior: 1.4,
      transmission: 1,
      transparent: true,
      thickness: 1.5,
      envMapIntensity: 0.2,
      roughness: 1,
      metalness: 0.025,
      roughnessMap: textures.water,
      metalnessMap: textures.water,
    })
  );
  seaMesh.receiveShadow = true;
  seaMesh.position.set(0, MAX_HEIGHT * 0.1, 0);
  scene.add(seaMesh);

  let mapContainer = new Mesh(
    new CylinderGeometry(MAP_SIZE + 1.1, MAP_SIZE + 1.1, MAX_HEIGHT * 0.25, 50, 1, true),
    new MeshPhysicalMaterial({
      envMap: envmap,
      map: textures.dirt,
      envMapIntensity: 0.2,
      side: DoubleSide,
    })
  );
  mapContainer.receiveShadow = true;
  mapContainer.position.set(0, MAX_HEIGHT * 0.125, 0);
  scene.add(mapContainer);

  let mapFloor = new Mesh(
    new CylinderGeometry(MAP_SIZE + 2.5, MAP_SIZE + 2.5, MAX_HEIGHT * 0.1, 50),
    new MeshPhysicalMaterial({
      envMap: envmap,
      map: textures.dirt2,
      envMapIntensity: 0.1,
      side: DoubleSide,
    })
  );
  mapFloor.receiveShadow = true;
  mapFloor.position.set(0, -MAX_HEIGHT * 0.05, 0);
  scene.add(mapFloor);

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
})();

function tileToPosition(tileX, tileY) {
  return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
}

let stoneGeo = new BoxGeometry(0, 0, 0);
let dirtGeo = new BoxGeometry(0, 0, 0);
let dirt2Geo = new BoxGeometry(0, 0, 0);
let sandGeo = new BoxGeometry(0, 0, 0);
let grassGeo = new BoxGeometry(0, 0, 0);

function hexGeometry(height, position) {
  let geo = new CylinderGeometry(1, 1, height, 6, 1, false);
  geo.translate(position.x, height * 0.5, position.y);

  return geo;
}

function makeHex(height, position) {
  let geo = hexGeometry(height, position);

  if (height > STONE_HEIGHT) {
    stoneGeo = mergeBufferGeometries([stoneGeo, geo]);
  } else if (height > DIRT_HEIGHT) {
    dirtGeo = mergeBufferGeometries([dirtGeo, geo]);
  } else if (height > GRASS_HEIGHT) {
    grassGeo = mergeBufferGeometries([grassGeo, geo]);
  } else if (height > SAND_HEIGHT) {
    sandGeo = mergeBufferGeometries([sandGeo, geo]);
  } else if (height > DIRT2_HEIGHT) {
    dirt2Geo = mergeBufferGeometries([dirt2Geo, geo]);
  }
}

function hexMesh(geo, map) {

  let mat = new MeshPhysicalMaterial({
    envMap: envmap,
    //envMapIntensity: 0.135,
    envMapIntensity: 1,
    flatShading: true,
    map
  });

  let mesh = new Mesh(geo, mat);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;

}
