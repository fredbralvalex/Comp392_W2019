/// <reference path="libs/three.min.js" />
/// <reference path="libs/TrackballControls.js" />
/// <reference path="libs/dat.gui.min.js" />
/// <reference path="textures/bricks.png" />
/// <reference path="textures/ground.jpg" />
//name: Frederico Alexandre 
//date: February 08, 2019
//file: 04-lab-materials.js

//recurrent constants



//global variables
var scene, camera, renderer, control, trackballcontrols,clock, plane;

var ambientLight, pointLight, spotLight, directionalLight, rectAreaLight, hemiSphereLight;
var torus, torusMaterial, angle;
var moving = true;
var reflectionCamera, refractionCamera;

//function definition
function init() {
    angle = 0;
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xaaffaa);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    ambientLight = new THREE.AmbientLight(0x8c1818);
    scene.add(ambientLight);

    spotLight = new THREE.SpotLight(0x8c1818);    
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

    pointLight = new THREE.PointLight( 0x8c1818, 1, 100 ); 
    pointLight.position.set( 5, 20, 0 ); 
    scene.add(pointLight);

    directionalLight = new THREE.DirectionalLight( 0x8c1818, 1, 100 );
    directionalLight.position.set( 0, 1, 0 ); 			
    directionalLight.castShadow = true;            
    
    
    directionalLight.shadow.mapSize.width = 512; 
    directionalLight.shadow.mapSize.height = 512; 
    directionalLight.shadow.camera.near = 0.5;    
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);
    

    rectAreaLight = new THREE.RectAreaLight( 0x8c1818, 5,  20, 20 );
    rectAreaLight.position.set( -10, 200, 0 );
    rectAreaLight.lookAt( plane.position);
    //scene.add(rectAreaLight);

    var rectLightHelper = new THREE.RectAreaLightHelper( rectAreaLight );
    rectAreaLight.add( rectLightHelper );

    hemiSphereLight = new THREE.HemisphereLight( 0x8c1818, 0x080820, 1 );
    //scene.add( hemiSphereLight );

}

function createGeometry() {
    addPlane();
    addTorus();    
}

function addTorus() {
    let torusGeometry = new THREE.TorusGeometry( 5, 3, 16, 50 );
    torusMaterial = new THREE.MeshToonMaterial({ color: 0x66aa66});   
    torusMaterial.transparent = false; 
    torus = new THREE.Mesh(torusGeometry, torusMaterial);
    
    torus.position.x = 5;
    torus.position.y = 15;
    torus.position.z = 0;
    torus.castShadow = true;
    torus.receiveShadow = false;
    torus.name = "torus";
    scene.add(torus);
    
    reflectionCamera = new THREE.CubeCamera( 0.1, 500, 512 );
    //reflectionCamera.renderTarget.texture.mapping =  THREE.CubeReflectionMapping;
    reflectionCamera.mapping =  THREE.CubeReflectionMapping;
    reflectionCamera.format = THREE.RGBFormat;
    reflectionCamera.name = 'reflection';

    refractionCamera = new THREE.CubeCamera( 0.1, 500, 512 );
    //refractionCamera.renderTarget.texture.mapping =  THREE.CubeRefractionMapping;
    refractionCamera.mapping =  THREE.CubeRefractionMapping;
    refractionCamera.format = THREE.RGBFormat;

    refractionCamera.name = 'refraction';
    //reflectionCamera.position.set(0, 80, 0);
    //refractionCamera.position.set(0, 80, 0);

    reflectionCamera.position.copy( torus.position );
    refractionCamera.position.copy( torus.position );

    scene.add(reflectionCamera);
    scene.add(refractionCamera);

    //torus.el.object3D.add(mirrorCamera);
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
    
    reflectionCamera.update(renderer, scene);
    //in the render function
    if (moving) {
        torus.rotation.y = angle += 0.01; 
        //torus.rotation.x = angle += 0.01; 
        //torus.rotation.z = angle += 0.01; 
    }

    requestAnimationFrame(render);
}

