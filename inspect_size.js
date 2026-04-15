import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
import { JSDOM } from 'jsdom';

async function inspectModel(path) {
  const data = fs.readFileSync(path);
  const loader = new GLTFLoader();
  
  // Mocking browser environment for GLTFLoader
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
  global.self = global;
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
  global.Image = dom.window.Image;
  global.FileReader = dom.window.FileReader;
  global.URL = dom.window.URL;

  return new Promise((resolve, reject) => {
    loader.parse(data.buffer, '', (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      resolve({
        name: path,
        size: { x: size.x, y: size.y, z: size.z },
        center: box.getCenter(new THREE.Vector3())
      });
    }, reject);
  });
}

async function run() {
  try {
    const cr7 = await inspectModel('Cristiano_Ronaldo.glb');
    console.log('CR7:', JSON.stringify(cr7, null, 2));
    
    const robotData = await fetch('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb').then(res => res.arrayBuffer());
    const loader = new GLTFLoader();
    loader.parse(robotData, '', (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      console.log('Robot:', JSON.stringify({
        size: { x: size.x, y: size.y, z: size.z }
      }, null, 2));
    });
  } catch (e) {
    console.error(e);
  }
}

run();
