/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />
/// <reference path="./libs/physi.js" />

//Date: March 15, 2019
//author: 
// Frederico Alexandre 
//Megha Gururaja
//Kashish Rao

//filename: frederico.js
//levels
// assets\games\frederico1.json
// assets\games\frederico2.json
// assets\games\frederico3.json
// assets\games\frederico4.json
// assets\games\frederico5.json
/*
    In this game the player has to click in the cube in order to make it disapears and score points before it reaches the ground. 
    But, in this game the cubes must fall in order to increment the points, if any cube move, the player loses.
*/

Physijs.scripts.worker = './libs/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new Physijs.Scene({fixedTimeStep: (1/60), reportsize: (50)});
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);

const red_color = 0xb10000;
const blue_color = 0x000777;
const yellow_color = 0xfff000;
const white_color = 0xffffff;

const scoreTable = {
    1 : {"color": red_color, "rate": 100},
    2 : {"color": blue_color, "rate": 90},
    3 : {"color": yellow_color, "rate": 80}
};

let playerScore = [];
let level = 1;
let points = 0;
let port = 8080;
let fileName = 'frederico';
var gui, controls;
var gameIsRunning = false;
var message = 'Start a new Game';

let orbitControls, length = 20,
    speed = 0.01,
    wspeed = 0.01,
    toRotate = false;

function init() {
    
    //Attributes to pass in the object 
    //fixedTimeStep (1/60); //How much time one simulation step takes to simulate 
    //reportsize (50); //If you know how much objects your world will have, you can set this to optimize
    scene.setGravity(new THREE.Vector3(0, -10, 0)); //specify gravity
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

}

function setupCameraAndLight() {
    camera.position.set(-60, 50, 0);
    camera.lookAt(scene.position);

    scene.add(new THREE.AmbientLight(0x666666));

    let directionalLight = new THREE.DirectionalLight(0xeeeeee);
    directionalLight.position.set(-50, 60, 10);
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

    scene.add(new THREE.AxesHelper(50));

    createTable();
    
}

let table;
function createTable() {

    let cubeMaterial = new THREE.MeshStandardMaterial({
        transparent:false,
        opacity: 0.9,
        color: 0x6b6b6b
    });
    let h = 2;
    var object = new Physijs.BoxMesh(
        new THREE.BoxGeometry(20, 60, h),
        Physijs.createMaterial(cubeMaterial) , 0
        );

    object.position.y = -h/2;
    object.receiveShadow = true;
    object.rotation.x = -Math.PI * 0.5;
    object.setAngularFactor = THREE.Vector3(0, 0, 0);
    object.setLinearFactor = THREE.Vector3(0, 0, 0);
    scene.add(object);
    table = object;
}


function startGame(port, fileName) {
    //console.log('Loading Game... ');
    readFile(port, fileName + level);    
}

var cubes = [];
var notGroundedCubes = [];
var removedCubes = [];
function clearGame() {
    //gameIsRunning = false;
    cubes.forEach(cube => {
        if (removedCubes.indexOf(cube) == -1) {
            scene.remove(cube);
        }
    });

    cubes = [];
    notGroundedCubes = [];
    removedCubes = [];
}

function createGame(txtLevel) {
    if (level == 1){
        points = 0;
    }
    clearGame();

    let jsonLevel = JSON.parse(txtLevel);
    jsonLevel.cubes.forEach(cube => {
        //console.log('x : ' + cube.x + ' y : ' + cube.y + ' z : ' + cube.z);
        let box = createBox(cube.size, scoreTable[cube.type].color);
        box.mesh.position.x = cube.x;
        box.mesh.position.y = cube.y + box.halfSize;
        box.mesh.position.z = cube.z;
        scene.add(box.mesh);
        playerScore[box.mesh.uuid] = createScoreItem(scoreTable[cube.type].rate, 
            box.mesh.position.x, 
            box.mesh.position.y, 
            box.mesh.position.z, 
            cube.type, cube.size); 
        cubes.push(box.mesh);
        if (cube.y !== 0) {
            notGroundedCubes.push(box.mesh);
        }
    });
    gameIsRunning = true;
    controls.message = 'Restart Game!';
    controls.startGame = function() {
        level = 1;
        points = 0;
        startGame(this.port, this.fileName);  
    }    
    controls.points = Math.round(points);
    controls.level = "Level 0" + level;
    if (gui !== undefined) {
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
    }
}

