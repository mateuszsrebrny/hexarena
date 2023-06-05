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

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

const scene = new Scene();
scene.background = new Color("#FFEECC");

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 50);

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
  
  for (let i = -5; i <= 5; ++i) {
    for (let j = -5; j <= 5; ++j) {
      makeHex(3, new Vector2(i, j));
    }
  }

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
