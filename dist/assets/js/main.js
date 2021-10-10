import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';
import { GLTFExporter } from './GLTFExporter.js';

import { TransformControls } from './TransformControls.js';
import { DragControls } from './DragControls.js';

var cameraPersp, cameraOrtho, currentCamera, manager, controls // manager, controls,group , orbit , control;
let scene, renderer, control, orbit;

class LightThreeEditor {
    renderer;
    mouse;
    raycaster;
    objects = [];
    objectsNames = [];
    group = ''
    exposure = 1.0;
    container = ''
    assetLoadUrl = ''
    aspect;
    editorBackground = '#fff'
    listContainer = ".item-list"
    sceneLayersContainer = ".scene-layers"
    viewerData = {};
    constructor(options) {
        console.log(options.listContainer)
        this.container = document.querySelector(options.container);
        this.boxWidth = this.container.offsetWidth;
        this.boxHeight = this.container.offsetHeight;
        this.listContainer = options.listContainer;
        this.editorBackground = options.editorBackground
        this.loadAssetsToDom(options.list)
        this.toolbarHandler(options.toolbarContainer)
        this.init();

    }
    async asyncForEach(array, callback) { for (let index = 0; index < array.length; index++) { await callback(array[index], index, array) } }
    init() {
        this.loadRenderer()
        // scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(this.editorBackground);
        this.aspect = this.boxWidth / this.boxHeight;
        this.loadCam()

        // controls = new OrbitControls(currentCamera, renderer.domElement);
        // controls.addEventListener('change', this.viewRender);
        // controls.enableZoom = true;
        // controls.enablePan = false;
        // controls.enableRotate = true
        // controls.enableDamping = true;

        scene.add(new THREE.AmbientLight(0xf0f0f0));

        var helper = new THREE.GridHelper(5, 50);
        helper.position.y = 0;
        helper.material.opacity = 0.3;
        helper.material.transparent = true;
        scene.add(helper);

        manager = new THREE.LoadingManager(this.viewRender);
        const axesHelper = new THREE.AxesHelper(2);
        //scene.add(axesHelper);

        orbit = new OrbitControls(currentCamera, renderer.domElement);
        orbit.update();

        orbit.addEventListener('change', this.viewRender);

        control = new TransformControls(currentCamera, renderer.domElement);
        control.addEventListener('change', this.viewRender);

        control.addEventListener('dragging-changed', function (event) {
            orbit.enabled = !event.value;
        });

        this.enableHotkeys()
        this.viewRender()
        this.itemsLoaderScreen(false)
        // document.querySelector('.btn-export').addEventListener('click', function (event) {
        //     console.log('clicked')
        //     self.viewRender()
        //     self.itemsLoaderScreen(true)
        //     self.exportGLTF(scene)
        // })
        this.mouse = new THREE.Vector2(), this.raycaster = new THREE.Raycaster();
        let self = this
        self.container.addEventListener('pointerdown', function (e) { self.onPointerDown(e, self) });
    }
    toolbarHandler(toolbarContainer) {
        if (!toolbarContainer) toolbarContainer = '.toolbar'
        var toolbar = document.querySelector(toolbarContainer);
        var self = this;
        toolbar.addEventListener('click', function (e) {
            var tools = document.querySelectorAll(toolbarContainer + ' .active')
            var action = e.target.dataset['action']
            if (action != "drower-files-toggle") {
                tools.forEach(el => { el.classList.remove('active') });
            }

            if (action == "drower-files-toggle") {
                document.querySelector(self.listContainer).classList.add("show");
            }
            else if (action == 'move') {
                e.target.parentNode.classList.add("active")
                control.setMode('translate');
            }
            else if (action == 'rotate') {
                e.target.parentNode.classList.add("active")
                control.setMode('rotate');
            }
            else if (action == 'resize') {
                e.target.parentNode.classList.add("active")
                control.setMode('scale');
            }
            else if (action == "scene-layers") {
                e.target.parentNode.classList.add("active")
                document.querySelector(self.sceneLayersContainer).classList.toggle("show");
            }
            else if (action == "saveScene") {
                self.viewerData.objectList = []
                self.objectsNames.forEach((el, idx) => {
                    var item = scene.children.find(function (item) { if (item.uuid == el.uuid) return true })
                    self.viewerData.objectList[idx] = el;
                    self.viewerData.objectList[idx].info = {
                        position: item.position,
                        rotation: item.rotation,
                        scale: item.scale
                    }
                });
                console.log(currentCamera);
                self.viewerData.camera = {
                    position: currentCamera.position,
                    rotation: currentCamera.rotation,
                    scale: currentCamera.scale
                }
                localStorage.setItem("savedScene", JSON.stringify(self.viewerData));
            }
        })
        window.onclick = function (event) {
            if (!event.target.dataset['action']) {
                var filedrower = document.querySelector(self.listContainer);
                if (filedrower.classList.contains('show')) filedrower.classList.remove('show')
            }
        }

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

        cameraPersp = new THREE.PerspectiveCamera(50, this.aspect, 0.01, 1000);
        cameraOrtho = new THREE.OrthographicCamera(- 600 * this.aspect, 600 * this.aspect, 600, - 600, 0.01, 30000);
        currentCamera = cameraPersp;
        currentCamera.position.set(0, 1.5, 3);
        currentCamera.lookAt(0, 300, 0);
    }

