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
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometriesUtils";

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

(async function() {
  let pmrem = new PMREMGenerator(renderer);
  //let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("limpopo_golf_course_4k.hdr");
  let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("envmap.hdr");

  envmap = pmrem.fromEquirectangular(envmapTexture).texture;
  
  let sphereMesh = new Mesh(
    new SphereGeometry(5, 10, 10),
    new MeshStandardMaterial({ 
      envMap: envmap,
      roughness: 0,
      metalness: 1,
    })
  );
  scene.add(sphereMesh);  
  
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
})();
