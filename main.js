console.log("5");
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
  MeshStandardMaterial,
  BoxGeometry,
  CylinderGeometry,
  Vector2,
} from "three";

console.log("6");
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import SimplexNoise from "https://cdn.skypack.dev/simplex-noise";

console.log("7");

const scene = new Scene();
scene.background = new Color("#FFEECC");

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-17, 31, 33);
camera.position.set(0, 0, 50);
//camera.position.set(0, 0, 50);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;

document.body.appendChild(renderer.domElement);

let envmap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

(async function() {
  let pmrem = new PMREMGenerator(renderer);
  //let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("limpopo_golf_course_4k.hdr");
  let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("envmap.hdr");
  envmap = pmrem.fromEquirectangular(envmapTexture).texture;

  const simplex = new SimplexNoise();

  console.log("1");

  let mapSize = 5
  for (let i = -1*mapSize; i <= mapSize; ++i) {
    for (let j = -1*mapSize; j <= mapSize; ++j) {
      let position = tileToPosition(i, j);

      if (position.length() > mapSize) continue;
      
      console.log("3");
      let noise = (simplex.noise2D(i * 0.1, j * 0.1) + 1) * 0.5;
      noise = Math.pow(noise, 1.5);
      console.log("4");

      makeHex(noise * 10, position);
    }
  }

  console.log("2");
  let hexagonMesh = new Mesh(
    hexagonGeometries,
    new MeshStandardMaterial({ 
      envMap: envmap,
      flatShading: true,
    })
  );

  scene.add(hexagonMesh);  
  
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
})();

function tileToPosition(tileX, tileY) {
  return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
}

let hexagonGeometries = new BoxGeometry(0, 0, 0);

function hexGeometry(height, position) {
  let geo = new CylinderGeometry(1, 1, height, 6, 1, false);
  geo.translate(position.x, height * 0.5, position.y);

  return geo;
}

function makeHex(height, position) {
  let geo = hexGeometry(height, position);

  hexagonGeometries = mergeBufferGeometries([hexagonGeometries, geo]);
}
