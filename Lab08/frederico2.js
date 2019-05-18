            var container, stats;

			var composerScene, composer1, composer2, composer3, composer4;

			var cameraPerspective, sceneModel, sceneBG, renderer, mesh, directionalLight;

			var width = window.innerWidth || 2;
			var height = window.innerHeight || 2;

			var halfWidth = width / 2;
			var halfHeight = height / 2;

			var renderScene;

			var delta = 0.01;

			init();
			animate();

			function init() {

				container = document.getElementById( 'container' );

				cameraPerspective = new THREE.PerspectiveCamera( 50, width / height, 1, 10000 );
				cameraPerspective.position.z = 900;

				sceneModel = new THREE.Scene();

				directionalLight = new THREE.DirectionalLight( 0xffffff );
				directionalLight.position.set( 0, - 0.1, 1 ).normalize();
				sceneModel.add( directionalLight );
				var loader = new THREE.GLTFLoader();
				loader.load( "models/gltf/LeePerrySmith/LeePerrySmith.glb", function ( gltf ) {
					
					createMesh( gltf.scene.children[ 0 ].geometry, sceneModel, 100 );
					
				} );
				/*
				var loadingManager = new THREE.LoadingManager( function () {
					sceneModel.add( elf );
				} );
				
				// collada
				var loader = new THREE.ColladaLoader( loadingManager );
				
				loader.load( './models/collada/elf/elf.dae', function ( collada ) {
					elf = collada.scene;
				} ); 
				*/

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( width, height );
				renderer.autoClear = false;

				//

				renderer.gammaInput = true;
				renderer.gammaOutput = true;

				//

				container.appendChild( renderer.domElement );

				//

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				var shaderBleach = THREE.BleachBypassShader;
				var shaderSepia = THREE.SepiaShader;
				var shaderVignette = THREE.VignetteShader;
				var shaderCopy = THREE.CopyShader;

				var effectGamma = new THREE.ShaderPass(THREE.GammaCorrectionShader);
				var effectBleach = new THREE.ShaderPass( shaderBleach );
				var effectSepia = new THREE.ShaderPass( shaderSepia );
				var effectVignette = new THREE.ShaderPass( shaderVignette );
				var effectCopy = new THREE.ShaderPass( shaderCopy );

				effectBleach.uniforms[ "opacity" ].value = 0.95;

				effectSepia.uniforms[ "amount" ].value = 0.9;

				effectVignette.uniforms[ "offset" ].value = 0.95;
				effectVignette.uniforms[ "darkness" ].value = 1.6;

				var effectBloom = new THREE.BloomPass( 1, 25, 5 );

				var clearMask = new THREE.ClearMaskPass();
				var renderMask = new THREE.MaskPass( sceneModel, cameraPerspective );
				var renderMaskInverse = new THREE.MaskPass( sceneModel, cameraPerspective );

				renderMaskInverse.inverse = true;

				//

				var rtParameters = {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					format: THREE.RGBFormat,
					stencilBuffer: true
				};

				var rtWidth = width / 2;
				var rtHeight = height / 2;

				//

				var renderModel = new THREE.RenderPass( sceneModel, cameraPerspective );

				renderModel.clear = false;

				composerScene = new THREE.EffectComposer( renderer, new THREE.WebGLRenderTarget( rtWidth * 2, rtHeight * 2, rtParameters ) );

				composerScene.addPass( renderModel );
                //composerScene.addPass( effectCopy );
                //composerScene.addPass( effectSepia );
                composerScene.addPass( effectVignette );
                //composerScene.addPass( effectBloom );
				//composerScene.addPass( effectBloom );
				//composerScene.addPass( effectGamma );

				//

				renderScene = new THREE.TexturePass( composerScene.renderTarget2.texture );

				//

				composer1 = new THREE.EffectComposer( renderer, new THREE.WebGLRenderTarget( rtWidth, rtHeight, rtParameters ) );
				composer1.addPass( renderScene );
				composer1.addPass( effectBloom );
				composer1.addPass( effectGamma );

				renderScene.uniforms[ "tDiffuse" ].value = composerScene.renderTarget2.texture;

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				halfWidth = window.innerWidth / 2;
				halfHeight = window.innerHeight / 2;

				cameraPerspective.aspect = window.innerWidth / window.innerHeight;
				cameraPerspective.updateProjectionMatrix();


				renderer.setSize( window.innerWidth, window.innerHeight );

				composerScene.setSize( halfWidth * 2, halfHeight * 2 );


				//renderScene.uniforms[ "tDiffuse" ].value = composerScene.renderTarget2.texture;

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

			//

			function animate() {

				requestAnimationFrame( animate );

				stats.begin();
				render();
				stats.end();

			}

			function render() {

				var time = Date.now() * 0.0004;
                //onWindowResize();
				//if ( mesh ) mesh.rotation.y = - time;

				renderer.setViewport( 0, 0, halfWidth * 2, halfHeight * 2 );
				composerScene.render( delta );

				//renderer.setViewport( 0, 0, halfWidth * 2, halfHeight * 2 );
				//composer1.render( delta );
			}

