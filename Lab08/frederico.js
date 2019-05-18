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
    name : 'MyShader',

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


Shaders.MyShader2 = {

    name : 'MyShader2',

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

        'gl_FragColor = vec4(abs(sin(time)), abs(sin( 3.0 * time)), 0, 0.5);',

        '}'

    ].join( '\n' )
    
};

Shaders.MyShader3 = {
    name : 'MyShader3',

    uniforms: {
      tDiffuse: { value: null },
      color:    { value: new THREE.Color(0x88CCFF) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec3 color;
      void main() {
        vec4 previousPassColor = texture2D(tDiffuse, vUv);
        gl_FragColor = vec4(
            previousPassColor.rgb * color,
            previousPassColor.w);
      }
    `,
  };

//recurrent constants

var width = window.innerWidth || 2;
var height = window.innerHeight || 2;

var halfWidth = width / 2;
var halfHeight = height / 2;

let __shader = Shaders.MyShader;

var params = {
    exposure: 1.1,
    bloomStrength: 2.1,
    bloomThreshold: 0,
    bloomRadius: 0
};

var composer, composer1;
//global variables

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, width / height, 1.0, 1000);
const clock = new THREE.Clock();

var plane;
var elf;

const brown_color = 0x570505;
const golden_color = 0xb18c14;


let orbitControls, length = 20,
    speed = 0.01,
    wspeed = 0.01,
    turnOn = false,
    isBloomShader = true;

let shaderUsesTime = true;

function addColada() {
    var loadingManager = new THREE.LoadingManager( function () {
        scene.add( elf );
    } );

    // collada
    var loader = new THREE.ColladaLoader( loadingManager );
    
    loader.load( './models/collada/elf/elf.dae', function ( collada ) {
        elf = collada.scene;
    } ); 
    
}

function addLerry() {
    var loader = new THREE.GLTFLoader();
    loader.load( "models/gltf/LeePerrySmith/LeePerrySmith.glb", function ( gltf ) {

        createMesh( gltf.scene.children[ 0 ].geometry, scene, 10 );

    } );
}

function createMesh( geometry, scene, scale ) {

    var mat2 = new THREE.MeshPhongMaterial( {

        color: 0x999999,
        specular: 0x080808,
        shininess: 20,
        map: new THREE.TextureLoader().load( "models/gltf/LeePerrySmith/Map-COL.jpg" ),
        normalMap: new THREE.TextureLoader().load( "models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg" ),
        normalScale: new THREE.Vector2( 0.75, 0.75 )

    } );

    mesh = new THREE.Mesh( geometry, mat2 );
    mesh.position.set( 0, - 50, 0 );
    mesh.scale.set( scale, scale, scale );

    scene.add( mesh );

}

function onWindowResize() {
    camera.aspect = ( width * 0.5 ) / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
    composer.setSize( width, height );
}

function init() {        

    var urls = [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ];
    var loader = new THREE.CubeTextureLoader().setPath( 'textures/cube/Bridge2/' );
    loader.load( urls, function ( texture ) {

        var pmremGenerator = new THREE.PMREMGenerator( texture );
        pmremGenerator.update( renderer );

        var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
        pmremCubeUVPacker.update( renderer );

        var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
        // model
        //elf.material.envMap = envMap;        

        pmremGenerator.dispose();
        pmremCubeUVPacker.dispose();

        scene.background = texture;

    } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.gammaInput = true;
    renderer.autoClear = false;

    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    addColada();
    //addLerry();

    var renderPass = new THREE.RenderPass( scene, camera );
    renderPass.clear = false;

    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    
    var effectBloom = new THREE.BloomPass(0.5);

    var effectGamma = new THREE.ShaderPass(THREE.GammaCorrectionShader);
    var effectSepia = new THREE.ShaderPass(THREE.SepiaShader);
    effectSepia.uniforms[ "amount" ].value = 0.9;

    effectCopy.renderToScreen = true;
    effectBloom.renderToScreen = true;
    effectGamma.renderToScreen = true;
    effectSepia.renderToScreen = true;

    var myEffect = new THREE.ShaderPass(Shaders.MyShader);
    myEffect.renderToScreen = true;
    
    /*var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;*/

    var parameters = { 
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        stencilBuffer: true
      };      
    var rtWidth = width / 2;
    var rtHeight = height / 2;
    
    composer = new THREE.EffectComposer( renderer, new THREE.WebGLRenderTarget(  rtWidth * 2, rtHeight * 2, parameters ) );        
    composer.addPass( renderPass );    

    composer1 = new THREE.EffectComposer( renderer, new THREE.WebGLRenderTarget( rtWidth, rtHeight, parameters ) );
    //composer1.addPass( effectSepia );    

/*
    renderer.autoClear = false;
    composer = new THREE.EffectComposer(renderer);
    var sunRenderModel = new THREE.RenderPass(scene, camera);
    var effectBloom = new THREE.BloomPass(1, 25, 5);
    var sceneRenderModel = new THREE.RenderPass(scene, camera);
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    composer.addPass(sunRenderModel);
    composer.addPass(effectBloom);
    composer.addPass(effectCopy);
*/

    window.addEventListener( 'resize', onWindowResize, false );
}

function setupCameraAndLight() {
    camera.position.set(-50, 40, 20);
    camera.lookAt(scene.position);
    scene.add(new THREE.AmbientLight(0x666666));
}

function createGeometry() {
   
}


function getMaterialShader() {
    return new THREE.ShaderMaterial(
        {
            uniforms: __shader.uniforms,
            vertexShader: __shader.vertexShader,
            fragmentShader: __shader.fragmentShader
        });
}

function render() {

    orbitControls.update();

    //renderer.render(scene, camera);
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    if (shaderUsesTime) {
        __shader.uniforms.time.value = clock.getElapsedTime();
    }
    renderer.setViewport( 0, 0, halfWidth * 2, halfHeight * 2);
    composer.render(delta);
    composer1.render(delta);

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
        this.on = turnOn;    
        this.bloom = isBloomShader;
    }
    var gui = new dat.GUI();
    gui.add(control, "on").name('Turn On Shaders').onChange((e) => {
        turnOn = e;
        scene.remove(elf);
        addColada();
    });

    gui.add(control, "bloom").name('Bloom/Gamma Correction').onChange((e) => {
        isBloomShader = e;
        shaderUsesTime = true;
        if (isBloomShader) {
            __shader = Shaders.MyShader;
        } else {
            __shader = Shaders.MyShader2;

        }
        scene.remove(elf);
        addColada();
    });
}

//launch
window.onload = () => {
    init();
    setupCameraAndLight();
    createGeometry();
    createControl();    
    render();
}



/*

        var loader = new THREE.GLTFLoader().setPath( 'models/gltf/DamagedHelmet/glTF/' );
        loader.load( 'DamagedHelmet.gltf', function ( gltf ) {

            gltf.scene.traverse( function ( child ) {

                if ( child.isMesh ) {

                    child.material.envMap = envMap;

                }

            } );

            scene.add( gltf.scene );

        } );

*/