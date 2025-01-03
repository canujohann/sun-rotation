import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';
import './style.css';

// Debug
const gui = new GUI();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.5
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Earth Group (for orbital movement)
const earthGroup = new THREE.Group();
scene.add(earthGroup);

// Earth
const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
const earthMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2233ff,
    shininess: 25,
    specular: 0x222222
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);
earth.castShadow = true;
earth.receiveShadow = true;

// Japan marker
const japanGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const japanMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xff00ff,
    shininess: 5,
});
const japanMarker = new THREE.Mesh(japanGeometry, japanMaterial);
japanMarker.castShadow = true;
japanMarker.receiveShadow = true;

// Calculate Japan's position (36°N, 138°E)
const japanLatitude = 36 * (Math.PI / 180);
const japanLongitude = 138 * (Math.PI / 180);
const japanRadius = 2.1;

// Position Japan marker
const positionJapanMarker = () => {
    const x = japanRadius * Math.cos(japanLatitude) * Math.cos(japanLongitude);
    const y = japanRadius * Math.sin(japanLatitude);
    const z = japanRadius * Math.cos(japanLatitude) * Math.sin(japanLongitude);
    japanMarker.position.set(x, y, z);
};

positionJapanMarker();
earth.add(japanMarker);  // Add Japan marker as child of Earth

// Moon
const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x888888,
    shininess: 5
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.castShadow = true;
moon.receiveShadow = true;
earthGroup.add(moon);

// Lighting
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
scene.add(sunLight);

// Add helper for sun light shadow camera
const sunLightHelper = new THREE.CameraHelper(sunLight.shadow.camera);
sunLightHelper.visible = false;
scene.add(sunLightHelper);


const lightFolder = gui.addFolder('太陽の光');
lightFolder.close();

lightFolder.add(sunLight, 'intensity', 0, 5, 0.1).name('強さ');
lightFolder.addColor(sunLight, 'color').name('色');

// Create an object to hold the helper visibility state
const helperState = {
    visible: false
};

// Add helper visibility toggle
lightFolder.add(helperState, 'visible')
    .name('角度表示')
    .onChange((value) => {
        sunLightHelper.visible = value;
    });

// // Add shadow camera controls
// const cameraFolder = lightFolder.addFolder('Shadow Camera');
// cameraFolder.add(sunLight.shadow.camera, 'left', -100, 0).onChange(() => sunLightHelper.update());
// cameraFolder.add(sunLight.shadow.camera, 'right', 0, 100).onChange(() => sunLightHelper.update());
// cameraFolder.add(sunLight.shadow.camera, 'top', 0, 100).onChange(() => sunLightHelper.update());
// cameraFolder.add(sunLight.shadow.camera, 'bottom', -100, 0).onChange(() => sunLightHelper.update());

// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambientLight);

// Ambient light GUI
const ambientLightFolder = gui.addFolder("全体照明");
//ambientLightFolder.addColor(ambientLight, 'color').name('色');
ambientLightFolder.add(ambientLight, 'intensity', 0, 10, 0.1).name('強さ');

// Add orbit visualizers
const earthOrbitGeometry = new THREE.RingGeometry(19.5, 20.5, 64);
const earthOrbitMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x444444, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
});
const earthOrbit = new THREE.Mesh(earthOrbitGeometry, earthOrbitMaterial);
earthOrbit.rotation.x = Math.PI / 2;
scene.add(earthOrbit);

// Position earth at orbit distance
earth.position.x = 20;

// Camera position
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// Animation variables
let time = 0;

// Add info display
const infoElement = document.createElement('div');
infoElement.id = 'info';
infoElement.innerHTML = `
    マウスでカメラを回転させてね<br>
    スコールでズーム！<br>
    ピンク色のマーカーが日本だよ！<br>
`;
document.body.appendChild(infoElement);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Rotate Earth around its own axis
    earth.rotation.y += 0.01;

    // Rotate Earth Group around the Sun
    earthGroup.rotation.y = time;

    // Update moon position
    const moonOrbitRadius = 4;
    moon.position.x = earth.position.x + Math.cos(time * 3) * moonOrbitRadius;
    moon.position.z = Math.sin(time * 3) * moonOrbitRadius;

    // Update sunLight to point at Earth
    const earthWorldPos = new THREE.Vector3();
    earth.getWorldPosition(earthWorldPos);
    sunLight.target.position.copy(earthWorldPos);
    sunLight.target.updateMatrixWorld();

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();


