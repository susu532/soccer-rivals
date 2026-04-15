import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

loader.load('/Cristiano_Ronaldo.glb', (gltf) => {
  console.log('Anim 0 tracks:', gltf.animations[0].tracks.slice(0, 3).map(t => t.name).join(', '));
  console.log('Anim 1 tracks:', gltf.animations[1].tracks.slice(0, 3).map(t => t.name).join(', '));
  console.log('Anim 2 tracks:', gltf.animations[2].tracks.slice(0, 3).map(t => t.name).join(', '));
  console.log('Anim 3 tracks:', gltf.animations[3].tracks.slice(0, 3).map(t => t.name).join(', '));
});
