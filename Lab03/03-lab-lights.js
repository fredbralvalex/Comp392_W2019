/// <reference path="libs/three.min.js" />
/// <reference path="libs/TrackballControls.js" />
/// <reference path="libs/dat.gui.min.js" />
//name: Frederico Alexandre 
//date: January 25, 2019
//file: 03-lab-lights.js

//recurrent constants



//global variables
var scene, camera, renderer, control, trackballcontrols,clock, plane;

var ambientLight, pointLight, spotLight, directionalLight, rectAreaLight, hemiSphereLight;
var lensFare;

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

    ambientLight = new THREE.AmbientLight(0x3c3c3c);
    scene.add(ambientLight);

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

    pointLight = new THREE.PointLight( 0xff0000, 1, 100 ); 
    pointLight.position.set( 5, 20, 0 ); 
    scene.add(pointLight);

    directionalLight = new THREE.DirectionalLight( 0xffffff, 1, 100 );
    directionalLight.position.set( 0, 1, 0 ); 	
    directionalLight.castShadow = true;		
    directionalLight.castShadow = true;            
    
    
    directionalLight.shadow.mapSize.width = 512; 
    directionalLight.shadow.mapSize.height = 512; 
    directionalLight.shadow.camera.near = 0.5;    
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);
    

    rectAreaLight = new THREE.RectAreaLight( 0xffffff, 5,  20, 20 );
    rectAreaLight.position.set( -10, 20, 0 );
    rectAreaLight.lookAt( plane.position);
    scene.add(rectAreaLight);

    var rectLightHelper = new THREE.RectAreaLightHelper( rectAreaLight );
    rectAreaLight.add( rectLightHelper );

    hemiSphereLight = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 );
    scene.add( hemiSphereLight );

}

function createGeometry() {
    addPlane();
    addCube();
    addSphere();    
}

function addCube() {
    let geometryBox = new THREE.BoxGeometry(10, 3, 6);
    let materialBox = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    let box = new THREE.Mesh(geometryBox, materialBox);
    box.position.x = 10;
    box.position.y = 10;
    box.position.z = 0;
    box.castShadow = true;
    box.receiveShadow = false;
    scene.add(box);
}

function addSphere() {
    let geometrySphere = new THREE.SphereGeometry(3, 20, 32);
    let materialSphere = new THREE.MeshPhongMaterial({ color: 0x66aa66, specular: 0x0000ff });
    let sphere = new THREE.Mesh(geometrySphere, materialSphere);
    sphere.position.x = 0;
    sphere.position.y = 5;
    sphere.position.z = 0;
    sphere.castShadow = true;
    sphere.receiveShadow = false;
    scene.add(sphere);
}

function addPlane() {
    let geom  = new THREE.PlaneGeometry(40, 20, 1, 1);
    let mat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    plane = new THREE.Mesh(geom, mat);

    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(10, 0, 0);
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
        this.ambientLight = true;
        this.spotLight =true;
        this.pointLight = true; 
        this.directionalLight = true;    
        this.rectAreaLight = true;
        this.hemiSphereLight = true;

        this.ambientLightColor = "#ffffff";
        this.spotLightColor = "#ffffff";
        this.pointLightColor = "#ffffff";
        this.directionalLightColor = "#ffffff";
        this.rectAreaLightColor = "#ffffff";
        this.hemiSphereLightColor = "#ffffff";
    }

    var gui = new dat.GUI();
    
    gui.add(control, "ambientLight").onChange((e) => {
        ambientLight.visible = e;
      });
    gui.addColor(control, "ambientLightColor").onChange((c) => {
        ambientLight.color = new THREE.Color(c);
    });

    gui.add(control, "spotLight").onChange((e) => {
        spotLight.visible = e;
    });
    gui.addColor(control, "spotLightColor").onChange((c) => {
            spotLight.color = new THREE.Color(c);
    }); 

    gui.add(control, "pointLight").onChange((e) => {
        pointLight.visible = e;
    });
    gui.addColor(control, "pointLightColor").onChange((c) => {
            pointLight.color = new THREE.Color(c);
    }); 

    gui.add(control, "directionalLight").onChange((e) => {
        directionalLight.visible = e;
    });
    gui.addColor(control, "directionalLightColor").onChange((c) => {
            directionalLight.color = new THREE.Color(c);
    }); 

    gui.add(control, "rectAreaLight").onChange((e) => {
        rectAreaLight.visible = e;
    });
    gui.addColor(control, "rectAreaLightColor").onChange((c) => {
        rectAreaLight.color = new THREE.Color(c);       
    }); 

    gui.add(control, "hemiSphereLight").onChange((e) => {
        hemiSphereLight.visible = e;
    });
    gui.addColor(control, "hemiSphereLightColor").onChange((c) => {
            hemiSphereLight.color = new THREE.Color(c);
    });
}

//launch
window.onload = () => {
    init();
    createGeometry();
    setupCameraAndLight();
    createControl();

    render();
}