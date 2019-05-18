/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/trackballcontrols.js" />

//author: Frederico Alexandre Feb 8, 2019
//filename: assignment01.js

//declare recurrent global variables
const planets_info = [
    { 
        name :'Mercury',
        radius : 1.5,
        distance: 5,
        bColor: 0xcab2b2,
        speed_degrees: 16, 
        satellites: [],
        add : true
    }, 
    {
        name :'Venus',
        radius : 4,
        distance: 10,
        bColor: 0xbb6666,
        speed_degrees: 6, 
        satellites: [],
        add : true
    },
    {
        name :'Earth',
        radius : 4.5,
        distance: 27,
        bColor: 0x3a30d7,
        speed_degrees: 4, 
        satellites: [{ name: 'Moon', bColor:0xcab2b2, size_ratio: 6, far: 1, day_year_ratio: 3}],
        add : true
    },
    {
        name :'Mars',
        radius : 2,
        distance: 50,
        bColor: 0xc84040,
        speed_degrees: 2.12, 
        satellites: [],
        add : true
    },
    {
        name :'jupiter',
        radius : 24,
        distance: 100,
        bColor: 0xb91919,
        speed_degrees: 1.8, 
        satellites: [
                    { name: 'Io', bColor:0xcab2b2, size_ratio: 15, far: 2, day_year_ratio: 3},
                    { name: 'Europa', bColor:0xcab2b2, size_ratio: 15, far: 5, day_year_ratio: 4},
                    { name: 'Ganymede', bColor:0xcab2b2, size_ratio: 13, far: 8, day_year_ratio: 5},
                    { name: 'Calisto', bColor:0xcab2b2, size_ratio: 14, far: 12, day_year_ratio: 2},
                    { name: 'Amalthea', bColor:0xcab2b2, size_ratio: 20, far: 15, day_year_ratio: 6}
                    ],
        add : true
    },
    {
        name :'Saturn',
        radius : 20,
        distance: 180,
        bColor: 0x0e00ff,
        speed_degrees: 0.7, 
        satellites: [
            { name: 'Titan', bColor:0xcab2b2, size_ratio: 13, far: 5, day_year_ratio: 5},
            { name: 'Rhea', bColor:0xcab2b2, size_ratio: 14, far: 8, day_year_ratio: 2},
            { name: 'Enceladus', bColor:0xcab2b2, size_ratio: 20, far: 12, day_year_ratio: 6}
        ],
        add : true
    },
    {
        name :'Uranus',
        radius : 14,
        distance: 250,
        bColor: 0x373787,
        speed_degrees: 0.25, 
        satellites: [],
        add : true
    },
    {
        name :'Neptune',
        radius : 13,
        distance: 285,
        bColor: 0x193eb9,
        speed_degrees: 0.13, 
        satellites: [],
        add : true
    },
    {
        name :'Pluto',
        radius : 1,
        distance: 320,
        bColor: 0x193eb9,
        speed_degrees: 0.1, 
        satellites: [],
        add : true
    }

];

const sun_radius = 50;
const minDistance = 8;
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 2000);
const clock = new THREE.Clock();

var findPluto = false;

var directionalLight, directionalColor = 0xeeffee,
    hemiSphereLight, hemiSkyColor = 0xcccccc, hemiGroundColor = 0x00ff00,
    sun,
    planets = [],
    plane,
    trackballControls,
    speed = 0.2,
    moons_speed = 1;

function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050e2f);
    renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;// default THREE.PCFShadowMap  
    document.body.appendChild(renderer.domElement);
    trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
}

function setupCameraAndLight() {
    camera.position.set(-100, 50, 400);
    camera.lookAt(scene.position);

    let ambientLight = new THREE.AmbientLight(0x000000);
    ambientLight.intensity = 0.2;
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight( 0xeeffee, 1, 2048, 0); 
    pointLight.position.set( 0, 0, 0 ); 
    scene.add(pointLight);

    directionalLight = new THREE.DirectionalLight(directionalColor);
    directionalLight.castShadow = true;
    directionalLight.target = scene;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    /*let dirLight2 = directionalLight.clone();
    let dirLight3 = directionalLight.clone();
    let dirLight4 = directionalLight.clone();
    */
    
    directionalLight.position.set(0, 0, 0);
    /*dirLight2.position.set(0 - sun_radius, 0, 0);
    dirLight3.position.set(0, 0, 0 + sun_radius);
    dirLight4.position.set(0, 0, 0 - sun_radius);
*/

    scene.add(directionalLight);
    //scene.add(dirLight2);
    //scene.add(dirLight3);
    //scene.add(dirLight4);

    /*var light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.set( 0, 0, 0 );
    scene.add( light );*/

    hemiSphereLight = new THREE.HemisphereLight(hemiSkyColor, hemiGroundColor, 0.6);//skycolor, groundcolor, intensity  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);
}

