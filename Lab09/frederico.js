
//author: Frederico Alexandre Abril 8, 2019

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
const clock = new THREE.Clock();

var __shader = Shaders.LabShader3;
var cube, torus;

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
    scene.add(plane);

    let material = new THREE.ShaderMaterial(
    {
        uniforms: __shader.uniforms,
        vertexShader: __shader.vertexShader,
        fragmentShader: __shader.fragmentShader
    });

    cube = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10),
        material
    );
    cube.position.set(-10, 10, 0);
    cube.rotation.set(Math.PI * 0.6, 0, Math.PI * 0.3);
    cube.castShadow = true;    
    scene.add(cube);

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
        this.setShader1 = function () {
            this.updateMaterial(Shaders.LabShader1);
        };
        this.setShader2 = function () {
            this.updateMaterial(Shaders.LabShader2);
        };
        this.setShader3 = function () {
            this.updateMaterial(Shaders.LabShader3);
        };
        this.setShader4 = function () {
            this.updateMaterial(Shaders.LabShader4);
        };

        this.updateMaterial = function(shader) {
            __shader = shader;
            __shader.uniforms.time.value = clock.getElapsedTime()*3;
            let material = new THREE.ShaderMaterial(
                {
                    uniforms: __shader.uniforms,
                    vertexShader: __shader.vertexShader,
                    fragmentShader: __shader.fragmentShader
                });
            cube.material = material;
            torus.material = material;

            cube.needsUpdate = true;
            torus.needsUpdate = true;
        }
    }

    let gui = new dat.GUI();
    gui.add(controls, 'rotate').onChange((e) => toRotate = e);
    gui.add(controls, 'setShader1').name("Shader 01");
    gui.add(controls, 'setShader2').name("Shader 02");
    gui.add(controls, 'setShader3').name("Shader 03");
    gui.add(controls, 'setShader4').name("Shader 04");

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
