/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />

//author: Frederico Alexandre Mar 08, 2019
//filename: frederico.js

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);

const brown_color = 0x570505;
const golden_color = 0xb18c14;

const cube_size = 4;

let orbitControls, length = 20,
    speed = 0.01,
    wspeed = 0.01,
    toRotate = false,
    rotate = false;

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

}

function setupCameraAndLight() {
    camera.position.set(-50, 20, 20);
    camera.lookAt(scene.position);

    scene.add(new THREE.AmbientLight(0x666666));

    let directionalLight = new THREE.DirectionalLight(0xeeeeee);
    directionalLight.position.set(20, 60, 10);
    directionalLight.castShadow = true;
    directionalLight.target = scene;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    let hemiSphereLight = new THREE.HemisphereLight(0x7777cc, 0x00ff00, 0.6);//skycolor, groundcolor, intensity  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);
}
var planes = [];
function createGeometry() {

    scene.add(new THREE.AxesHelper(50));
    
    var divisions = 10;
    var size = cube_size * divisions;
    var startPoint = 0 - size/2;

    var gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );

    
    for (let i = 0; i < divisions; i++) {
        for (let j = 0; j < divisions; j++) {
            let point_x = startPoint + i*cube_size;
            let point_z = startPoint + j*cube_size;

            var plane = createPlane(cube_size, point_x, point_z, 0);
            scene.add(plane.mesh); 
            plane.i = i;
            plane.j = j;
            planes.push(plane.mesh);
        }       
    }    
}

function createPlane(size, x, z, y) {
    return new function () {
        this.i;
        this.j;
        this.size = size;
        let plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size),
            new THREE.MeshLambertMaterial({color: 0xffffff, alphaTest: 100 })
        );
        
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI * 0.5;
        plane.position.x = x + size/2;
        plane.position.z = z + size/2;
        plane.position.y = y;
        this.mesh = plane
    }
}


function createBox(size) {
    return new function () {
        this.size = size;
        var texture = new THREE.TextureLoader().load( '../assets/textures/square.png' );
        let cubeMaterial = new THREE.MeshStandardMaterial({
            map:texture
        });

        var cube = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            cubeMaterial
            );
        cube.castShadow = true;
        cube.receiveShadow = true;
        this.mesh =cube;
        
    };

}

function setupDatGui() {

    let controls = new function () {
        this.rotateScene = toRotate;

    }

    let gui = new dat.GUI();
    gui.add(controls, 'rotateScene').name('Scene revolution').onChange((e) => toRotate = e);
    
}


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener( 'mousemove', onMouseMove, false );
document.addEventListener( 'mousedown', onMouseDown, false );

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onMouseDown( event ) {
    event.preventDefault();
    
    var intersects = raycaster.intersectObjects(planes);
    for ( var i = 0; i < intersects.length; i++ ) {
        //let plane = intersects[ i ].object;
        intersects[ i ].object.material.color.set( 0xff0000 );
        //console.log(intersects[ i ].object);

        var cube = createBox(cube_size);
        cube.mesh.position.x = intersects[ i ].object.position.x;
        cube.mesh.position.y = intersects[ i ].object.position.y + cube.size/2;//make exact position
        cube.mesh.position.z = intersects[ i ].object.position.z;
        scene.add(cube.mesh);
        //move the plane to the top of the cube
        intersects[ i ].object.position.y = intersects[ i ].object.position.y + cube_size;
        //just one
        break;
    }
}


function render() {

    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene  


    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}
