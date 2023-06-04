import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
//scene.background = THREE.Color("#FFEECC");
//scene.background = THREE.Color("#0000CC");

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

let sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(5, 10, 10),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(sphereMesh);


//const controls = new OrbitControls(camera, renderer.domElement);

(async function() {
  renderer.setAnimationLoop(() => {
    //controls.update();
    renderer.render(scene, camera);
  });
})();
