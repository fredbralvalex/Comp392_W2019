/// <reference path="libs/three.min.js" />
/// <reference path="libs/TrackballControls.js" />
/// <reference path="libs/dat.gui.min.js" />
//name: Frederico Alexandre 
//date: January 18, 2019
//file: 02-lab-dat-gui.js

//recurrent constants



//global variables
var scene, camera, renderer, control, trackballcontrols,clock, plane, spotLight;

//function definition
function init() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xaaffaa);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
}

function addCube(control) {
    let geometryBox = new THREE.BoxGeometry(control.size, control.size, control.size);
    let materialBox = new THREE.MeshLambertMaterial({ color: control.color });
    let box = new THREE.Mesh(geometryBox, materialBox);
    box.position.x = control.position_x;
    box.position.y = control.size/2 + 10;
    box.position.z = control.position_z;
    box.castShadow = true;
    box.receiveShadow = false;
    scene.add(box);
}

function addSphere(control) {
    let geometrySphere = new THREE.SphereGeometry(control.size/2, 20, 32);
    let materialSphere = new THREE.MeshLambertMaterial({ color: control.color });
    let sphere = new THREE.Mesh(geometrySphere, materialSphere);
    sphere.position.x = control.position_x;
    sphere.position.y = control.size + 10;
    sphere.position.z = control.position_z;
    sphere.castShadow = true;
    sphere.receiveShadow = false;
    scene.add(sphere);
}

function setupCameraAndLight() {
    camera = new THREE.PerspectiveCamera( 50,
        window.innerWidth / window.innerHeight,
        0.1, 1000
        );
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
        
    camera.lookAt(scene.position);
    trackballcontrols = new THREE.TrackballControls(camera, renderer.domElement);

    let ambient = new THREE.AmbientLight(0x3c3c3c);
    //scene.add(ambient);

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
    let geom  = new THREE.PlaneGeometry(65, 65, 1, 1);
    let mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    plane = new THREE.Mesh(geom, mat);

    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(30, 0, 30);
    plane.castShadow = false;
    plane.receiveShadow = true;
    scene.add(plane);
}


function render() {
    
    trackballcontrols.update(clock.getDelta());
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function createControl() {
    //set up a dat-gui widget
    control = new function () {
        this.position_x = 0;        
        this.position_z = 0;        
        this.showVariables = function() {
            console.log("size: " + this.size);
            console.log("shapes: " + this.shapes);
            console.log("color: " + this.color);
        }
        this.size = 6;
        this.shapes = "cube";
        this.color = "#ffffff";
        this.addGeometry = function() {
            if (this.shapes === 'cube') {
                addCube(this);
            } else if (this.shapes === 'sphere') {
                addSphere(this);
            }
            if (this.position_x + 7 > plane.geometry.parameters.width) {
                this.position_x = 0;
                this.position_z+= 7;
            } else {
                this.position_x+= 7;
            }
        }     
    }
    var gui = new dat.GUI();
    gui.add(control, "showVariables");
    gui.add(control, "size", 2, 6).step(1);
    gui.add(control, "shapes", [ 'cube', 'sphere' ]);
    gui.addColor(control, "color");
    gui.add(control, "addGeometry");
}

//launch
window.onload = () => {
    init();
    setupCameraAndLight();
    createGeometry();
    createControl();

    render();
}