function createScoreItem(points, initialX, initialY, initialZ, type, size) {
    return new function () {
        this.type = type;
        this.size = size;
        this.totalPoints = points;
        this.initialX = initialX;
        this.initialY = initialY;
        this.initialZ = initialZ;
        this.lastHeight = initialY;
        
        this.getScore = function (x, y, z) {
            if (y === initialY) {
                return 0;
            } else {            
                let distance = Math.sqrt(Math.pow(z - initialZ, 2) + Math.pow(y - initialY, 2));
                return ((1 + (distance))*points) - points;
            }
        };
    }
}

function createBox(size, color) {
    return new function () {
        this.size = size;
        this.halfSize = size/2;
        let cubeMaterial = new THREE.MeshStandardMaterial({
            transparent:true,
            opacity:0.9,
            color:color
        });

        let friction = randomValue(0, 1).toFixed(1); 
        let restitution = randomValue(0, 1).toFixed(1);

        //console.log('r: ' + restitution + ' f: ' + friction);
        var cube = new Physijs.BoxMesh(
            new THREE.BoxGeometry(size, size, size),
            Physijs.createMaterial(cubeMaterial, 
                friction,
                restitution), 5
            );
        cube.castShadow = true;
        cube.receiveShadow = true;
        this.mesh =cube;        
    };
}

function rad(deg) { return Math.PI * deg / 180;}

function setupDatGui() {

    controls = new function () {

        this.rotateScene = toRotate;
        this.port = "" +port;
        this.points = "" + points;
        this.fileName = fileName;
        this.level = "Level 0" + level;
        this.message = message;
        this.startGame = function() {   
            level = 1;
            points = 0;
            startGame(this.port, this.fileName);         
        };

    }

    gui = new dat.GUI();
    gui.add(controls, 'level').name('Level');
    gui.add(controls, 'points').name('Points');
    gui.add(controls, 'rotateScene').name('Scene revolution').onChange((e) => toRotate = e);
    gui.add(controls, 'port').name('Game Server port');
    gui.add(controls, 'fileName').name('Game File Name');
    gui.add(controls, 'message').name('Click bellow to');
    gui.add(controls, 'startGame').name('Click!');
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
    
    var intersects = raycaster.intersectObjects(cubes);
    for ( var i = 0; i < intersects.length; i++ ) {
        //console.log(intersects[ i ].object.uuid);
        intersects[ i ].object.material.color.set( 0x000000 );
        scene.remove(intersects[ i ].object);
        removedCubes.push(intersects[ i ].object);

        let cube = playerScore[intersects[ i ].object.uuid];
        if (cube.type == 1) {
            let c = createBox(10, 0x000000);        
            c.mesh.position.x = intersects[ i ].object.x;
            c.mesh.position.y = 25;
            c.mesh.position.z = intersects[ i ].object.z;
            scene.add(c.mesh);
            //updateDirty ();
            //scene.remove(c);
        }

        //playerScore[intersects[ i ].object].lastHeight = intersects[ i ].object.position.y;
        let score = playerScore[intersects[ i ].object.uuid].getScore(intersects[ i ].object.position.x, intersects[ i ].object.position.y, intersects[ i ].object.position.z);
        points = points + score;
        //console.log('points ' + points);
        controls.points = Math.round(points);
        intersects[ i ].object.__dirtyPosition = true;
        intersects[ i ].object.__dirtyRotation = true;
        break;
    }
    cubes = cubes.filter(item => !removedCubes.includes(item));

    if (gui !== undefined) {
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
    }
    updateDirty ();
    /*
    console.log('cubes ' + cubes.length);
    console.log('removedCubes ' + removedCubes.length);
    console.log('notGroundedCubes ' + notGroundedCubes.length);
    */
}
//#endregion raycast

