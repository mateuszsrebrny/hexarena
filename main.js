import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#FFEECC");

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;

document.body.appendChild(renderer.domElement);

let envmap;

const controls = new OrbitControls(camera, renderer.domElement);

(async function() {
  let pmrem = new THREE.PMREMGenerator(renderer);
  //let envmapTexture = await new RGBELoader().setDataType(THREE.FloatType).loadAsync("envmap.hdr");
  let envmapTexture = await new RGBELoader().setDataType(THREE.FloatType).loadAsync("limpopo_golf_course_4k.hdr");

  envmap = pmrem.fromEquirectangular(envmapTexture).texture;
  
  let sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 10, 10),
    new THREE.MeshStandardMaterial({ 
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
