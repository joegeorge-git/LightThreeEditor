import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
import { TransformControls } from './TransformControls.js';
import { GLTFExporter } from './GLTFExporter.js';



var container = document.querySelector('.scene-container');

var boxWidth =  container.offsetWidth
var boxHeight = container.offsetHeight
const link = document.createElement( 'a' );
			link.style.display = 'none';
			document.body.appendChild( link );

            
function main() {
    let mesh, renderer, scene, camera ,  manager ,transformControl;
    const API = {
        color: 0xffffff, // sRGB
        exposure: 1.0
    };
    init();
	animate(1 ,1);
    animate(5 ,2)
    animate(-5 ,-1)
	function init() {
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( boxWidth, boxHeight );
        container.appendChild( renderer.domElement );
        // tone mapping
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = API.exposure;

        renderer.outputEncoding = THREE.sRGBEncoding;

        // scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#f0f0f0');
        // camera
        camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.set( 0, 0, 13 );

        // controls
        const controls = new OrbitControls( camera, renderer.domElement );
        controls.addEventListener( 'change', render );
        controls.enableZoom = true;
        controls.enablePan = true;
        scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );

        var planeGeometry = new THREE.PlaneGeometry( boxWidth, boxHeight );
        planeGeometry.rotateX( - Math.PI / 2 );
        var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.9 } );

        var plane = new THREE.Mesh( planeGeometry, planeMaterial );
        plane.position.y = - 10;
        plane.receiveShadow = true;
        scene.add( plane );

        var helper = new THREE.GridHelper( 200, 100 );
        helper.position.y = - 10;
        helper.material.opacity = 0.8;
        helper.material.transparent = true;
        scene.add( helper );

        transformControl = new TransformControls( camera, renderer.domElement );
		transformControl.addEventListener( 'change', render );
		transformControl.addEventListener( 'dragging-changed', function ( event ) {
            controls.enabled = ! event.value;
		} );
		scene.add( transformControl );
        // manager
        manager = new THREE.LoadingManager( render );
	}
   

	function animate(x, y ) {
        
        new GLTFLoader( manager ).load( './assets/models/flamingo.glb', function ( gltf ) {

            mesh = gltf.scene.children[ 0 ];
            mesh.position.x = x;
            mesh.position.y = y;
            scene.add( mesh );

        } );

	}
    function render() {

        renderer.render( scene, camera );

    }

    document.querySelector('.btn-export').addEventListener('click', function (event) {
        console.log('clicked')
        exportGLTF(scene)
    })
    function saveArrayBuffer( buffer, filename ) {

        save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

    }
    function save( blob, filename ) {

        link.href = URL.createObjectURL( blob );
        link.download = filename;
        link.click();

        // URL.revokeObjectURL( url ); breaks Firefox...

    }
    function saveString( text, filename ) {

        save( new Blob( [ text ], { type: 'text/plain' } ), filename );

    }

    function exportGLTF( input ) {

        const gltfExporter = new GLTFExporter();

        const options = {
            trs: true,
            onlyVisible: true,
            truncateDrawRange: true,
            binary: true,
            maxTextureSize: 4096 //|| Infinity // To prevent NaN value
        };
        gltfExporter.parse( input, function ( result ) {

            if ( result instanceof ArrayBuffer ) {

                saveArrayBuffer( result, 'scene.glb' );

            } else {

                const output = JSON.stringify( result, null, 2 );
                console.log( output );
                saveString( output, 'scene.gltf' );

            }

        }, options );

    }
}

main();
