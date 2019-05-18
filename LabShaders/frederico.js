/// <reference path="libs/three.min.js" />
/// <reference path="libs/orbitcontrols.js" />
/// <reference path="libs/dat.gui.min.js" />
//name: Frederico Alexandre 
//date: March 29, 2019

var Shaders = {};

Shaders.BasicShader = {

    uniforms: {},

    vertexShader: [

        'void main(){',

            'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        '}'

        ].join( '\n' ),

    fragmentShader: [

        'void main(){',

            'gl_FragColor = vec4(1.0, 0, 0, 0.5);',

        '}'

    ].join( '\n' )
    

};

Shaders.BasicShader1 = {

    uniforms: {

        'time': { type: 'f', value: 0}
    },

    vertexShader: [

        'varying vec2 vUv;',

        'void main(){',

        'vUv = uv;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        '}'

        ].join( '\n' ),

    fragmentShader: [

        'uniform float time;',

        'void main(){',

        'gl_FragColor = vec4(abs(sin(time)), 0, 0, 0.5);',

        '}'

    ].join( '\n' )
    

};

Shaders.MyShader = {

    uniforms: {

        'time': { type: 'f', value: 0}
    },

    vertexShader: [

        'varying vec2 vUv;',

        'void main(){',

        'vUv = uv;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        '}'

        ].join( '\n' ),

    fragmentShader: [

        'uniform float time;',

        'void main(){',

        'gl_FragColor = vec4(abs(sin(time)), 0, 0, 0.5);',

        '}'

    ].join( '\n' )
    
};
//recurrent constants



//global variables

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
const clock = new THREE.Clock();

var plane;

const brown_color = 0x570505;
const golden_color = 0xb18c14;


let orbitControls, length = 20,
    speed = 0.01,
    wspeed = 0.01,
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

function createGeometry() {

    //scene.add(new THREE.GridHelper(40, 8));
    scene.add(new THREE.AxesHelper(50));
    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(plane);

   
    
}

function render() {

    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene  
    renderer.render(scene, camera);
    requestAnimationFrame(render);

    Shaders.MyShader.uniforms.time.value = clock.getElapsedTime();

}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}


function createControl() {
    //set up a dat-gui widget
    control = new function () {
        this.size = 6;
        this.initialPosition_x = plane.position.x - plane.geometry.parameters.width/2
        this.initialPosition_z = plane.position.z - plane.geometry.parameters.height/2;
        this.initialPosition_y = this.size/2 + 10;
        this.position_x = this.initialPosition_x;    
        this.position_z = this.initialPosition_z;
        this.position_y = this.initialPosition_y;
        this.rotate = toRotate;   
        this.showVariables = function() {
            console.log("size: " + this.size);
            console.log("shapes: " + this.shapes);
            console.log("color: " + this.color);
        }
        this.shapes = "cube";
        this.color = "#ffffff";
        this.addGeometry = function() {
            if (this.shapes === 'cube') {
                addCube(this);
            } else if (this.shapes === 'sphere') {
                addSphere(this);
            }
            if (this.position_x + 7 > plane.geometry.parameters.width/2) {
                this.position_x = this.initialPosition_x;
                if (this.position_z + 7 > plane.geometry.parameters.height/2) {
                    this.position_z = this.initialPosition_z;
                    this.position_y += 7;
                } else {                    
                    this.position_z += 7;
                }
            } else {
                this.position_x+= 7;
            }


        }     
    }
    var gui = new dat.GUI();
    gui.add(control, "showVariables");
    gui.add(control, "rotate").name('Scene revolution').onChange((e) => toRotate = e);;
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

function getMaterialShader(color) {
    return new THREE.ShaderMaterial(
        {
            uniforms: Shaders.MyShader.uniforms,
            vertexShader: Shaders.MyShader.vertexShader,
            fragmentShader: Shaders.MyShader.fragmentShader
        });
}

function addCube(control) {
    let geometryBox = new THREE.BoxGeometry(control.size, control.size, control.size);
    //let materialBox = new THREE.MeshLambertMaterial({ color: control.color });
    let box = new THREE.Mesh(geometryBox, getMaterialShader(control.color));
    box.position.x = control.position_x;
    box.position.y = control.position_y;
    box.position.z = control.position_z;
    box.castShadow = true;
    box.receiveShadow = false;

    scene.add(box);
}

function addSphere(control) {
    let geometrySphere = new THREE.SphereGeometry(control.size/2, 20, 32);
    //let materialSphere = new THREE.MeshLambertMaterial({ color: control.color });
    let sphere = new THREE.Mesh(geometrySphere, getMaterialShader(control.color));
    sphere.position.x = control.position_x;
    sphere.position.y = control.position_y;
    sphere.position.z = control.position_z;
    sphere.castShadow = true;
    sphere.receiveShadow = false;
    
    scene.add(sphere);
}
