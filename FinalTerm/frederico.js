/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />
/// <reference path="./libs/physi.js" />
//author: Frederico Alexandre Abril 16, 2019

Physijs.scripts.worker = './libs/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new Physijs.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
const clock = new THREE.Clock();

var __shader = Shaders.LabShader1;
var __shader2 = Shaders.LabShader2;
var __shader3 = Shaders.LabShader3;

var sphere, sphere1, sphere2, sphere3;
var cube, cube1, cube2, cube3, cube4, cube6;

var material, material2, material3;

var orbitControls, controls,
    speed = 0.01,
    toRotate = false;

var objects = [];
function init() {

    var urls = [ 'right.png', 'left.png', 'top.png', 'bottom.png', 'front.png', 'back.png' ];
    var loader = new THREE.CubeTextureLoader().setPath( 'assets/textures/cubemap/car/' );
    loader.load( urls, function ( texture ) {

        var pmremGenerator = new THREE.PMREMGenerator( texture );
        pmremGenerator.update( renderer );

        var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
        pmremCubeUVPacker.update( renderer );

        var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
        // model
        //elf.material.envMap = envMap;        

        pmremGenerator.dispose();
        pmremCubeUVPacker.dispose();

        scene.background = texture;

    } );

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

}

function setupCameraAndLight() {
    camera.position.set(-20, 10, 20);
    camera.lookAt(scene.position);

    scene.add(new THREE.AmbientLight(0x666666));

    scene.position.set(0, -10, 0);

    let directionalLight = new THREE.DirectionalLight(0xeeeeee);
    directionalLight.position.set(20, 60, 10);
    directionalLight.castShadow = true;
    directionalLight.target = scene;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
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

let ground;

function createGeometry() {

    scene.add(new THREE.AxesHelper(100));    
    
    __shader.uniforms.texture.value = new THREE.TextureLoader().load('assets/textures/alpha/partial-transparency.png');
    __shader.uniforms.map.value = new THREE.TextureLoader().load('assets/textures/general/plaster.jpg');
    __shader3.uniforms.texture.value = new THREE.TextureLoader().load('assets/textures/noise-vector.jpg');

    material = new THREE.ShaderMaterial(
    {
        uniforms: __shader.uniforms,
        vertexShader: __shader.vertexShader,
        fragmentShader: __shader.fragmentShader,
        transparent: true
    });

    material2 = new THREE.ShaderMaterial(
    {
        uniforms: __shader2.uniforms,
        vertexShader: __shader2.vertexShader,
        fragmentShader: __shader2.fragmentShader,
        transparent: true
    });

    material3 = new THREE.ShaderMaterial(
    {
        uniforms: __shader3.uniforms,
        vertexShader: __shader3.vertexShader,
        fragmentShader: __shader3.fragmentShader,
        transparent: true
    });
    
    let h = 1;
    var object = new Physijs.BoxMesh(
        new THREE.BoxGeometry(40, 40, h),
        Physijs.createMaterial(material3) , 0
        );

    object.position.y = -h/2;
    object.receiveShadow = true;
    object.rotation.x = -Math.PI * 0.5;
    object.setAngularFactor = THREE.Vector3(0, 0, 0);
    object.setLinearFactor = THREE.Vector3(0, 0, 0);
    scene.add(object);
    ground = object;


    let planeMaterial = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40, 50, 50),
        material
    );
    planeMaterial.receiveShadow = true;
    planeMaterial.position.z = -20;
    planeMaterial.position.y = 20;
    //planeMaterial.rotation.x = -Math.PI * 0.5;
    scene.add(planeMaterial);

    let sphereRadius = 1;
    sphere = new Physijs.SphereMesh(
        new THREE.SphereGeometry(sphereRadius, 32, 50, 50),
        Physijs.createMaterial(material2) , 1
    );
    sphere.castShadow = true;    

    sphere1 = new Physijs.SphereMesh(
        new THREE.SphereGeometry(sphereRadius, 32, 50, 50),
        Physijs.createMaterial(material2) , 1
    );
    sphere1.castShadow = true;    
    
    sphere2 = new Physijs.SphereMesh(
        new THREE.SphereGeometry(sphereRadius, 32, 50, 50),
        Physijs.createMaterial(material2) , 1
        );
        sphere2.castShadow = true;    
        
        
    sphere3 = new Physijs.SphereMesh(
        new THREE.SphereGeometry(sphereRadius, 32, 50, 50),
        Physijs.createMaterial(material2) , 1
        );
        sphere3.castShadow = true;    
        
    sphere.position.set(0, 1, 0);    
    sphere1.position.set(0, 3, 0);
    sphere2.position.set(0, 5, 0);
    sphere3.position.set(0, 7, 0);
    
    
    sphere.__dirtyPosition = false;
    sphere.__dirtyRotation = false;
    
    sphere1.__dirtyPosition = false;
    sphere1.__dirtyRotation = false;
    
    sphere2.__dirtyPosition = false;
    sphere2.__dirtyRotation = false;
    
    sphere3.__dirtyPosition = false;
    sphere3.__dirtyRotation = false;
    
    scene.add(sphere);         
    scene.add(sphere1); 
    scene.add(sphere2); 
    scene.add(sphere3);    

    objects.push(sphere, sphere1, sphere2, sphere3);

    let friction = 0.0; 
    let restitution = 0.0;

    let cube_w = 1;
    let cube_h = 4.0;
    let cube_d = 1.5;
    cube = new Physijs.BoxMesh(
        new THREE.BoxGeometry(cube_w, cube_h, cube_d),
        Physijs.createMaterial(material2, 
            friction,
            restitution) , 1
        );
    cube.castShadow = true;
    cube.receiveShadow = true;

    cube1 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(cube_w, cube_h, cube_d),
        Physijs.createMaterial(material2, 
            friction,
            restitution) , 1
        );
    cube1.castShadow = true;
    cube1.receiveShadow = true;

    cube3 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(cube_w, cube_h, cube_d),
        Physijs.createMaterial(material2, 
            friction,
            restitution) , 1
        );
    cube3.castShadow = true;
    cube3.receiveShadow = true;

    cube2 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(cube_w, cube_h, cube_d),
        Physijs.createMaterial(material2, 
            friction,
            restitution) , 1
        );
    cube2.castShadow = true;
    cube2.receiveShadow = true;

    cube4 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(cube_w, cube_h, cube_d),
        Physijs.createMaterial(material2, 
            friction,
            restitution) , 1
        );
    cube4.castShadow = true;
    cube4.receiveShadow = true;

    cube5 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(cube_w, cube_h, cube_d),
        Physijs.createMaterial(material2, 
            friction,
            restitution), 1
        );
    cube5.castShadow = true;
    cube5.receiveShadow = true;
    
    cube.position.set(-3, cube_h, 6);    
    cube1.position.set(3, cube_h, 6);
    cube2.position.set(-6, cube_h, 1);
    cube3.position.set(6, cube_h, -1);
    cube4.position.set(-3, cube_h, -3);    
    cube5.position.set(6, cube_h, 3);

    scene.add(cube);
    scene.add(cube1);
    scene.add(cube2);
    scene.add(cube3);
    scene.add(cube4);
    scene.add(cube5);

    objects.push(cube, cube1, cube2, cube3, cube4, cube5);
}

