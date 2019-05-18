var Shaders = {};

Shaders.LabShader1 = {

    name : "Shader",
    
    uniforms: {

        'time': { type: 'f', value: 0}
    },

    vertexShader: [

        'attribute vec4 a_position;',

        'uniform vec4 u_offset;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',

        'void main(){',        
        
        'vUv = uv;',
        
        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        'v_color = gl_Position * 0.5 + 0.5;',

        '}'

        ].join( '\n' ),

    fragmentShader: [

        'uniform float time;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',
        
        'vec3 colorw = vec3(1.0, 1.0, 1.0);',

        'vec3 colorb = vec3(0.0, 0.0, 1);',
        
        'void main(){',
        
        'vec3 color = mix(colorw, colorb, abs(sin(time)) );',

        //(sqrt(2.0)/2.0) * sin( 2.0 * vUv[0] )
        //abs(2 * x - 1) (sqrt(2.0)/2.0) -- (0.02*sin(vUv[0])
        //[0] vertical and [1] horizontal

        'float v_x = sin( vUv[0] ) + 0.05*sin(vUv[0]) ;',

        'float v_var = abs( 2.0 * v_x - 1.0 );',

        'gl_FragColor = vec4( ( 1.0 - v_var  ) ,  ( 1.0 - v_var ), 1.0, 1.0);',


        '}'

    ].join( '\n' )
    

};
Shaders.LabShader2 = {

    name : "Shader",
    
    uniforms: {

        'time': { type: 'f', value: 0}
    },

    vertexShader: [

        'attribute vec4 a_position;',

        'uniform vec4 u_offset;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',

        'void main(){',        
        
        'vUv = uv;',
        
        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        'v_color = gl_Position * 0.5 + 0.5;',

        '}'

        ].join( '\n' ),

    fragmentShader: [

        'uniform float time;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',
        
        'vec3 colorw = vec3(1.0, 1.0, 1.0);',

        'vec3 colorb = vec3(0.0, 0.0, 1);',
        
        'void main(){',
        
        'vec3 color = mix(colorw, colorb, abs(sin(time)) );',

        //abs(2 * x - 1)
        //[0] vertical and [1] horizontal

        'float v_var = abs( sin( (vUv[0] * 16.0)) );',

        'gl_FragColor = vec4( ( 1.0 - v_var  ) ,  ( 1.0 - v_var ), 1.0, 1.0);',


        '}'

    ].join( '\n' )
    

};
Shaders.LabShader3 = {

    name : "Shader",
    
    uniforms: {

        'time': { type: 'f', value: 0}
    },

    vertexShader: [

        'attribute vec4 a_position;',

        'uniform vec4 u_offset;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',

        'void main(){',        
        
        'vUv = uv;',
        
        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        'v_color = gl_Position * 0.5 + 0.5;',

        '}'

        ].join( '\n' ),

    fragmentShader: [

        'uniform float time;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',
        
        'vec3 colorw = vec3(1.0, 1.0, 1.0);',

        'vec3 colorb = vec3(0.0, 0.0, 1);',
        
        'void main(){',
        
        'vec3 color = mix(colorw, colorb, abs(sin(time)) );',

        //abs(2 * x - 1)
        //[0] vertical and [1] horizontal

        'float v_x = sin( vUv[0] ) + 0.05*sin(vUv[0]) ;',

        'float v_var = abs( 2.0 * v_x - 1.0 );',

        'float v_var_2 = abs(cos(time));',

        'float v_var_3 = (v_var - v_var_2);',

        'float v_var_4 = (1.0 - floor(v_var_3 + 1.1));',

        'gl_FragColor = vec4( v_var_4 ,  v_var_4, 1.0, 1.0);',


        '}'

    ].join( '\n' )

};
Shaders.LabShader4 = {

    name : "Shader",
    
    uniforms: {

        'time': { type: 'f', value: 0}
    },

    vertexShader: [

        'attribute vec4 a_position;',

        'uniform vec4 u_offset;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',

        'void main(){',        
        
        'vUv = uv;',
        
        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        'v_color = gl_Position * 0.5 + 0.5;',

        '}'

        ].join( '\n' ),

    fragmentShader: [

        'uniform float time;',

        'varying vec2 vUv;',

        'varying vec4 v_color;',
        
        'vec3 colorw = vec3(1.0, 1.0, 1.0);',

        'vec3 colorb = vec3(0.0, 0.0, 1.0);',

        'float mod2 (float x) { return x - (2.0 * floor(x/2.0));}',
        
        'void main(){',
        
        'vec3 color = mix(colorw, colorb, abs(sin(time)) );',

        //abs(2 * x - 1)
        //[0] vertical and [1] horizontal

        'float v_var_2 = ( abs( sin(  time + ( (vUv[1] * 100.0) ) ) ) / 75.0) * 1.0;',
        
        'float v_var = abs( sin( ( ( vUv[0] + v_var_2 ) * 32.0 ) ) );',

        'float v_var_3 = v_var;',

        'float v_var_4 = 1.0 - floor(v_var_3 + 0.5);',

        'gl_FragColor = vec4( v_var_4, v_var_4, 1.0, 1.0);',


        '}'

    ].join( '\n' )

};