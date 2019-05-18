
//author: Frederico Alexandre Abril 8, 2019

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
const clock = new THREE.Clock();

var __shader = Shaders.LabShader1;
var sphere, torus;

var orbitControls, controls,
    speed = 0.01,
    toRotate = false;

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

}

function setupCameraAndLight() {
    camera.position.set(-30, 10, 30);
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

function createGeometry() {

    scene.add(new THREE.AxesHelper(100));
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 60),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );

    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI * 0.5;
    //scene.add(plane);
    
    __shader.uniforms.texture.value = new THREE.TextureLoader().load('assets/texture/noise-vector.jpg');

    let material = new THREE.ShaderMaterial(
    {
        uniforms: __shader.uniforms,
        vertexShader: __shader.vertexShader,
        fragmentShader: __shader.fragmentShader,
        transparent: true
    });


    let planeMaterial = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 60, 50, 50),
        material
    );
    planeMaterial.receiveShadow = true;
    planeMaterial.rotation.x = -Math.PI * 0.5;
    scene.add(planeMaterial);

    sphere = new THREE.Mesh(
        new THREE.SphereGeometry(7, 32, 50, 50),
        material
    );
    sphere.position.set(-10, 10, 0);
    sphere.rotation.set(Math.PI * 0.6, 0, Math.PI * 0.3);
    sphere.castShadow = true;    
    scene.add(sphere);

    torus = new THREE.Mesh(new THREE.TorusKnotGeometry( 5, 2, 100, 16 ), material);
    
    torus.position.set(10, 15, 0);
    torus.castShadow = true;
    torus.receiveShadow = false;
    torus.name = "torus";
    scene.add(torus);

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
