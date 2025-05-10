import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { ASCIIEffect } from "./ascii";
import { EffectComposer, EffectPass, RenderPass } from "postprocessing";

const renderer = new THREE.WebGLRenderer({
	powerPreference: "high-performance",
	antialias: true,
	stencil: true,
	depth: true,
});
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100000 );
const controls = new OrbitControls( camera, renderer.domElement );
const loader = new OBJLoader();
const composer = new EffectComposer( renderer );

const effect = new ASCIIEffect({
	characters: ` .:,'-^=*+?!|0#X%WM@`,
	fontSize: 70,
	cellSize: 10,
	color: '#ff0000',
	invert: false
});

document.addEventListener("keydown", (event) => {
	if (event.key == "q") {
		effect.uniforms.set("uCellSize", new THREE.Uniform(effect.uniforms.get("uCellSize")?.value - 10));
	} else if (event.key == "w") {
		effect.uniforms.set("uCellSize", new THREE.Uniform(effect.uniforms.get("uCellSize")?.value + 10));
	} else {
		return;
	}
});

scene.background = new THREE.Color( 0, 0, 0 );

const pointLight1 = new THREE.PointLight( 0xffffff, 3, 0, 0 );
pointLight1.position.set( 500, 500, 500 );
scene.add( pointLight1 );

const pointLight2 = new THREE.PointLight( 0xffffff, 1, 0, 0 );
pointLight2.position.set( - 500, - 500, - 500 );
scene.add( pointLight2 );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

camera.position.y = 150;
camera.position.z = 500;
controls.update();

loader.load("/Donut.obj", object => {
	scene.add(object);

	object.scale.x = 300;
	object.scale.y = 300;
	object.scale.z = 300;

	console.log("processing");
	
	 object.traverse((child) => {
		console.log(child);
		if (child.isMesh) {
			// If the OBJ has no vertex normals, generate them
			if (!child.geometry.attributes.normal) {
				child.geometry.computeVertexNormals();
			}

			child.material = new THREE.MeshStandardMaterial({
				color: 0xffffff,   // pure white
				roughness: 0.3,    // tweak to taste
				metalness: 0.0
				// flatShading: true,          // optional: low‑poly look
			});
		}
  });

	scene.add(object);
}, xhr => {
	console.log((xhr.loaded / xhr.total * 100) + "% loaded");
}, error => {
	console.error("An error happened", error);
});

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
composer.addPass(new EffectPass(camera, effect));

function animate() {
  controls.update();

  composer.render();
}