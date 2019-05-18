/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />

//author: Frederico Alexandre Feb 15, 2019
//filename: 05-lab-extrude.js

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);

const brown_color = 0x570505;
const golden_color = 0xb18c14;


let orbitControls, length = 20,
    speed = 0.01,
    wspeed = 0.01,
    toRotate = false,
    rotateWheel = false;

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

var wheels = [];
function createGeometry() {

    //scene.add(new THREE.GridHelper(40, 8));
    scene.add(new THREE.AxesHelper(50));
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(plane);

    //resetCylinder();
    let wheel_01 = createWheel();
    wheel_01.object.position.y = wheel_01.radius;
    wheel_01.object.position.x = wheel_01.width*3*2;
    scene.add(wheel_01.object);
    wheels.push(wheel_01);

    let wheel_02 = createWheel();
    wheel_02.object.position.y = wheel_02.radius;
    wheel_02.object.position.x = wheel_02.width*2*2;
    scene.add(wheel_02.object);
    wheels.push(wheel_02);


    let wheel_03 = createWheel();
    wheel_03.object.position.y = wheel_03.radius;
    wheel_03.object.position.x = -wheel_03.width*3*2;
    scene.add(wheel_03.object);
    wheels.push(wheel_03);

    let wheel_04 = createWheel();
    wheel_04.object.position.y = wheel_04.radius;
    wheel_04.object.position.x = -wheel_04.width*2*2;
    scene.add(wheel_04.object);
    wheels.push(wheel_04);
    
}

function createWheel() {
    return new function () {
        this.object = new THREE.Object3D();
        var spoke_length = 5;
        var axis_length = 2;
        var spoke_radius = 0.5;        
        
        var axis_radius = 1;
        
        var axisWheel = createCylinder(axis_length, axis_radius,brown_color);
        axisWheel.mesh.rotation.z += 0.5 * Math.PI;
        this.object.add(axisWheel.mesh);

        for (let i = 0; i < 12; i++) {
            var radius_ = createCylinder(spoke_length, spoke_radius, golden_color);
            radius_.mesh.rotation.x += 2 * Math.PI * i /12;
            radius_.mesh.geometry.translate(0, spoke_length/2, 0);
            this.object.add(radius_.mesh);                
        }

        var shape = new THREE.Shape();

        shape.moveTo(0, 0);
        shape.absellipse(0, 0, 6, 6, 0, 2 * Math.PI, true);

        var hole = new THREE.Path();
        hole.absellipse(0, 0, 5, 5, 0, Math.PI * 2);
        shape.holes.push(hole);     
        
        var extrudeSettings = { 
            bevelEnabled: true, 
            bevelSegments: 3, 
            steps: 0, 
            bevelSize: 0.2, 
            depth: 0, 
            bevelThickness: 1,
            curveSegments: 12 };
        
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings );
        
        var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: brown_color }));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.y += 0.5 * Math.PI;

        this.object.add(mesh);
        this.radius = spoke_length + extrudeSettings.bevelThickness;
        this.width = axis_length;

        this.angle = 0;
        this.rotateObject =  function (speed) {
            this.object.rotation.x += speed
        };
    };

}

function createCylinder(length, radius, pColor) {
    return new function () {    
        var cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, length, 24),
            new THREE.MeshLambertMaterial({ color: pColor })
            );
        //cylinder.position.y = 2;        
        //axisWheel.rotation.z += 0.5*Math.PI;
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        this.mesh =cylinder;
    };

}

function resetCylinder() {
    var length = 2;
    if (cylinder !== undefined){

        scene.remove(cylinder);
        console.log('removing existing mesh');
    }

    cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, length, 24),
        new THREE.MeshLambertMaterial({ color: 0x7777ff })
    );
    //cube.position.set(0, 10, 0);
    cylinder.castShadow = true;
    let arrow_length = 6;
    let x_direction = new THREE.Vector3(1, 0, 0);
    let y_direction = new THREE.Vector3(0, 1, 0);
    let z_direction = new THREE.Vector3(0, 0, 1);
    let orig = new THREE.Vector3(0, length * 0.5, 0);

    let arrow = new THREE.ArrowHelper(x_direction, orig, arrow_length, 0xff0000);
    cylinder.add(arrow);
    arrow = new THREE.ArrowHelper(y_direction, orig, arrow_length, 0x00ff00);
    cylinder.add(arrow);
    arrow = new THREE.ArrowHelper(z_direction, orig, arrow_length, 0x0000ff);
    cylinder.add(arrow);
    console.log('adding a new mesh');
    scene.add(cylinder);

}

function rotateCylinder(angle) { cylinder.rotation.z += angle; console.log(`rotating about z-axis ${angle}`);}
function scaleCylinder(x, y, z) { cylinder.geometry.scale(x, y, z); console.log(`scaling ( ${x}, ${y}, ${z}`);}
function translateCylinder(x, y, z) { cylinder.geometry.translate(x, y, z); console.log(`translating ( ${x}, ${y}, ${z}`);}
//function rotateCube(angle) { cube.rotation.set(.z = angle; }

function rad(deg) { return Math.PI * deg / 180;}

function setupDatGui() {

    let controls = new function () {

        this.rotateScene = toRotate;
        this.rotateWheel = rotateWheel;

    }

    let gui = new dat.GUI();
    gui.add(controls, 'rotateScene').name('Scene revolution').onChange((e) => toRotate = e);
    gui.add(controls, 'rotateWheel').name('Rotate Wheels').onChange((e) => rotateWheel = e);


    
}

function render() {

    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene  
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    if (rotateWheel)
        wheels.forEach((wheel) => wheel.rotateObject(speed));
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}
