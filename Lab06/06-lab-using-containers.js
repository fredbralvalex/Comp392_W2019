/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />

//author: Frederico Alexandre Feb 22, 2019
//filename: 06-using-containers.js

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
    rotateFerris = false;

var outerRadius = 6;
var innerRadius = 5.5;
var rimWidth = 0.5;
var axleRadius = 1;
var spokeLenght = 8;
var numberSpokes = 12;

var spokeRadius = 0.5;
var axleLength = 4;

var basketStructureSize = 2;
var basketStructureRadius = 0.5;

var ferris;
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
    
    scene.add(new THREE.AxesHelper(50));
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );
    plane.receiveShadow = true;
    plane.rotation.x += -Math.PI * 0.5;
    scene.add(plane);

    this.resetFerris();
    
}

function resetFerris() {
    if (ferris !== undefined){
        scene.remove(ferris.object);
    }
    ferris = createFerris(axleLength, axleRadius, numberSpokes, spokeLenght, spokeRadius, outerRadius, innerRadius);    
    ferris.object.position.y = ferris.radius + 2;
    ferris.object.position.x = 0;
    if (actualRotation !== undefined){
        //ferris.object.rotation.x = actualRotation;
        ferris.rotateObject(actualRotation);
    }
    if (gui !== undefined) {
        // Iterate over all controllers
        for (var i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
    }

    scene.add(ferris.object);
}

function createFerris(axle_length, axleRadius, numberSpokes, spoke_length, spoke_radius, outer_radius, inner_radius) {
    return new function () {
        this.object = new THREE.Object3D();
        
        var axis_length = axle_length;
        var axis_radius = axleRadius;  
                
        var axisWheel = createAxis(axis_length + 2, axis_radius, brown_color);
        axisWheel.mesh.rotation.z += 0.5 * Math.PI;
        this.object.add(axisWheel.mesh);

        var wheels = createWheels(axis_length, numberSpokes, spoke_length, spoke_radius, outer_radius, inner_radius);
        this.object.add(wheels.object);


        this.radius = wheels.radius;
        this.width = axis_length;
        this.rotateObject =  function (speed) {
            this.object.rotation.x += speed
            actualRotation = ferris.object.rotation.x;
            wheels.rotateObject(speed);
        };
    };
}

function createWheels(axis_length, numberSpokes, spoke_length, spoke_radius, outer_radius, inner_radius) {
    return new function () {

        var position1 = 0 - (axis_length/2); 
        var position2 = axis_length/2;
        this.object = new THREE.Object3D();
        this.baskets = [];
        
        //var axis_length = 5;        
        var axis_size = Math.abs(position1) + Math.abs(position2);
        for (let i = 0; i < numberSpokes; i++) {
            var radius_1 = createSpokes(spoke_length, spoke_radius, golden_color);
            radius_1.mesh.rotation.x += 2 * Math.PI * i /numberSpokes;
            radius_1.mesh.geometry.translate(position1, spoke_length/2, 0);


            var angle = 2 * Math.PI * i /numberSpokes;
            var position = spoke_length;
            var basket = createBasket(axis_size, basketStructureSize, basketStructureRadius, pink_color, silver_color);            
            basket.object.position.y = position* Math.cos(angle);
            basket.object.position.z = position* Math.sin(angle);

            this.baskets.push(basket);
            
            var radius_2 = createSpokes(spoke_length, spoke_radius, golden_color);
            radius_2.mesh.rotation.x += 2 * Math.PI * i /numberSpokes;
            radius_2.mesh.geometry.translate(position2, spoke_length/2, 0);
            
            this.object.add(basket.object);
            this.object.add(radius_1.mesh);
            this.object.add(radius_2.mesh);
        }

        var shape = new THREE.Shape();

        shape.moveTo(0, 0);
        shape.absellipse(0, 0, outer_radius, outer_radius, 0, 2 * Math.PI, true);

        var hole = new THREE.Path();
        hole.absellipse(0, 0, inner_radius, inner_radius, 0, Math.PI * 2);
        shape.holes.push(hole);     
        
        var extrudeSettings = { 
            bevelEnabled: true, 
            bevelSegments: 3, 
            steps: 0, 
            bevelSize: 0.2, 
            depth: 0, 
            bevelThickness: 0.5,
            curveSegments: 12 };
        
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: brown_color }));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.y += 0.5 * Math.PI;        
        
        var geometry2 = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        var mesh2 = new THREE.Mesh(geometry2, new THREE.MeshLambertMaterial({ color: brown_color }));
        mesh2.castShadow = true;
        mesh2.receiveShadow = true;
        mesh2.rotation.y += 0.5 * Math.PI;        

        this.object.add(mesh);
        mesh.geometry.translate(0, 0, position1);
        
        this.object.add(mesh2);
        mesh2.geometry.translate(0, 0, position2);
                
        this.radius = (outer_radius > spoke_length? outer_radius:spoke_length) + extrudeSettings.bevelThickness + basketStructureSize;
        this.width = axis_length;

        this.rotateObject =  function (speed) {
            this.baskets.forEach((basket) => basket.rotateObject(speed));
        };
    };
}