function createControlMaterial() {
    //set up a dat-gui widget
    control = new function () {   
        this.moving = true;
        this.skinning = false;
        this.emissive = "#66aa66";
        this.specular = "#111111";
        this.shininess = 30;
        this.flatShading = false;
        this.wireframe = false;
        this.wireframeLinewidth = 1;
        this.fog = false;
        this.envMap = 0;
        this.reflectivity = 1;
        this.refractionRatio = 0.98;
        this.lightMapIntensity = 1;
        this.depthTest = true;
        this.depthWrite = true;
        this.transparent = false;
        this.opacity = 1;
        this.shadowSide = null;
        this.side = THREE.FrontSide;
        this.morphNormals = false;
        this.map = 0;
        this.specularMap = 0;
        this.lightMap = 0;

    }

    var gui = new dat.GUI();
    
    /*gui.add(control, "moving").onChange((e) => {
        moving = e;
    });*/

    //not working
    /*gui.add(control, "skinning").onChange((e) => {
        torusMaterial.skinning = e;
        replaceMaterial(torusMaterial);
    });*/
    gui.addColor(control, "emissive").onChange((c) => {
        torusMaterial.emissive = new THREE.Color(c);
    });
    gui.addColor(control, "specular").onChange((c) => {
        torusMaterial.specular = new THREE.Color(c);
    });
    gui.add(control, "shininess", 0 , 100).step(1).onChange((c) => {
        torusMaterial.shininess = c;
    });
    gui.add(control, "flatShading").onChange((e) => {
        torusMaterial.flatShading = e;
        replaceMaterial(torusMaterial);
    });
    gui.add(control, "wireframe").onChange((e) => {
        torusMaterial.wireframe = e;
    });
    //not working
    /*gui.add(control, "wireframeLinewidth", 0 , 10).step(0.1).onChange((c) => {
        torusMaterial.wireframeLinewidth = c;
        replaceMaterial(torusMaterial);
    });*/
    //not working
    /*
    gui.add(control, "fog").onChange((e) => {
        torusMaterial.fog = e;
        replaceMaterial(torusMaterial);
    });*/
    gui.add(control, "envMap", { None: 0, Reflection: 1, Refraction: 2}).onChange((c) => {
        //torusMaterial.envMap = c;
        scene.remove('reflection');
        scene.remove('refraction');
        if (c == 0) {
            torusMaterial.envMap = null;
            replaceMaterial(torusMaterial);
        } else if (c == 1){
            scene.remove('refraction');
            torusMaterial.envMap = reflectionCamera.renderTarget.texture;
            replaceMaterial(torusMaterial);
            scene.add(reflectionCamera);
        } else if (c == 2) {
            scene.remove('reflection');
            torusMaterial.envMap = refractionCamera.renderTarget.texture;
            replaceMaterial(torusMaterial);
            scene.add(refractionCamera);
        }
    });
    gui.add(control, "reflectivity", 0 , 1).step(0.1).onChange((c) => {
        torusMaterial.reflectivity = c;
        replaceMaterial(torusMaterial);
    });
    //not working
    gui.add(control, "refractionRatio", 0 , 1).step(0.01).onChange((c) => {
        torusMaterial.refractionRatio = c;
        replaceMaterial(torusMaterial);
    });
    /*
    //not working
    gui.add(control, "lightMapIntensity", 0 , 10).step(0.1).onChange((c) => {
        torusMaterial.lightMapIntensity = c;
        replaceMaterial(torusMaterial);
    });*/
    gui.add(control, "depthTest").onChange((e) => {
        torusMaterial.transparent = e;
        replaceMaterial(torusMaterial);
    });
    gui.add(control, "depthWrite").onChange((e) => {
        torusMaterial.transparent = e;
        replaceMaterial(torusMaterial);
    }); 
    gui.add(control, "transparent").onChange((e) => {
        torusMaterial.transparent = e;
        replaceMaterial(torusMaterial);
    });
    gui.add(control, "opacity", 0 , 1).step(0.1).onChange((c) => {
        torusMaterial.opacity = c;
        replaceMaterial(torusMaterial);
    });
    
   /*
    //not working
    gui.add(control, "shadowSide", { Front: THREE.FrontSide, Back: THREE.BackSide, Double: THREE.DoubleSide }).onChange((c) => {
        torusMaterial.shadowSide = c;
        replaceMaterial(torusMaterial);
    });
    */
    //not working
    gui.add(control, "side", { Front: THREE.FrontSide, Back: THREE.BackSide, Double: THREE.DoubleSide }).onChange((c) => {
        torusMaterial.side = parseInt(c);
        torusMaterial.needsUpdate = true;
        replaceMaterial(torusMaterial);
    });
    //not working
    /*gui.add(control, "morphNormals").onChange((e) => {
        torusMaterial.morphNormals = e;
        replaceMaterial(torusMaterial);
    });*/
    gui.add(control, "map", { None: 0,         
        grass:  1,
        //ground: new THREE.TextureLoader().load( './textures/ground.jpg' )
            }).onChange((c) => {
                if ( c == 0) {
                    torusMaterial.map = null;
                } else if (c == 1) {
                    torusMaterial.map = new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/terrain/grasslight-thin.jpg' );
                }
        //replaceMaterial(torusMaterial);
    });
    gui.add(control, "specularMap", { None: 0,         
        grass:  1,
        //ground: new THREE.TextureLoader().load( './textures/ground.jpg' )
            }).onChange((c) => {
                if ( c == 0) {
                    torusMaterial.specularMap = null;
                } else if (c == 1) {
                    torusMaterial.specularMap = new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/terrain/grasslight-thin.jpg' );
                }
        //replaceMaterial(torusMaterial);
    });
    gui.add(control, "lightMap", { None: 0,         
        grass:  1,
        //ground: new THREE.TextureLoader().load( './textures/ground.jpg' )
            }).onChange((c) => {
                if ( c == 0) {
                    torusMaterial.lightMap = null;
                } else if (c == 1) {
                    torusMaterial.lightMap = new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/terrain/grasslight-thin.jpg' );
                }
        //replaceMaterial(torusMaterial);
    });
}

