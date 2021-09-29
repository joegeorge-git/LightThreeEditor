
// import * as THREE from './three.module.js';
// import { GLTFLoader } from './GLTFLoader.js';
// import { GLTFExporter } from './GLTFExporter.js';
// import { OrbitControls } from './OrbitControls.js';
// import { TransformControls } from './TransformControls.js';
// import { DragControls } from './DragControls.js';

// var mesh, renderer, scene, camera, manager, transformControl, controls, controlsDrag;

// class LightThreedEditor {
//     mouse = new THREE.Vector2();
//     raycaster = new THREE.Raycaster();
//     objects = [];
//     exposure = 1.0
//     constructor(options) {
//         this.container = document.querySelector(options.container);
//         this.boxWidth = container.offsetWidth;
//         this.boxHeight = container.offsetHeight;
//         this.init()
//     }

//     init(){
//        renderer = new THREE.WebGLRenderer({ antialias: true });
//         renderer.setPixelRatio(window.devicePixelRatio);
//         renderer.setSize(this.boxWidth, this.boxHeight);
//         container.appendChild(renderer.domElement);
//         // tone mapping
//         renderer.toneMapping = THREE.ACESFilmicToneMapping;
//         renderer.toneMappingExposure = this.exposure;
//         renderer.outputEncoding = THREE.sRGBEncoding;
//         // scene
//         scene = new THREE.Scene();
//         scene.background = new THREE.Color('#f0f0f0');

//         camera = new THREE.PerspectiveCamera(50, this.boxWidth / this.boxHeight, 0.01, 1000)
//         camera.position.set(0.2, .6, 1);
//         camera.lookAt(new THREE.Vector3());

//         controls = new OrbitControls(camera, renderer.domElement);
//         controls.addEventListener('change', viewRender );
//         controls.enableZoom = true;
//         controls.enablePan = false;
//         controls.enableRotate = true
//         controls.enableDamping = true;

//         scene.add(new THREE.AmbientLight(0xf0f0f0));

//         var helper = new THREE.GridHelper(5, 100);
//         helper.position.y = 0;
//         helper.material.opacity = 0.3;
//         helper.material.transparent = true;
//         scene.add(helper);

//         manager = new THREE.LoadingManager(this.viewRender );
//         const axesHelper = new THREE.AxesHelper(5);
//         scene.add(axesHelper);
//         viewRender()
//     }



// }

// function viewRender() {
//     renderer.render(scene, camera);
// }

// export {LightThreedEditor}










// var container = document.querySelector('.scene-container');

// var boxWidth = container.offsetWidth
// var boxHeight = container.offsetHeight
// const link = document.createElement('a');
// link.style.display = 'none';
// document.body.appendChild(link);


// function main() {
//     var mesh, renderer, scene, camera, manager, transformControl, controls, controlsDrag;
//     const objects = [];
//     let enableSelection = true, group;
//     const API = {
//         color: 0xffffff, // sRGB
//         exposure: 1.0
//     };
//    // init();
//    // animate(1, 1);
//     // animate(5 ,2)
//     // animate(-5 ,-1)
//     function init() {
//         renderer = new THREE.WebGLRenderer({ antialias: true });
//         renderer.setPixelRatio(window.devicePixelRatio);
//         renderer.setSize(boxWidth, boxHeight);
//         container.appendChild(renderer.domElement);
//         // tone mapping
//         renderer.toneMapping = THREE.ACESFilmicToneMapping;
//         renderer.toneMappingExposure = API.exposure;

//         renderer.outputEncoding = THREE.sRGBEncoding;

//         // scene
//         scene = new THREE.Scene();
//         scene.background = new THREE.Color('#f0f0f0');
//         // camera
//         // camera = new THREE.PerspectiveCamera( 45, boxWidth / boxHeight, 0.25, 20 );
//         // camera.position.set( 0,0, boxWidth / boxHeight )
//         camera = new THREE.PerspectiveCamera(50, boxWidth / boxHeight, 0.01, 1000)
//         camera.position.set(0.2, .6, 1);
//         camera.lookAt(new THREE.Vector3());
//         // controls
//         controls = new OrbitControls(camera, renderer.domElement);
//         controls.addEventListener('change', render);
//         controls.enableZoom = true;
//         controls.enablePan = false;
//         controls.enableRotate = true
//         controls.enableDamping = true;


//         scene.add(new THREE.AmbientLight(0xf0f0f0));


//         var helper = new THREE.GridHelper(5, 100);
//         helper.position.y = 0;
//         helper.material.opacity = 0.3;
//         helper.material.transparent = true;
//         scene.add(helper);


//         // manager
//         manager = new THREE.LoadingManager(render);
//         const axesHelper = new THREE.AxesHelper(5);
//         scene.add(axesHelper);

//         render()
//     }


//     function animate(x, y) {

//         new GLTFLoader(manager).load('./assets/models/Cheeseburger.glb', function (gltf) {

//             mesh = gltf.scene.children[0];
//             mesh.position.x = 0;
//             mesh.position.y = 0;
//             scene.add(mesh);
//             objects.push(mesh);
//             render()
//         });

//     }
//     function render() {
//         renderer.render(scene, camera);

//     }

//     // document.querySelector('.btn-export').addEventListener('click', function (event) {
//     //     console.log('clicked')
//     //     exportGLTF(scene)
//     // })
//     function saveArrayBuffer(buffer, filename) {

//         save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

//     }
//     function save(blob, filename) {

//         link.href = URL.createObjectURL(blob);
//         link.download = filename;
//         link.click();

//         // URL.revokeObjectURL( url ); breaks Firefox...

//     }
//     function saveString(text, filename) {

//         save(new Blob([text], { type: 'text/plain' }), filename);

//     }

//     function exportGLTF(input) {

//         const gltfExporter = new GLTFExporter();

//         const options = {
//             trs: true,
//             onlyVisible: true,
//             truncateDrawRange: true,
//             binary: true,
//             maxTextureSize: 4096 //|| Infinity // To prevent NaN value
//         };
//         gltfExporter.parse(input, function (result) {

//             if (result instanceof ArrayBuffer) {

//                 saveArrayBuffer(result, 'scene.glb');

//             } else {

//                 const output = JSON.stringify(result, null, 2);
//                 console.log(output);
//                 saveString(output, 'scene.gltf');

//             }

//         }, options);

//     }

//     function onWindowResize() {

//         camera.aspect = boxWidth / boxHeight;
//         camera.updateProjectionMatrix();

//         renderer.setSize(boxWidth, boxWidth);

//         render();

//     }


// }

// //main();