function createBasket( axis_size, length, radius, pColor, p2Color) {
    return new function () {
        this.object = new THREE.Object3D();

        this.basket_vert = new THREE.Mesh(
            new THREE.BoxGeometry(length, radius, radius),
            new THREE.MeshLambertMaterial({ color: p2Color })
            );
        this.basket_vert.castShadow = true;
        this.basket_vert.receiveShadow = true;
        this.basket_vert.rotation.z += 0.5 * Math.PI;

        this.basket_vert.geometry.translate(0 - length/2, 0, 0);

        this.basket_hor = new THREE.Mesh(
            new THREE.BoxGeometry(axis_size, radius, radius),
            new THREE.MeshLambertMaterial({ color: p2Color })
            );
        this.basket_hor.castShadow = true;
        this.basket_hor.receiveShadow = true;

        this.basket = new THREE.Mesh(
            new THREE.SphereGeometry(length/2, 20, 32, 0, 2 * Math.PI, 0 , 1/2 * Math.PI ),
            new THREE.MeshLambertMaterial({ color: pColor })
            );

        this.basket.material.side = THREE.DoubleSide;
        this.basket.castShadow = true;
        this.basket.receiveShadow = true;

        this.basket.rotation.x += Math.PI;
        this.basket.geometry.translate(0, length/2, 0);

        this.object.add(this.basket_vert);
        this.object.add(this.basket_hor);
        this.object.add(this.basket);

        this.rotateObject =  function (speed) {
            this.object.rotateX(2*Math.PI - speed);
        };
    };
}

function createSpokes(length, radius, pColor) {
    return new function () {    

        var spokeGeometry = new THREE.BoxGeometry(radius, length, radius);
        var spoke = new THREE.Mesh(
            spokeGeometry,
            new THREE.MeshLambertMaterial({ color: pColor })
            );

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

        this.outerRadius = outerRadius;
        this.innerRadius = innerRadius;
        this.rimWidth = rimWidth;
        this.axleRadius = axleRadius;
        this.spokeLenght = spokeLenght;
        this.numberSpokes = numberSpokes;
        this.rotateWheel = rotateFerris;
        this.rotateScene = toRotate;
        this.axleLenght = axleLength;

    }

    gui = new dat.GUI();

    gui.add(controls, "outerRadius", 1, 10).step(0.2).name('Outer Radius').onChange((c) => {
        var dif = outerRadius - innerRadius;
        outerRadius = c;
        
        rimWidth = dif;
        controls.rimWidth = dif;

        this.resetFerris();
        if (outerRadius <= innerRadius) {
            controls.innerRadius = outerRadius - dif;
            innerRadius = outerRadius - dif;
        } 
    });
    gui.add(controls, "innerRadius", 1, 10).step(0.2).name('Inner Radius').onChange((c) => {
        var dif = outerRadius - innerRadius;
        innerRadius = c;
        
        this.resetFerris();
        if (outerRadius <= innerRadius) {            
            controls.outerRadius = innerRadius + dif;
            outerRadius =  innerRadius + dif;
        }

        controls.rimWidth = dif;
        rimWidth = dif;
    });
    gui.add(controls, "rimWidth", 0.5, 5).step(0.5).name('Rim Width').onChange((c) => {        
        rimWidth = c;
/*
        outerRadius = rimWidth;
        controls.outerRadius = rimWidth;
*/
        
        innerRadius = outerRadius - c;
        controls.innerRadius = outerRadius - c;

        this.resetFerris();        
        /*if (rimWidth < spokeLenght) {
        } else {
            this.rimWidth = rimWidth;
        }*/
    });
    gui.add(controls, "axleRadius", 0.1, 5).step(0.2).name('Axle Radius').onChange((c) => {
        axleRadius = c;
        this.resetFerris();
        if (axleRadius < innerRadius) {
        } else {
            this.axleRadius = axleRadius;
        }
    });
    gui.add(controls, "axleLenght", 2, 10).step(0.5).name('Axle Lenght').onChange((c) => {
        axleLength = c;
        this.resetFerris();       
    });

    gui.add(controls, "spokeLenght", 1, 10).step(0.2).name('Spoke Lenght').onChange((c) => {
        spokeLenght = c;
        this.resetFerris();
        if (spokeLenght > outerRadius) {
        } else {
            this.spokeLenght = spokeLenght;
        }
    });
    gui.add(controls, "numberSpokes", 0, 24).step(1).name('Number of Spokes').onChange((c) => {
        numberSpokes = c;
        this.resetFerris();
    });

    gui.add(controls, 'rotateWheel').name('Rotate Ferris').onChange((e) => rotateFerris = e);
    gui.add(controls, 'rotateScene').name('Scene revolution').onChange((e) => toRotate = e);
 
}

function render() {

    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene  
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    if (rotateFerris){
        ferris.rotateObject(speed);
    }
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}
