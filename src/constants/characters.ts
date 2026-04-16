export type UnlockType = 'free' | 'coins' | 'ads';

export interface CharacterConfig {
  url: string;
  scale: number;
  yOffset: number;
  rotationOffset: [number, number, number];
  animations: { idle: string; run: string; jump: string; kick: string };
  isCustom?: boolean;
  unlockType: UnlockType;
  price?: number;
}

export const CHARACTERS: Record<string, CharacterConfig> = {
  robot: {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    scale: 0.4,
    yOffset: -1.0,
    rotationOffset: [0, 0, 0],
    animations: { idle: 'Idle', run: 'Running', jump: 'Jump', kick: 'Punch' },
    unlockType: 'free'
  },
  fox: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
    scale: 0.02, // Further increased scale
    yOffset: -0.8, // Adjusted yOffset to prevent burying
    rotationOffset: [0, 0, 0], // Reset rotation to see if it's better
    animations: { idle: 'Survey', run: 'Run', jump: 'Walk', kick: 'Survey' },
    unlockType: 'coins',
    price: 1200
  },
  'cristiano ronaldo': {
    url: '/Cristiano_Ronaldo.glb',
    scale: 0.032,
    yOffset: -1.0,
    rotationOffset: [0, 0, 0],
    animations: { idle: 'mixamo.com3', run: 'mixamo.com2', jump: 'mixamo.com1', kick: 'mixamo.com0' },
    isCustom: true,
    unlockType: 'ads'
  },
  kobe: {
    url: '/Kobe.glb',
    scale: 1.2,
    yOffset: -1.0,
    rotationOffset: [0, 0, 0],
    animations: { idle: 'mixamo.com0', run: 'mixamo.com2', jump: 'mixamo.com1', kick: 'mixamo.com3' },
    isCustom: true,
    unlockType: 'ads'
  },
  'lamin yamal': {
    url: '/Lamin_Yamal.glb',
    scale: 1.2,
    yOffset: -1.0,
    rotationOffset: [0, 0, 0],
    animations: { idle: 'mixamo.com0', run: 'mixamo.com3', jump: 'mixamo.com1', kick: 'mixamo.com2' },
    isCustom: true,
    unlockType: 'ads'
  }
};
