import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';
import { GLTFExporter } from './GLTFExporter.js';

import { TransformControls } from './TransformControls.js';
import { DragControls } from './DragControls.js';

var renderer, scene, camera, manager, controls,group , orbit , control;
const mouse = new THREE.Vector2(),
raycaster = new THREE.Raycaster();
let enableSelection = false;

class LightThreeEditor {
    renderer;
    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    objects = [];
    exposure = 1.0;
    container = ''
    assetLoadUrl = ''
    constructor(options) {
        this.container = document.querySelector(options.container);
        this.boxWidth = this.container.offsetWidth;
        this.boxHeight = this.container.offsetHeight;
        this.init()
        this.loadAssetsToDom(options.list, options.listContainer)
    }

    init() {
        this.loadRenderer()
        // scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#f0f0f0');

        this.loadCam()

        controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', this.viewRender);
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.enableRotate = true
        controls.enableDamping = true;

        scene.add(new THREE.AmbientLight(0xf0f0f0));

        var helper = new THREE.GridHelper(5, 100);
        helper.position.y = 0;
        helper.material.opacity = 0.3;
        helper.material.transparent = true;
        scene.add(helper);

        manager = new THREE.LoadingManager(this.viewRender);
        const axesHelper = new THREE.AxesHelper(2);
        scene.add(axesHelper);
        
        group = new THREE.Group();
		scene.add( group );

        orbit = new OrbitControls( camera, renderer.domElement );
        orbit.update();
        orbit.addEventListener( 'change', this.viewRender );

        control = new TransformControls( camera, renderer.domElement );
        control.addEventListener( 'change', this.viewRender );

        control.addEventListener( 'dragging-changed', function ( event ) {
            orbit.enabled = ! event.value;
        } );

        this.enableHotkeys()
        this.viewRender()
        this.itemsLoaderScreen(false)
    }
    loadRenderer() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.boxWidth, this.boxHeight);
        this.container.appendChild(renderer.domElement);
        // tone mapping
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = this.exposure;
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    loadCam() {
        camera = new THREE.PerspectiveCamera(50, this.boxWidth / this.boxHeight, 0.01, 1000)
        camera.position.set(0, 1.5, 3);
        camera.lookAt(new THREE.Vector3());
    }

    loadAssetsToDom(list, domElement) {
        var listElement = document.querySelector(domElement)
        var temp = ""
        list.forEach((element, index) => {
            temp += `<div class="item"  style="background: url(${encodeURI(element.thumb)});" data-asset-item=true data-index="${index}" data-asset-url="${encodeURI(element.file)}">
            <span>${element.name} </span>
         </div>`
        });
        listElement.innerHTML = temp
        let self = this
        listElement.addEventListener('click', function (event) {
            if (event.target.dataset.assetItem) {
                self.assetLoadUrl = event.target.dataset['assetUrl']
                self.sceneGlFloader(event.target.dataset['assetUrl'])
            }
        })
    }
    sceneGlFloader(url) {
        let self = this
        self.itemsLoaderScreen(true)
        new GLTFLoader(manager).load(url, function (gltf) {
           var mesh = gltf.scene.children[0];
            mesh.position.x = 0;
            mesh.position.y = 0;
            scene.add(mesh);
            self.objects.push(mesh);
            
            console.log('loaded')
           
            control.attach( mesh );
            scene.add( control );
           
            self.itemsLoaderScreen(false)
        });
    }
    enableHotkeys(){
        window.addEventListener( 'keydown', function ( event ) {

            switch ( event.keyCode ) {

                case 81: // Q
                    control.setSpace( control.space === 'local' ? 'world' : 'local' );
                    break;

                case 16: // Shift
                    control.setTranslationSnap( 100 );
                    control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
                    control.setScaleSnap( 0.25 );
                    break;

                case 87: // W
                    control.setMode( 'translate' );
                    break;

                case 69: // E
                    control.setMode( 'rotate' );
                    break;

                case 82: // R
                    control.setMode( 'scale' );
                    break;

                case 67: // C
                    const position = currentCamera.position.clone();

                    currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                    currentCamera.position.copy( position );

                    orbit.object = currentCamera;
                    control.camera = currentCamera;

                    currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
                    onWindowResize();
                    break;

                case 86: // V
                    const randomFoV = Math.random() + 0.1;
                    const randomZoom = Math.random() + 0.1;

                    cameraPersp.fov = randomFoV * 160;
                    cameraOrtho.bottom = - randomFoV * 500;
                    cameraOrtho.top = randomFoV * 500;

                    cameraPersp.zoom = randomZoom * 5;
                    cameraOrtho.zoom = randomZoom * 5;
                    onWindowResize();
                    break;

                case 187:
                case 107: // +, =, num+
                    control.setSize( control.size + 0.1 );
                    break;

                case 189:
                case 109: // -, _, num-
                    control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                    break;

                case 88: // X
                    control.showX = ! control.showX;
                    break;

                case 89: // Y
                    control.showY = ! control.showY;
                    break;

                case 90: // Z
                    control.showZ = ! control.showZ;
                    break;

                case 32: // Spacebar
                    control.enabled = ! control.enabled;
                    break;

            }

        } );

        window.addEventListener( 'keyup', function ( event ) {

            switch ( event.keyCode ) {

                case 16: // Shift
                    control.setTranslationSnap( null );
                    control.setRotationSnap( null );
                    control.setScaleSnap( null );
                    break;

            }

        } );
    }
    viewRender() {
        renderer.render(scene, camera);
    }
    itemsLoaderScreen(stat){
    var loader = document.querySelector('.loader')
       if(stat) loader.hidden=false
       else loader.hidden=true
    }

}
export { LightThreeEditor }
