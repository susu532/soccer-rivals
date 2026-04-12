/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { Trail } from '@react-three/drei';
import { soundManager } from '../utils/audio';

export function Ball() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ballState = useGameStore((state) => state.gameState.ball);
  const tempVec = useRef(new THREE.Vector3());
  const tempQuat = useRef(new THREE.Quaternion());
  const prevVelocity = useRef([...ballState.velocity]);

  useFrame(() => {
    if (meshRef.current) {
      tempVec.current.set(...ballState.position);
      meshRef.current.position.lerp(tempVec.current, 0.2);
      tempQuat.current.set(...ballState.rotation);
      meshRef.current.quaternion.slerp(tempQuat.current, 0.2);
    }
  });

  useEffect(() => {
    const [vx, vy, vz] = ballState.velocity;
    const [px, py, pz] = prevVelocity.current;
    
    const dvx = Math.abs(vx - px);
    const dvy = Math.abs(vy - py);
    const dvz = Math.abs(vz - pz);
    
    if (dvy > 5 || dvx > 5 || dvz > 5) {
      soundManager.playBounce();
    }
    
    prevVelocity.current = [...ballState.velocity];
  }, [ballState.velocity]);

  const speed = Math.sqrt(ballState.velocity[0]**2 + ballState.velocity[1]**2 + ballState.velocity[2]**2);

  // Create a modern sci-fi hexagonal ball texture programmatically
  const { map, emissiveMap } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = 512;
    emissiveCanvas.height = 512;
    const eCtx = emissiveCanvas.getContext('2d');

    if (ctx && eCtx) {
      // Base dark color
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 512, 512);
      
      eCtx.fillStyle = '#000000';
      eCtx.fillRect(0, 0, 512, 512);

      // Draw hex grid
      const hexSize = 32;
      const hexHeight = hexSize * Math.sqrt(3);
      const hexWidth = hexSize * 2;
      const vertDist = hexHeight;
      const horizDist = hexWidth * 0.75;
      
      for (let x = -hexWidth; x < 512 + hexWidth; x += horizDist) {
        for (let y = -hexHeight; y < 512 + hexHeight; y += vertDist) {
          const isOffset = Math.abs(Math.round(x / horizDist)) % 2 === 1;
          const offset = isOffset ? hexHeight / 2 : 0;
          const cx = x;
          const cy = y + offset;
          
          ctx.beginPath();
          eCtx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i;
            const angle_rad = Math.PI / 180 * angle_deg;
            const px = cx + hexSize * Math.cos(angle_rad);
            const py = cy + hexSize * Math.sin(angle_rad);
            if (i === 0) {
              ctx.moveTo(px, py);
              eCtx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
              eCtx.lineTo(px, py);
            }
          }
          ctx.closePath();
          eCtx.closePath();
          
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 4;
          ctx.stroke();
          
          // Fill some hexes with glow
          const rand = Math.random();
          if (rand > 0.85) {
            const color = rand > 0.92 ? '#ff007f' : '#00ffff';
            ctx.fillStyle = color;
            ctx.fill();
            eCtx.fillStyle = color;
            eCtx.fill();
          } else if (rand > 0.4) {
            ctx.fillStyle = '#0f172a';
            ctx.fill();
          }
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    
    const eTex = new THREE.CanvasTexture(emissiveCanvas);
    eTex.anisotropy = 16;
    
    return { map: tex, emissiveMap: eTex };
  }, []);

  return (
    <group>
      <Trail
        width={speed > 5 ? (speed > 10 ? 1.5 : 0.5) : 0}
        color={speed > 15 ? "#ff007f" : "#00ffff"}
        length={20}
        decay={1}
        local={false}
        stride={0}
        interval={1}
        target={meshRef}
      >
        <mesh ref={meshRef} castShadow receiveShadow>
          <icosahedronGeometry args={[0.5, 3]} />
          <meshStandardMaterial 
            map={map}
            emissiveMap={emissiveMap}
            emissive="#ffffff"
            emissiveIntensity={1.5}
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
      </Trail>
    </group>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
