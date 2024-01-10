import * as THREE from "three";
const socket= io("/shared-folder");
import { EffectComposer } from 'https://unpkg.com/three@0.148.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.148.0/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'https://unpkg.com/three@0.148.0/examples/jsm/postprocessing/GlitchPass.js';
import { RenderPixelatedPass } from 'https://unpkg.com/three@0.148.0/examples/jsm/postprocessing/RenderPixelatedPass.js';
// import { MathUtils } from 'three';

let composer;
const clock = new THREE.Clock();
const canvas = document.querySelector(".cursors");
const WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
var mouseX, mouseY;
var curX, curY;
const fov = 50;
const planeAspectRatio = WIDTH/HEIGHT;
socket.connect({secure: true});

// scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('rgba(100,100,100)');
// CANVAS for all DOM layers
var curImg = document.querySelector("#curImg");
var cursorLayer = document.querySelector('.cursorLayer');
var cursorCtx = cursorLayer.getContext('2d');
cursorLayer.width = WIDTH; cursorLayer.height = HEIGHT;

window.addEventListener('mousemove', (e)=> sendMyCursor(e));

function setPosition(e) {
    const curRect = cursorLayer.getBoundingClientRect();
    }

    
// draw peers' cursor
function drawCursor(x,y) {
    cursorCtx.clearRect(0,0,cursorLayer.width, cursorLayer.height);
    // onPointerMove(e);
    cursorCtx.drawImage(curImg, x, y, 33, 40);
}

// send my cursor pos
function sendMyCursor(e){
    let x = e.clientX;
    let y = e.clientY;
    let position = {x,y};
    socket.emit("cursorpeers", position);
}

socket.on("cursorpeers", (gotPosition)=>{
    let x = gotPosition.x;
    let y = gotPosition.y;
    let who = gotPosition.who;
    let thisCur = new Image();
    thisCur.src = curImg.src;
    drawCursor(x, y);
    // console.log(thisCur, x,y,who);
});

// textures
    // color texture
    let cursorTex = new THREE.CanvasTexture(cursorLayer);
    cursorTex.magFilter = THREE.NearestFilter;
    cursorTex.minFilter = THREE.NearestFilter;

// forms		
const cursorMat = new THREE.MeshPhongMaterial({
    // transparent: true,
    opacity: 1,
    color: new THREE.Color("rgba(200,200,200)"),
    // alphaMap: cursorTex,
    // aoMap: cursorTex,
    // map: cursorTex,
    bumpMap: cursorTex,
    bumpScale: 1,
    dithering: true,
    reflectivity: 0.8,
    shininess: 0.8,
    // combine: 0.9
    // emissive: "white",
    // emissiveIntensity: 0.3,
});

const screenGeo = new THREE.PlaneGeometry(WIDTH, HEIGHT);


const cursorLMesh = new THREE.Mesh(screenGeo, cursorMat);
    cursorLMesh.castShadow = true; 
    cursorLMesh.receiveShadow = true;	
    cursorLMesh.scale.set = (1.5,1.5,1.5);
    scene.add( cursorLMesh );
    
// fog
// scene.fog = new THREE.Fog("black", 1, 100);
    

// camera
const camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 5000);
camera.position.z = 400;
scene.add(camera);

// light
let hemLight, ambLight, dirLight, camLight;

ambLight = new THREE.AmbientLight( "white", 2);
scene.add(ambLight);

// hemLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.9);
hemLight = new THREE.HemisphereLight( "white", "white", 0.9);
scene.add( hemLight );

camLight = new THREE.DirectionalLight( "white", 1 );
camLight.lookAt(0,0,0);
camLight.castShadow = true;
scene.add( camLight );

dirLight = new THREE.DirectionalLight( "white", 1);
dirLight.lookAt(0,0,0);
dirLight.castShadow = true;
scene.add( dirLight );


// renderer 
const renderer = new THREE.WebGLRenderer({canvas, antilias:true, alpha: true });
renderer.setClearColor( 0x000000, 0 ); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(WIDTH, HEIGHT);
renderer.render(scene, camera);

// postprocessing
composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );
let glitchPass = new GlitchPass();
let pixelPass = new RenderPixelatedPass(7, scene, camera); // number here -> pixel size
composer.addPass( glitchPass);

// control
// const controls = new OrbitControls(camera, canvas);
// controls.enableZoom = false;
// controls.minPolarAngle = Math.PI/2;
// controls.maxPolarAngle = Math.PI/2;
// controls.minAzimuthAngle = -Math.PI/2;
// controls.maxAzimuthAngle = Math.PI/2;

// controls.enableDamping = true;
// controls.update();

// document.onmousedown = ()=>{
//     console.log(camera.rotation)
// }


// events
window.addEventListener('resize', onWindowResize);
document.body.addEventListener("mousemove", onPointerMove);

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    renderer.setSize(window.innerWidth,window.innerHeight);
    composer.setSize( window.innerWidth, window.innerHeight );
    
    // if (camera.aspect > planeAspectRatio) {
    //     // window too large
    //     const cameraHeight = Math.tan(MathUtils.degToRad(fov / 2));
    //     const ratio = camera.aspect / planeAspectRatio;
    //     const newCameraHeight = cameraHeight / ratio;
    //     camera.fov = MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
    // } else {
    //     // window too narrow
	// 	const cameraHeight = Math.tan(MathUtils.degToRad(fov / 2));
	// 	const ratio = camera.aspect / planeAspectRatio;
	// 	const newCameraHeight = cameraHeight / ratio;
	// 	camera.fov = MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
    // }
    
    camera.updateProjectionMatrix();

}

function onPointerMove( event ) {
    if ( event.isPrimary === false ) return;
    mouseX = event.clientX - WIDTH/2;
    mouseY = event.clientY - HEIGHT/2;
    // cursor.style.transform = `translate3d(${event.clientX +10}px, ${event.clientY+10}px, 0)`;
    curX = event.clientX;
    curY = event.clientY;
}

function loop() {
    const time = Date.now() * 0.0005;
    // const delta = clock.getDelta();
    // var mousePos = Math.abs(mouseY/mouseX);

    cursorTex.needsUpdate = true;

    // camLight.position.x = camera.position.x -50;
    // camLight.position.y = camera.position.y - 50;
    // camLight.position.z = camera.position.z + 20; 

    // dirLight.position.x = Math.cos( time * -0.3 ) * 10;
    // dirLight.position.y = Math.sin( time * -0.1 ) * 9;
    // dirLight.position.z = Math.cos( time * 0.3 ) * 7;
    dirLight.rotation.z = Math.cos( time * 0.6 );
    
    requestAnimationFrame(loop);
    // controls.update();
    composer.render(); // replacing renderer's render func
    // renderer.render(scene,camera);
}
loop();
