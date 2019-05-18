var Shaders = {};

Shaders.LabShader1 = {

    name : "BasicShader3",
    
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

