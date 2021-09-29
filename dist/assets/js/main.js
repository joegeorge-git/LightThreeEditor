import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';
import { GLTFExporter } from './GLTFExporter.js';

import { TransformControls } from './TransformControls.js';
import { DragControls } from './DragControls.js';

var renderer, scene, camera, manager, controls;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


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

        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

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
            self.viewRender()
            console.log('loaded')
            self.itemsLoaderScreen(false)
        });
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
