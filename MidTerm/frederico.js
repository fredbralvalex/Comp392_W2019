/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />

//author: Frederico Alexandre March 15, 2019
//filename: frederico.js

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);

const brown_color = 0x570505;
const golden_color = 0xb18c14;
const green_color = 0x008c08;
const silver_color = 0x4c777a;
const pink_color = 0xff00a5;

let orbitControls, length = 20,
    speed = 0.01,
    wspeed = 0.01,
    toRotate = false,
    rotate = false;

var spotLight;

var enableSpotLight = true;
var armColor =  golden_color;
var armVisibility =  true;
var bodyColor =  pink_color;
var bodyVisibility =  true;
var rotationSpeed = 1;
var armlength = 4;
var numberArms = 6;
var bodyLength = 3;

//folder Hovercraft

var outerRadius = 6;
var innerRadius = 5.5;
var rimWidth = 0.5;
var axleRadius = 0.5;
var spokeLenght = 8;

var spokeRadius = 0.5;
var axleLength = 1;

var hovercraft;
this.angle = 0;
var actualRotation;
var gui;

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

    //ambient
    scene.add(new THREE.AmbientLight(0x666666));

    //directional
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

    //Hemisfere light
    let hemiSphereLight = new THREE.HemisphereLight(0x7777cc, 0x00ff00, 0.6);//skycolor, groundcolor, intensity  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);

    //spotlight
    spotLight = new THREE.SpotLight(0xffffff);    
    spotLight.position.x = -10;
    spotLight.position.y = 40;
    spotLight.position.z = 0;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 500;
    spotLight.shadow.camera.fov = 10;
    scene.add(spotLight);
}

function createGeometry() {
    
    //axis helper
    scene.add(new THREE.AxesHelper(50));

    //plane
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
        );
    plane.receiveShadow = true;
    plane.rotation.x += -Math.PI * 0.5;
    scene.add(plane);
    
}

function createMaterials() {
    if (hovercraft !== undefined){
        scene.remove(hovercraft.object);
    }
    hovercraft = createHovercraft(axleLength, axleRadius, numberArms, spokeLenght, armColor, bodyColor, bodyLength);    
    hovercraft.object.position.y = hovercraft.radius + 1;
    hovercraft.object.position.x = 0;
    if (actualRotation !== undefined){
        hovercraft.rotateObject(actualRotation);
    }
    if (gui !== undefined) {
        // Iterate over all controllers
        for (var i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
    }

    scene.add(hovercraft.object);
}

function createHovercraft(axle_length, axleRadius, numberSpokes, spoke_length, arm_color, bodycolor, bodyLength) {
    return new function () {
        this.object = new THREE.Object3D();
                
        var axis = createAxis(axle_length + 2, axleRadius, brown_color);
        this.object.add(axis.mesh);

        var propellers = createPropellers(axle_length, numberSpokes, spoke_length, arm_color);
        if (armVisibility) {
            this.object.add(propellers.object);
        }
        propellers.object.rotation.z += 0.5 * Math.PI;

        if (bodyVisibility) {
            var body = createBody(bodyLength, bodycolor);
        }
        //this.object.add(body.object);

        this.radius = propellers.radius;
        this.width = axle_length;
        this.rotateObject =  function (speed) {
            this.object.rotation.y += speed
            actualRotation = hovercraft.object.rotation.y;
        };
    };
}

function createBody(bodyLength, bodycolor) {
    return new function () {
        let body = new THREE.SphereGeometry(bodyLength, 20, 32);
        let materialSphere = new THREE.MeshStandardMaterial({ color: bodycolor });
        let sphere = new THREE.Mesh(body, materialSphere);
        sphere.position.x = 0;
        sphere.position.y = 5;
        sphere.position.z = 0;
        sphere.castShadow = true;
        sphere.receiveShadow = false;
        scene.add(sphere);
        this.mesh = sphere;
    };
}

function createPropellers(axle_length, numberSpokes, spoke_length, arm_color) {
    return new function () {

        var position1 = 0 - (axle_length/2); 
        this.object = new THREE.Object3D();

        for (let i = 0; i < numberSpokes; i++) {
            var radius_1 = createArm(spoke_length, arm_color);
            radius_1.mesh.rotation.x += 2 * Math.PI * i /numberSpokes;
            radius_1.mesh.geometry.translate(position1, spoke_length/2, 0);
            
            this.object.add(radius_1.mesh);
        }
        
        this.radius = spoke_length;
        this.width = axle_length;
    };
}

function createArm(length, pColor) {
    return new function () {    
        var spokeGeometry = new THREE.BoxGeometry(0.2, length, 4);
        var spoke = new THREE.Mesh(
            spokeGeometry,
            new THREE.MeshLambertMaterial({ color: pColor })
            );
        spoke.rotation.y = -Math.PI * 0.95;
        spoke.castShadow = true;
        spoke.receiveShadow = true;
        this.mesh =spoke;
    };
}

function createAxis(length, radius, pColor) {
    return new function () {            
        var spokeGeometry = new THREE.CylinderGeometry(radius, radius, length, 24);
        var spoke = new THREE.Mesh(
            spokeGeometry,
            new THREE.MeshLambertMaterial({ color: pColor })
            );
        spoke.castShadow = true;
        spoke.receiveShadow = true;
        this.mesh =spoke;
    };
}

function rad(deg) { return Math.PI * deg / 180;}

function setupDatGui() {

    let controls = new function () {

        this.rotateScene = toRotate;
        this.rotate = rotate;      
        this.enableSpot = enableSpotLight; 
        this.armColor = armColor;
        this.bodyColor = bodyColor;

        this.bodyVisibility = bodyVisibility;
        this.armVisibility = armVisibility;

        this.armLenght = armlength;
        this.armn = numberArms;
        this.create = function() { 
            createMaterials();
        };
    }

    gui = new dat.GUI();
    gui.add(controls, 'rotateScene').name('Scene revolution').onChange((e) => toRotate = e);
    gui.add(controls, 'enableSpot').name('Enable SpotLight').onChange((e) => spotLight.visible = e);
    gui.addColor(controls, "armColor").onChange((c) => {
        armColor = new THREE.Color(c);
    });
    gui.add(controls, 'armVisibility').name('armVisibility').onChange((e) => armVisibility = e);
    gui.addColor(controls, "bodyColor").onChange((c) => {
        bodyColor = new THREE.Color(c);
    });
    gui.add(controls, 'bodyVisibility').name('bodyVisibility').onChange((e) => bodyVisibility = e);
    gui.add(controls, 'rotate').name('Rotate').onChange((e) => rotate = e);



    var f1 = gui.addFolder('HoverCraft');
    f1.add(controls, "armLenght", 1, 10).step(0.2).name('Arm Length').onChange((c) => {
        spokeLenght = c;
        if (spokeLenght > outerRadius) {
        } else {
            this.spokeLenght = spokeLenght;
        }
    });
    f1.add(controls, "armn", 0, 24).step(1).name('Number of Arms').onChange((c) => {
        numberArms = c;
    });
    
    gui.add(controls, 'create').name('Create');
 
}

function render() {

    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene  
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    if (rotate){
        hovercraft.rotateObject(speed);
    }
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    createMaterials();
    setupDatGui();
    render();

}