function replaceMaterial(oldMaterial) {
    var newMaterial = new THREE.MeshToonMaterial({ color: 0x66aa66 });
    newMaterial.flatShading = oldMaterial.flatShading;

    newMaterial.moving =  oldMaterial.moving ;
    newMaterial.skinning = oldMaterial.skinning;
    newMaterial.emissive = oldMaterial.emissive;
    newMaterial.specular = oldMaterial.specular;
    newMaterial.shininess = oldMaterial.shininess;
    newMaterial.flatShading = oldMaterial.flatShading;
    newMaterial.wireframe = oldMaterial.wireframe;
    newMaterial.wireframeframeLinewidth = oldMaterial.wireframeframeLinewidth;
    newMaterial.fog = oldMaterial.fog;
    newMaterial.envMap = oldMaterial.envMap;
    newMaterial.reflectivity = oldMaterial.reflectivity;
    newMaterial.refractionRatio = oldMaterial.refractionRatio;
    newMaterial.lightMapIntensity = oldMaterial.lightMapIntensity;
    newMaterial.depthTest = oldMaterial.depthTest;
    newMaterial.depthWrite = oldMaterial.depthWrite;
    
    newMaterial.transparent = oldMaterial.transparent;    
    newMaterial.opacity = oldMaterial.opacity;
    newMaterial.shadowSide = oldMaterial.shadowSide;
    newMaterial.side = oldMaterial.side;
    newMaterial.morphNormals = oldMaterial.morphNormals;
    newMaterial.map = oldMaterial.map;
    newMaterial.specularMap = oldMaterial.specularMap;
    newMaterial.lightMap = oldMaterial.lightMap;
    

    torus.material = newMaterial;
    this.torusMaterial = newMaterial;
}

function createControlLight() {
    //set up a dat-gui widget
    control = new function () {   
        this.ambientLight = true;
        this.spotLight =true;
        this.pointLight = true; 
        this.directionalLight = true;    
        this.rectAreaLight = true;
        this.hemiSphereLight = true;

        this.ambientLightColor = "#8c1818";
        this.spotLightColor = "#8c1818";
        this.pointLightColor = "#8c1818";
        this.directionalLightColor = "#8c1818";
        this.rectAreaLightColor = "#8c1818";
        this.hemiSphereLightColor = "#8c1818";
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
    createControlMaterial();

    render();
}