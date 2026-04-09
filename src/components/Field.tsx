import { Box, Cylinder } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export function Field() {
  const fieldWidth = 30;
  const fieldLength = 40;
  const goalWidth = 8;
  const goalDepth = 2;
  const goalHeight = 3;
  const postRadius = 0.12;

  // Create a striped grass texture programmatically
  const grassTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#1a472a'; // Dark green
      context.fillRect(0, 0, 512, 512);
      context.fillStyle = '#1e5331'; // Slightly lighter green
      for (let i = 0; i < 512; i += 64) {
        context.fillRect(0, i, 512, 32);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(fieldWidth / 4, fieldLength / 4);
    tex.anisotropy = 16;
    return tex;
  }, []);

  // Create a net texture
  const netTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'rgba(255, 255, 255, 0)';
      context.fillRect(0, 0, 64, 64);
      context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(64, 64);
      context.moveTo(64, 0);
      context.lineTo(0, 64);
      context.stroke();
      
      context.beginPath();
      context.rect(0, 0, 64, 64);
      context.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  }, []);

  return (
    <group>
      {/* Soccer Pitch Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[fieldWidth + 10, fieldLength + 10]} />
        <meshStandardMaterial map={grassTexture} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Field Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[fieldWidth, fieldLength]} />
        <meshBasicMaterial color="#ffffff" wireframe={false} transparent opacity={0} />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(fieldWidth, fieldLength)]} />
          <lineBasicMaterial color="#ffffff" linewidth={3} />
        </lineSegments>
      </mesh>
      
      {/* Center Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[3.9, 4.1, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Center Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[fieldWidth, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Penalty Areas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -fieldLength / 2 + 3]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial color="#ffffff" wireframe={false} transparent opacity={0} />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(12, 6)]} />
          <lineBasicMaterial color="#ffffff" linewidth={3} />
        </lineSegments>
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, fieldLength / 2 - 3]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial color="#ffffff" wireframe={false} transparent opacity={0} />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(12, 6)]} />
          <lineBasicMaterial color="#ffffff" linewidth={3} />
        </lineSegments>
      </mesh>

      {/* Stadium Walls */}
      {/* North Wall */}
      <group position={[0, 2, -fieldLength / 2 - 4]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[fieldWidth + 8, 4, 1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.51]}>
          <planeGeometry args={[fieldWidth, 1]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* South Wall */}
      <group position={[0, 2, fieldLength / 2 + 4]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[fieldWidth + 8, 4, 1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[fieldWidth, 1]} />
          <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* East Wall */}
      <group position={[fieldWidth / 2 + 4, 2, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 4, fieldLength + 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[fieldLength, 1]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
      </group>
      {/* West Wall */}
      <group position={[-fieldWidth / 2 - 4, 2, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 4, fieldLength + 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[fieldLength, 1]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Goals */}
      {/* Blue Team Goal (North) */}
      <group position={[0, 0, -fieldLength / 2]}>
        {/* Left Post */}
        <Cylinder position={[-goalWidth / 2, goalHeight / 2, 0]} args={[postRadius, postRadius, goalHeight, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#00ffff" metalness={0.8} roughness={0.2} emissive="#00ffff" emissiveIntensity={0.2} />
        </Cylinder>
        {/* Right Post */}
        <Cylinder position={[goalWidth / 2, goalHeight / 2, 0]} args={[postRadius, postRadius, goalHeight, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#00ffff" metalness={0.8} roughness={0.2} emissive="#00ffff" emissiveIntensity={0.2} />
        </Cylinder>
        {/* Crossbar */}
        <Cylinder position={[0, goalHeight, 0]} rotation={[0, 0, Math.PI / 2]} args={[postRadius, postRadius, goalWidth + postRadius * 2, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#00ffff" metalness={0.8} roughness={0.2} emissive="#00ffff" emissiveIntensity={0.2} />
        </Cylinder>
        
        {/* Net */}
        <mesh position={[0, goalHeight / 2, -goalDepth]} receiveShadow>
          <planeGeometry args={[goalWidth, goalHeight]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[-goalWidth / 2, goalHeight / 2, -goalDepth / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[goalDepth, goalHeight]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[goalWidth / 2, goalHeight / 2, -goalDepth / 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[goalDepth, goalHeight]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, goalHeight, -goalDepth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[goalWidth, goalDepth]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* Inner Goal Area Indicator */}
        <mesh position={[0, 0.01, -goalDepth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[goalWidth, goalDepth]} />
          <meshStandardMaterial color="#00ffff" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Red Team Goal (South) */}
      <group position={[0, 0, fieldLength / 2]}>
        {/* Left Post */}
        <Cylinder position={[-goalWidth / 2, goalHeight / 2, 0]} args={[postRadius, postRadius, goalHeight, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#ff007f" metalness={0.8} roughness={0.2} emissive="#ff007f" emissiveIntensity={0.2} />
        </Cylinder>
        {/* Right Post */}
        <Cylinder position={[goalWidth / 2, goalHeight / 2, 0]} args={[postRadius, postRadius, goalHeight, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#ff007f" metalness={0.8} roughness={0.2} emissive="#ff007f" emissiveIntensity={0.2} />
        </Cylinder>
        {/* Crossbar */}
        <Cylinder position={[0, goalHeight, 0]} rotation={[0, 0, Math.PI / 2]} args={[postRadius, postRadius, goalWidth + postRadius * 2, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#ff007f" metalness={0.8} roughness={0.2} emissive="#ff007f" emissiveIntensity={0.2} />
        </Cylinder>
        
        {/* Net */}
        <mesh position={[0, goalHeight / 2, goalDepth]} receiveShadow>
          <planeGeometry args={[goalWidth, goalHeight]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[-goalWidth / 2, goalHeight / 2, goalDepth / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[goalDepth, goalHeight]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[goalWidth / 2, goalHeight / 2, goalDepth / 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[goalDepth, goalHeight]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, goalHeight, goalDepth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[goalWidth, goalDepth]} />
          <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* Inner Goal Area Indicator */}
        <mesh position={[0, 0.01, goalDepth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[goalWidth, goalDepth]} />
          <meshStandardMaterial color="#ff007f" transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}
