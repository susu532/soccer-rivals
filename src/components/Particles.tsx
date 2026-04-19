/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function DustTrail({ active, position, color = '#ffffff' }: { active: boolean; position: [number, number, number]; color?: string }) {
  const particles = useRef<Particle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempVel = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Emit new particles
    if (active && Math.random() > 0.5) {
      particles.current.push({
        position: new THREE.Vector3(position[0], position[1] - 0.4, position[2]),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          Math.random() * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 0.05 + Math.random() * 0.1,
        color: color
      });
    }

    // Update particles
    let aliveCount = 0;
    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      p.life += delta;
      tempVel.current.copy(p.velocity).multiplyScalar(delta);
      p.position.add(tempVel.current);
      p.velocity.y -= 0.1 * delta; // slight gravity
      if (p.life < p.maxLife) {
        particles.current[aliveCount++] = p;
      }
    }
    particles.current.length = aliveCount;

    // Update instanced mesh
    const maxCount = 100;
    meshRef.current.count = Math.min(particles.current.length, maxCount);
    particles.current.forEach((p, i) => {
      if (i >= maxCount) return;
      const scale = p.size * (1 - p.life / p.maxLife);
      dummy.position.copy(p.position);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 100]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

export function BurstEffect({ position, color = '#ffffff', count = 20, trigger = 0 }: { position: [number, number, number]; color?: string; count?: number; trigger: number }) {
  const particles = useRef<Particle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lastTrigger = useRef(trigger);
  const tempVel = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Trigger burst
    if (trigger > lastTrigger.current) {
      for (let i = 0; i < count; i++) {
        particles.current.push({
          position: new THREE.Vector3(...position),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            Math.random() * 10,
            (Math.random() - 0.5) * 10
          ),
          life: 0,
          maxLife: 0.4 + Math.random() * 0.4,
          size: 0.1 + Math.random() * 0.2,
          color: color
        });
      }
      lastTrigger.current = trigger;
    }

    // Update particles
    let aliveCount = 0;
    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      p.life += delta;
      tempVel.current.copy(p.velocity).multiplyScalar(delta);
      p.position.add(tempVel.current);
      p.velocity.y -= 9.8 * delta; // gravity
      if (p.life < p.maxLife) {
        particles.current[aliveCount++] = p;
      }
    }
    particles.current.length = aliveCount;

    // Update instanced mesh
    const maxCount = 500;
    meshRef.current.count = Math.min(particles.current.length, maxCount);
    particles.current.forEach((p, i) => {
      if (i >= maxCount) return;
      const scale = p.size * (1 - p.life / p.maxLife);
      dummy.position.copy(p.position);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 500]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.8} />
    </instancedMesh>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