function createGeometry() {

    //scene.add(new THREE.AxesHelper(100));
    //let planeMaterial = new THREE.MeshStandardMaterial({color: 0xeeeeee});
    let planeMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    let planeGeometry = new THREE.PlaneGeometry(640, 640, 1, 1);
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.visible = false;
    scene.add(plane);

    sun = new THREE.Mesh (
        new THREE.SphereGeometry(sun_radius, 12, 12),
        new THREE.MeshPhongMaterial({color: 0xfff000})
    );
    sun.material.emissive = new THREE.Color(0x000000);;
    sun.material.specular = new THREE.Color(0xffffff);;

    sun.castShadow = false;
    sun.receiveShadow = false;
    sun.position.set(0, 0, 0);
    scene.add(sun);
    

    let size = 1.7;
    let color = randomColor( 200, 255 );
    let distance = 10;
    let speed = 0.5;
    /*let planet = createPlanet(size, distance, color, speed, 1, 5, 2);
    //scene.add(planet.mesh);
    planets.push(planet);*/

    planets_info.forEach((p_info) => {
        if (p_info.add) {
            let planet = createPlanet(sun, p_info.radius, minDistance + sun_radius + p_info.distance + p_info.radius, p_info.bColor, p_info.speed_degrees, p_info.name, p_info.satellites);
            planets.push(planet);
        }
    });

}
function randomColor(lower, upper) {
    let r = randomValue(lower, upper);
    let g = randomValue(lower, upper);
    let b = randomValue(lower, upper);
    return Math.round((((r * 255) + g) * 255) + b);    
}

function randomValue(lower, upper) {
    return Math.random() * (upper - lower) + lower;
}

function createPlanet(
    astro_mesh,
    radius,
    distance,
    bColor,
    speed_degrees, 
    name,
    s_info) {
        return new function () {
            this.satellites = [];
            this.rings = [];
            this.planet = createBody(name, astro_mesh, radius, distance, bColor, speed_degrees);
            this.planet.mesh.radius = radius;

            scene.add(this.planet.mesh);
           for (let i = 0; i < s_info.length; i++) {
               let sColor = s_info[i].bColor
               if (i >= 1) {
                    sColor = randomColor(200, 255);
               }
               
               let satellite = createBody(s_info[i].name, this.planet.mesh, radius/s_info[i].size_ratio, radius + s_info[i].far, sColor, speed_degrees * s_info[i].day_year_ratio, true);
               this.satellites[i] = satellite;               
               scene.add(satellite.mesh);
            }
            this.planet.visible = false;
            this.update = function(speed) {
                this.planet.update(speed);
                this.satellites.forEach((obj) => obj.update(moons_speed * speed));
                this.rings.forEach((obj) => {
                    obj.position.x = this.planet.mesh.position.x;
                    obj.position.y = this.planet.mesh.position.y;
                    obj.position.z = this.planet.mesh.position.z;
                });
                if (this.planet.text === 'Pluto' && findPluto) {
                    directionalLight.position.set(this.planet.mesh.position.x, this.planet.mesh.position.y + 2* this.planet.radius, this.planet.mesh.position.z);
                }
            };

            if (name === 'Saturn') {
                var geometry = new THREE.RingGeometry( radius + 5, radius + 15, 32 );
                var material = new THREE.MeshPhongMaterial( { color: bColor, side: THREE.DoubleSide } );
                var ring = new THREE.Mesh( geometry, material );
                material.transparent = true;   
                material.opacity = 0.5;
                this.rings[0] = ring; 
                ring.rotation.x = -0.45 * Math.PI;
                scene.add(ring);
            }
        };
        
}

function createBody(
        name,
        astro_mesh,
        radius,
        distance,
        bColor,
        speed_degrees,
        isSatellite = false) {
    
    return new function () {

        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 12, 12),
            new THREE.MeshStandardMaterial({color: bColor})
        );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.radius = radius;
        this.distance = distance;
        this.angle = 0;
        this.text = name;
       
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        let x = distance;
        let z = distance;        
        let y = 0;

        this.mesh.position.set(x, y, z);
        this.satellite_plane_distance = randomValue(0, this.distance) ;
        
        this.update = function(speed) {
            if (this.angle == 360) {
                this.angle = 0;
            }
            this.angle += (speed_degrees*speed);
            this.mesh.position.x = astro_mesh.position.x + this.distance * (Math.cos(this.angle * Math.PI / 180));
            this.mesh.position.z = astro_mesh.position.z + this.distance * (Math.sin(this.angle * Math.PI / 180));
            if (isSatellite) {
                this.mesh.position.y = this.satellite_plane_distance * ( Math.cos(this.angle * Math.PI / 180));
                //this.mesh.rotation.x = (this.angle * Math.PI / 180);
            }
        };
    };
}

function setupDatGui() {
    let controls = new function () {
        this.guiSpeed = speed;
        this.moonsSpeed = moons_speed;
        this.sunSize = 50;
        this.planeVisible = false;
        this.findPluto = false;
    }

    let gui = new dat.GUI();    
    gui.add(controls, 'guiSpeed', 0.01, 2).step(0.01).name('System Speed').onChange((s) => speed = s);
    gui.add(controls, 'moonsSpeed', 1, 10).step(0.1).name('Moons Speed').onChange((s) => moons_speed = s);    
    gui.add(controls, 'sunSize', 0, 50).step(5).name('Sun Radius Size').onChange((s) => sun.geometry = new THREE.SphereGeometry(s, 12, 12));
    gui.add(controls, 'planeVisible').name('Show Plane').onChange((c)=> plane.visible = c);
    gui.add(controls, 'findPluto').name('Find Pluto').onChange((c)=> {
        findPluto = c;
        if (!findPluto) {
            directionalLight.position.set(0,0,0);
        }
    });

}

function render() {
    trackballControls.update(clock.getDelta());
    planets.forEach((obj) => obj.update(speed));
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
