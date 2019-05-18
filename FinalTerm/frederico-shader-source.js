var Shaders = {};

Shaders.LabShader1 = {

    name : "Shader1",
    
    uniforms: {

        'time': { type: 'f', value: 0},
        'texture': {value: null} ,
        'map': {value: null} ,
    },
// 
//pos.z -= sin(time)*sin(pos.x * pos.y)*v4texture.r*0.5;
    vertexShader: 

        `varying vec2 vUv;

        uniform sampler2D texture;

        uniform sampler2D map;

        uniform float time;
        void main(){

            vUv = uv;
            vec3 pos = position;
            vec4 v4texture = texture2D(texture, vUv);
            vec4 v4map = texture2D(map, vUv);           

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

        }`,

    fragmentShader:

        `
        uniform sampler2D texture;

        uniform sampler2D map;

        uniform float time;
        
        varying vec2 vUv;

        vec2 vV2 = vec2(1.0, 1.0);

        void main(){

            vec4 v4map = texture2D(map, vUv);
            vec4 v4textureColor = texture2D(texture, vUv).bgra;
            
            gl_FragColor = vec4(v4textureColor.r, v4textureColor.g, v4textureColor.b, 0.5) * vec4(v4map.r, v4map.g, v4map.b, 0.5);

        }`        
    
};


Shaders.LabShader2 = {

    name : "Shader2",
    
    uniforms: {

        'time': { type: 'f', value: 0}
    },
// 
//pos.z -= sin(time)*sin(pos.x * pos.y)*v4texture.r*0.5;
    vertexShader: 

        `varying vec2 vUv;

        uniform float time;
        void main(){

            vUv = uv;
            vec3 pos = position;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

        }`,

    fragmentShader:

        `
        uniform float time;
        
        varying vec2 vUv;

        vec2 vV2 = vec2(1.0, 1.0);

        void main(){

            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

        }`        
    
};


Shaders.LabShader3 = {

    name : "Shader3",
    
    uniforms: {

        'time': { type: 'f', value: 0},
        'texture': {value: null} 
    },

    vertexShader: 

        `varying vec2 vUv;

        uniform sampler2D texture;

        uniform float time;
        void main(){

            vUv = uv;
            vec4 v4texture = texture2D(texture, vUv);

            vec3 pos = position;
            pos.z -= sin(time)*sin(pos.x * pos.y)*v4texture.r*0.5;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

        }`,

    fragmentShader:

        `
        uniform sampler2D texture;

        uniform float time;
        
        varying vec2 vUv;

        vec2 vV2 = vec2(1.0, 1.0);

        void main(){

            vec4 v4textureColor = texture2D(texture, vUv).bgra;
            
            gl_FragColor = vec4(v4textureColor.r, fract(v4textureColor.g), 1.0, 0.75);

        }`        
    
};

