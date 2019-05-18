/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/trackballcontrols.js" />

//author: Frederico Alexandre Feb 5, 2019
//filename: 04-lab-bouncing-balls.js

//declare recurrent global variables
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 200);
const clock = new THREE.Clock();

var directionalLight, directionalColor = 0xeeffee,
    hemiSphereLight, hemiSkyColor = 0xcccccc, hemiGroundColor = 0x00ff00,
    balls = [],
    plane,
    trackballControls,
    speed = 0.001;

function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x226622);
    renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;// default THREE.PCFShadowMap  
    document.body.appendChild(renderer.domElement);
    trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
}

function setupCameraAndLight() {
    camera.position.set(-100, 50, 40);
    camera.lookAt(scene.position);

    scene.add(new THREE.AmbientLight(0x333333));

    directionalLight = new THREE.DirectionalLight(directionalColor);
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

    hemiSphereLight = new THREE.HemisphereLight(hemiSkyColor, hemiGroundColor, 0.6);//skycolor, groundcolor, intensity  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);
}

function createGeometry() {

    //scene.add(new THREE.AxesHelper(100));
    //let planeMaterial = new THREE.MeshStandardMaterial({color: 0xeeeeee});
    let planeMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    let planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    scene.add(plane);

    var i = 0;
    let size = new THREE.Vector2(40, 30);
    for (var i = 0; i < 20; i++)
    {
        let color = randomColor( 200, 255 );
        let obj = createBall(size, color);
        scene.add(obj.mesh);
        balls.push(obj);
    }
}
function randomColor(lower, upper) {
    let r = Math.random() * (upper - lower) + lower;
    let g = Math.random() * (upper - lower) + lower;
    let b = Math.random() * (upper - lower) + lower;
    return Math.round((((r * 255) + g) * 255) + b);    
}

function createBall(
        size,//a vector2
        bColor) {//a hexnumber
    
    let MAX_HEIGTH = 30;
    let RADIUS = 1.7;
    //an object with its own color, x, angle (to calculate height), z
    return new function () {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(RADIUS, 12, 12),
            new THREE.MeshStandardMaterial({color: bColor})
        );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        let x = (0.5 - Math.random()) * size.x;
        let z = (0.5 - Math.random()) * size.y;
        this.maxHeight = MAX_HEIGTH * 0.5 + Math.random() * MAX_HEIGTH * 0.5;
        this.angle = Math.random() * Math.PI;
        let y = this.maxHeight * Math.abs(Math.sin(this.angle));
        this.mesh.position.set(x, y, z);
        this.update = function(delta) {
            this.angle += delta;
            this.mesh.position.y = this.maxHeight * Math.abs(Math.sin(this.angle * this.maxHeight));
        };
    };
}

function setupDatGui() {
    let controls = new function () {
        this.guiSpeed = speed;
    }

    let gui = new dat.GUI();    
    gui.add(controls, 'guiSpeed', 0, 0.005).name('Ball speed').onChange((s) => speed = s);

}

function render() {
    trackballControls.update(clock.getDelta());
    //scene.rotation.y += 0.01;//rotates the scene  
    balls.forEach((obj) => obj.update(speed));
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