function setupDatGui() {

    controls = new function() {

        this.rotate = toRotate;        
    }

    let gui = new dat.GUI();
    gui.add(controls, 'rotate').onChange((e) => toRotate = e);
}

function render() {

    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene
        
    __shader.uniforms.time.value = clock.getElapsedTime()*2;
    __shader2.uniforms.time.value = clock.getElapsedTime()*2;
    //__shader3.uniforms.time.value = clock.getElapsedTime()*2;

    updateDirty ();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    scene.simulate();   

    raycaster.setFromCamera( mouse, camera);
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}


//#region raycast

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
    var intersects = raycaster.intersectObjects(objects);
    for ( var i = 0; i < intersects.length; i++ ) {
        intersects[i].object.material = Physijs.createMaterial(material2, 
            0.9,
            0.9);
        intersects[i].object.setGravity = 5;
        intersects[i].object.needsUpdate = true;
        intersects[i].object.position.x = intersects[ i ].object.position.x + 0.5;
        intersects[i].object.position.y = intersects[ i ].object.position.y + 0.5;
        intersects[i].object.position.z = intersects[ i ].object.position.z + 0.5;
        intersects[i].object.__dirtyPosition = true;
        intersects[i].object.__dirtyRotation = true;
        intersects[i].object.rotation.z = -Math.PI * 0.5;
        console.log("clicked!!");
        break;
    }

    updateDirty ();
}

function updateDirty () {
    objects.forEach(obj => {
        obj.__dirtyPosition = true;
        obj.__dirtyRotation = true;
    });
}
//#endregion
