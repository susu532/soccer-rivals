import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Field } from './Field';
import { Ball } from './Ball';
import { Player } from './Player';
import { useGameStore, PlayerState } from '../store';
import { BurstEffect, DustTrail } from './Particles';

const DEFAULT_TARGET: [number, number, number] = [0, 0, 0];

function PlayerEffects({ state }: { state: PlayerState }) {
  const speed = Math.sqrt(state.velocity[0] ** 2 + state.velocity[2] ** 2);
  const isJumping = state.position[1] > 1.5 || Math.abs(state.velocity[1]) > 2;
  
  return <DustTrail active={speed > 2 && !isJumping} position={state.position} color={state.color} />;
}

function CameraController() {
  const myId = useGameStore((state) => state.myId);
  const setCameraAngle = useGameStore((state) => state.setCameraAngle);
  const { camera, gl } = useThree();
  const rotation = useRef({ theta: 0, phi: 1.0 }); // Fixed phi for horizontal-only rotation
  const distance = 20;
  const lastUnlockTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        rotation.current.theta -= e.movementX * 0.003;
        setCameraAngle(rotation.current.theta);
      }
    };

    const handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        lastUnlockTime.current = Date.now();
      }
    };

    const handleCanvasClick = () => {
      // Browser security: wait at least 1.5s between unlock and re-lock
      if (Date.now() - lastUnlockTime.current < 1500) return;
      
      if (document.pointerLockElement !== gl.domElement) {
        try {
          const promise = gl.domElement.requestPointerLock?.() as any;
          if (promise && typeof promise.catch === 'function') {
            promise.catch((e: any) => console.warn('Pointer lock failed:', e));
          }
        } catch (e) {
          console.warn('Pointer lock failed:', e);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    gl.domElement.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      gl.domElement.removeEventListener('click', handleCanvasClick);
      
      // Ensure lock is released on unmount
      if (document.pointerLockElement === gl.domElement) {
        // Use a try-catch because exitPointerLock can sometimes fail if element is already gone
        try {
          document.exitPointerLock?.();
        } catch (e) {
          console.warn('Failed to exit pointer lock on unmount', e);
        }
      }
    };
  }, [setCameraAngle, gl.domElement]);

  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    const gameState = useGameStore.getState().gameState;
    const playerPos = myId && gameState.players[myId] 
      ? gameState.players[myId].position 
      : DEFAULT_TARGET;
      
    const ballPos = gameState.ball.position;
    target.current.set(
      (playerPos[0] + ballPos[0]) / 2,
      0,
      (playerPos[2] + ballPos[2]) / 2
    );

    // Calculate camera position based on spherical coordinates
    const x = distance * Math.sin(rotation.current.phi) * Math.sin(rotation.current.theta);
    const y = distance * Math.cos(rotation.current.phi);
    const z = distance * Math.sin(rotation.current.phi) * Math.cos(rotation.current.theta);

    camera.position.set(target.current.x + x, target.current.y + y, target.current.z + z);
    camera.lookAt(target.current);
  });

  return null;
}

function GlobalEffects() {
  const [kickTrigger, setKickTrigger] = useState(0);
  const [goalTrigger, setGoalTrigger] = useState(0);
  const [goalPos, setGoalPos] = useState<[number, number, number]>([0, 0, 0]);
  
  const lastKickTimes = useRef<Record<string, number>>({});
  const lastMatchState = useRef<string>('');

  useFrame(() => {
    const state = useGameStore.getState().gameState;
    const players = state.players;
    const matchState = state.matchState;
    const ballPos = state.ball.position;

    // Check for kicks
    let maxKickTime = 0;
    Object.values(players).forEach(p => {
      if (p.lastKickTime > (lastKickTimes.current[p.id] || 0)) {
        maxKickTime = Math.max(maxKickTime, p.lastKickTime);
        lastKickTimes.current[p.id] = p.lastKickTime;
      }
    });
    
    if (maxKickTime > 0 && maxKickTime !== kickTrigger) {
      setKickTrigger(maxKickTime);
    }

    // Check for goals
    if (matchState === 'goal' && lastMatchState.current !== 'goal') {
      setGoalTrigger(Date.now());
      setGoalPos([...ballPos]);
    }
    lastMatchState.current = matchState;
  });

  const players = useGameStore((state) => state.gameState.players);

  return (
    <>
      <BurstEffect trigger={kickTrigger} position={useGameStore.getState().gameState.ball.position} color="#ffff00" count={20} />
      <BurstEffect trigger={goalTrigger} position={goalPos} color="#ff007f" count={150} />
      {Object.values(players).map(p => (
        <PlayerEffects key={p.id} state={p} />
      ))}
    </>
  );
}

export function Scene() {
  const gameState = useGameStore((state) => state.gameState);
  const myId = useGameStore((state) => state.myId);

  return (
    <Canvas 
      shadows={{ type: THREE.PCFShadowMap }} 
      camera={{ position: [0, 15, 20], fov: 45 }}
      dpr={[1, 2]} // Limit pixel ratio to 2 for performance
      performance={{ min: 0.5 }} // Allow dynamic scaling
      gl={{ 
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false
      }}
    >
      <color attach="background" args={["#87ceeb"]} />
      <fog attach="fog" args={["#87ceeb", 30, 100]} />
      <Sky sunPosition={[100, 20, 100]} turbidity={0.3} rayleigh={0.5} />
      
      <ambientLight intensity={0.8} color="#ffffff" />
      
      {/* Main Sun Light */}
      <directionalLight
        castShadow
        position={[50, 50, 30]}
        intensity={1.5}
        color="#fff5b6"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />

      {/* Fill Light */}
      <directionalLight
        position={[-50, 30, -30]}
        intensity={0.5}
        color="#aaccff"
      />

      {/* Stadium Lights (Decorative/Fill) */}
      <pointLight position={[20, 15, -20]} intensity={1.5} color="#ffffff" distance={50} />
      <pointLight position={[-20, 15, 20]} intensity={1.5} color="#ffffff" distance={50} />

      <Field />
      <Ball />
      <Environment preset="apartment" />
      
      {Object.values(gameState.players).map((player) => (
        <Player key={player.id} state={player} isMe={player.id === myId} />
      ))}

      <GlobalEffects />
      <CameraController />
    </Canvas>
  );
}
