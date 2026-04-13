/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { PlayerState } from '../store';
import { soundManager } from '../utils/audio';

export const CHARACTERS: Record<string, { url: string; scale: number; yOffset: number; rotationOffset: [number, number, number]; animations: { idle: string; run: string; jump: string; kick: string } }> = {
  robot: {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    scale: 0.4,
    yOffset: -1.0,
    rotationOffset: [0, 0, 0],
    animations: { idle: 'Idle', run: 'Running', jump: 'Jump', kick: 'Punch' }
  },
  soldier: {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb',
    scale: 1.2,
    yOffset: -1.0,
    rotationOffset: [0, Math.PI, 0], // Soldier usually faces opposite
    animations: { idle: 'Idle', run: 'Run', jump: 'Run', kick: 'Idle' }
  },
  fox: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
    scale: 0.01, // Further increased scale
    yOffset: -0.5, // Adjusted yOffset to prevent burying
    rotationOffset: [0, 0, 0], // Reset rotation to see if it's better
    animations: { idle: 'Survey', run: 'Run', jump: 'Walk', kick: 'Survey' }
  }
};

export function Player({ state, isMe }: { state: PlayerState; isMe: boolean }) {
  const outerGroup = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const characterConfig = CHARACTERS[state.character] || CHARACTERS['robot'];
  const { scene, animations } = useGLTF(characterConfig.url);
  
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    return clone;
  }, [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Only clone material if we haven't already
        if (!mesh.userData.materialCloned) {
          mesh.material = (mesh.material as THREE.Material).clone();
          mesh.userData.materialCloned = true;
        }
        if (mesh.material && 'color' in mesh.material) {
           (mesh.material as THREE.MeshStandardMaterial).color.set(state.color);
        }
      }
    });
  }, [clonedScene, state.color]);

  const clonedSceneRef = useMemo(() => ({ current: clonedScene }), [clonedScene]);
  const { actions, names } = useAnimations(animations, clonedSceneRef);
  const [isKicking, setIsKicking] = useState(false);
  const lastKickRef = useRef(state.lastKickTime);
  const lastJumpRef = useRef(state.lastJumpTime);
  const tempVec = useRef(new THREE.Vector3());
  const tempQuat = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (group.current) {
      group.current.scale.set(characterConfig.scale, characterConfig.scale, characterConfig.scale);
      group.current.position.y = characterConfig.yOffset;
      group.current.rotation.set(...characterConfig.rotationOffset);
    }
  }, [characterConfig]);

  // Check for new kicks
  useEffect(() => {
    if (state.lastKickTime > lastKickRef.current) {
      lastKickRef.current = state.lastKickTime;
      setIsKicking(true);
      soundManager.playKick();
      
      // Reset kicking state after animation duration (approx 0.5s)
      const timer = setTimeout(() => {
        setIsKicking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.lastKickTime]);

  // Check for new jumps
  useEffect(() => {
    if (state.lastJumpTime > lastJumpRef.current) {
      lastJumpRef.current = state.lastJumpTime;
      soundManager.playJump();
    }
  }, [state.lastJumpTime]);

  // Determine animation based on velocity and kicking state
  const speed = Math.sqrt(state.velocity[0] ** 2 + state.velocity[2] ** 2);
  const isJumping = state.position[1] > 1.5 || Math.abs(state.velocity[1]) > 2;

  let actionName = characterConfig.animations.idle;
  if (isKicking) {
    actionName = characterConfig.animations.kick;
  } else if (isJumping) {
    actionName = characterConfig.animations.jump;
  } else if (speed > 0.5) {
    actionName = characterConfig.animations.run;
  }

  // Fallback if animation name doesn't exist
  const finalActionName = actions[actionName] ? actionName : (names[0] || '');

  useEffect(() => {
    if (finalActionName && actions[finalActionName]) {
      const action = actions[finalActionName];
      action?.reset().fadeIn(0.1).play();
      
      // If it's a punch or jump, we don't want it to loop
      if (finalActionName === characterConfig.animations.kick || finalActionName === characterConfig.animations.jump) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      
      return () => {
        action?.fadeOut(0.1);
      };
    }
  }, [actions, finalActionName, characterConfig]);

  useFrame(() => {
    if (outerGroup.current) {
      // Interpolate position and rotation for smoothness
      tempVec.current.set(...state.position);
      outerGroup.current.position.lerp(tempVec.current, 0.2);
      
      tempQuat.current.set(...state.rotation);
      outerGroup.current.quaternion.slerp(tempQuat.current, 0.2);
    }
  });

  return (
    <group ref={outerGroup}>
      <group ref={group} dispose={null}>
        <primitive object={clonedScene} />
      </group>
      
      <Html
        position={[0, 2.8, 0]}
        center
        distanceFactor={10}
        occlude
        zIndexRange={[0, 10]}
      >
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className={`px-4 py-1.5 rounded-full border-2 backdrop-blur-md shadow-2xl flex items-center gap-2 whitespace-nowrap transition-all ${
            isMe ? 'bg-vibrant-yellow/20 border-vibrant-yellow' : 'bg-black/60 border-white/20'
          }`}>
            <span className={`text-sm font-black italic uppercase tracking-tighter ${
              isMe ? 'text-vibrant-yellow' : 'text-white'
            }`}>
              {state.name}
            </span>
            {isMe && (
              <div className="w-2 h-2 bg-vibrant-yellow rounded-full animate-pulse shadow-[0_0_10px_#ffff00]" />
            )}
          </div>
          {/* Team Indicator Arrow */}
          <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mt-[-2px] ${
            isMe ? 'border-t-vibrant-yellow' : 'border-t-white/20'
          }`} />
        </div>
      </Html>
      
      {isMe && (
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </group>
  );
}

Object.values(CHARACTERS).forEach(config => {
  useGLTF.preload(config.url);
});


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