    loadAssetsToDom(list, title = "Click item to Select") {
        var listElement = document.querySelector(this.listContainer)
        var temp = "<h4>" + title + "</h4>"
        list.forEach((element, index) => {
            temp += `<div class="col"> <div class="item"  style="background: url(${encodeURI(element.thumb)});" data-asset-item=true data-index="${index}" data-asset-url="${encodeURI(element.file)}">
            <span>${element.name} </span>
         </div></div>`
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
            self.objectsNames.push({ name: "Object3D-Layer-" + (self.objectsNames.length + 1), url: url, uuid: mesh.uuid })
            control.attach(mesh);
            scene.add(control);
            self.listUpdate()
            self.itemsLoaderScreen(false)
        });
    }
    listUpdate() {
        // this.objectsNames = [{ name: "Object3D-Layer-1"},{ name: "Object3D-Layer-2"},{ name: "Object3D-Layer-3"}]
        if (!this.objectsNames.length) return 0;
        var dom1 = document.createElement('ul');
        this.objectsNames.forEach((el, idx) => {
            var li = document.createElement('li');
            li.innerText = el.name
            li.dataset.idx = idx
            dom1.appendChild(li);
        });
        var self = this;
        if (document.querySelector(this.sceneLayersContainer + ' ul')) document.querySelector(this.sceneLayersContainer + ' ul').remove();
        document.querySelector(this.sceneLayersContainer).appendChild(dom1);
        document.querySelector(this.sceneLayersContainer + ' ul').addEventListener('click', function (e) {
            document.querySelectorAll(self.sceneLayersContainer + ' ul li').forEach(el => { el.classList.remove('active') });
            if (e.target.dataset.idx) {
                e.target.classList.add("active")
                control.attach(self.objects[e.target.dataset.idx]);
                console.log(self.objects[e.target.dataset.idx])
                scene.add(control)
                self.viewRender()
            }
        })
    }
    enableHotkeys() {
        window.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case 81: // Q
                    control.setSpace(control.space === 'local' ? 'world' : 'local');
                    break;
                case 16: // Shift
                    control.setTranslationSnap(100);
                    control.setRotationSnap(THREE.MathUtils.degToRad(15));
                    control.setScaleSnap(0.25);
                    break;

                case 87: // W
                    control.setMode('translate');
                    break;

                case 69: // E
                    control.setMode('rotate');
                    break;

                case 82: // R
                    control.setMode('scale');
                    break;

                case 67: // C
                    const position = currentCamera.position.clone();
                    currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                    currentCamera.position.copy(position);
                    orbit.object = currentCamera;
                    control.camera = currentCamera;
                    currentCamera.lookAt(orbit.target.x, orbit.target.y, orbit.target.z);
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
                    control.setSize(control.size + 0.1);
                    break;

                case 189:
                case 109: // -, _, num-
                    control.setSize(Math.max(control.size - 0.1, 0.1));
                    break;

                case 88: // X
                    control.showX = !control.showX;
                    break;

                case 89: // Y
                    control.showY = !control.showY;
                    break;

                case 90: // Z
                    control.showZ = !control.showZ;
                    break;

                case 32: // Spacebar
                    control.enabled = !control.enabled;
                    break;

            }

        });

        window.addEventListener('keyup', function (event) {

            switch (event.keyCode) {

                case 16: // Shift
                    control.setTranslationSnap(null);
                    control.setRotationSnap(null);
                    control.setScaleSnap(null);
                    break;

            }

        });
    }
    viewRender() {
        renderer.render(scene, currentCamera);
    }
    itemsLoaderScreen(stat) {
        var loader = document.querySelector('.loader')
        if (stat) loader.hidden = false
        else loader.hidden = true
    }
    onPointerDown(event, self) {
        self.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        self.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        self.raycaster.setFromCamera(self.mouse, currentCamera);
        const intersections = self.raycaster.intersectObjects(self.objects, true);
        if (intersections.length > 0) {
            var object = intersections[0].object;
            control.attach(object);
            scene.add(control)
            self.viewRender()
        }
        else{
            control.detach()
            self.viewRender()
        }
    }
    async loadSavedScene(Sceneinfo) {
        if (!Sceneinfo) return false
        let self = this;
        self.itemsLoaderScreen(true)
        await self.asyncForEach(Sceneinfo.objectList,async function(el,index){
            var gltf= await loadModel(el.url);
            var mesh = gltf.scene.children[0];
            Object.assign(mesh.position, { x: el.info.position.x, y: el.info.position.y, z: el.info.position.z })
            Object.assign(mesh.scale, { x: el.info.scale.x, y: el.info.scale.y, z: el.info.scale.z })
            scene.add(mesh);
            self.objects.push(mesh);
            self.objectsNames.push({ name: "Object3D-Layer-" + (self.objectsNames.length + 1), url: el.url, uuid: mesh.uuid })
            Object.assign( mesh.rotation, { x: el.info.rotation._x, y: el.info.rotation._y, z: el.info.rotation._z,order:el.info.rotation._order })

            if(index == (Sceneinfo.objectList.length-1)){
                self.listUpdate()
               // currentCamera.position.set(Sceneinfo.camera.position.x , Sceneinfo.camera.position.y ,Sceneinfo.camera.position.z)
                Object.assign(currentCamera.position, { x: Sceneinfo.camera.position.x, y: Sceneinfo.camera.position.y, z: Sceneinfo.camera.position.z })
                Object.assign(currentCamera.scale, { x: Sceneinfo.camera.scale.x, y: Sceneinfo.camera.scale.y, z: Sceneinfo.camera.scale.z })
                Object.assign( currentCamera.rotation, { x:Sceneinfo.camera.rotation._x, y: Sceneinfo.camera.rotation._y, z: Sceneinfo.camera.rotation._z,order:Sceneinfo.camera.rotation._order })
                 //set(Sceneinfo.camera.x, Sceneinfo.camera.y, Sceneinfo.camera.z);
                 console.log(scene)
                control.attach(mesh);
                control.detach()
                scene.add(control);            
            }
        })
        self.itemsLoaderScreen(false)  
        function loadModel(url) { return new Promise(resolve => { new GLTFLoader(manager).load(url, resolve);})}
    }
    exportGLTF(input) {
        var gltfExporter = new GLTFExporter();
        var options = {
            trs: true,
            onlyVisible: true,
            truncateDrawRange: true,
            binary: true,
            maxTextureSize: 4096 //|| Infinity // To prevent NaN value
        };
        var self = this
        gltfExporter.parse(input, function (result) {
            self.itemsLoaderScreen(false)
            if (result instanceof ArrayBuffer) {
                saveArrayBuffer(result, 'scene.glb');
            } else {
                const output = JSON.stringify(result, null, 2);
                console.log(output);

                saveString(output, 'scene.gltf');
            }
        }, options);

    }
}

const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function saveArrayBuffer(buffer, filename) {

    save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

}
function save(blob, filename) {

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}
function saveString(text, filename) {

    save(new Blob([text], { type: 'text/plain' }), filename);

}
export { LightThreeEditor }