function render() {

    renderer.render(scene, camera);
    requestAnimationFrame(render); 
    scene.simulate();   
    
    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene  

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera);
    if (notGroundedCubes) {
        //the easiest way!!!
        notGroundedCubes.forEach(cube => {
            let d = Math.sqrt(2)*cube.geometry.parameters.width/2;
            if (cube.position.y - d <= -0.3) {
                scene.remove(cube);
                removedCubes.push(cube);
                points = points - playerScore[cube.uuid].getScore(0, 0, 0);
                controls.points = Math.round(points);
                if (gui !== undefined) {
                    for (var i in gui.__controllers) {
                        gui.__controllers[i].updateDisplay();
                    }
                }
            }
            //cube.__dirtyRotation = true;
        });
        notGroundedCubes = notGroundedCubes.filter(item => !removedCubes.includes(item));
        cubes = cubes.filter(item => !removedCubes.includes(item));
    }

    if (gameIsRunning && cubes.length == 0) {
        //console.log('Next Level');
        gameIsRunning = false;
        //controls.startGame.name = 'Next Level!';
        level++;
        if (level > 5) {
            level = 1;
            controls.message = 'Start Game! Thanks!!!';
        } else {
            controls.message = 'Go to the Next Level!';
        }
        controls.level = "Level 0" + level;
        controls.startGame = function() {
            startGame(this.port, this.fileName);  
        }    
        if (gui !== undefined) {
            for (var i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
        }
    }

}

function updateDirty () {
    removedCubes.forEach(cube => {cube.__dirtyPosition = true;cube.__dirtyRotation = true;});
    cubes.forEach(cube => {cube.__dirtyPosition = true;cube.__dirtyRotation = true;});
    notGroundedCubes.forEach(cube => {cube.__dirtyPosition = true;cube.__dirtyRotation = true;});
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();
    //generateCubeJsonFile();
}

function generateCubeJsonFile() {
    let cubeSize = 5;
    let start = -15;
    let spaceFalse = 2.5;
    /*let level = [
        [true, false, true, false, true],
        [false, true, false, true, false],
        [true, false, true, false, true],
        [true, false, true, false, true],
        [false, true, true, true, false]
    ];*/
    let level = [
        [true, false, true, false, true, false, true, true],
        [false, true, false, true, false, true, false, true],
        [true, false, true, false, true, false, true, true],
        [true, false, true, false, true, false, true, true],
        [false, true, true, true, true, true, false, true]
    ];
    //let jsonLevel = JSON.parse(txtLevel);
    let cube = {};
    let x = start;
    //let y = 0;
    for (let y = 0; y < level.length; y++) {
        for (let index = 0; index < level[y].length; index++) {
            if(level[y][index]) {
                cube.type = Math.round(this.randomValue(1,3));
                cube.size = 5;
                cube.x = 0;
                cube.y = y*cubeSize; 
                cube.z = x.toFixed(2);
                x = x + cubeSize;
            } else {
                x = x + spaceFalse;
            }
            if (level[y][index]) {
                //console.log(cube);
                console.log( 
                    '{"type":' + cube.type +
                    ',"size":' + cube.size + 
                    ',"x":' + cube.x +
                    ',"y":' + cube.y +
                    ',"z":' + cube.z + "}"
                    );
            }
        }
        x = start;
    };
}

function randomValue(lower, upper) {
    return Math.random() * (upper - lower) + lower;
}

//#region File System

function readFile(port, filename) { 
    //filename = 'frederico3';
    let url = 'http://localhost:' + port + //port number from data.gui         
    '/assets/games/' +              //url path         
    filename +                      //file name from dat.gui         
    '.json';                        //extension     
    //console.log(url);
    let request = new XMLHttpRequest();     
    request.open('GET', url);     
    request.responseType = 'text';      //try text if this doesn’t work     
    request.send();     
    request.onload = () => {        
         let data = request.responseText;         
         //console.log(data);            
        //debugging code         
        createGame(data);                        
        //createGame(JSON.parse(data)); //convert text to json     
    }
}

//#endregion