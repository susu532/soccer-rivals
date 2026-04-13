import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

export function PlayerIndicators() {
  const { camera, size } = useThree();
  const myId = useGameStore((state) => state.myId);
  
  // Create refs for the indicator DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorsRef = useRef<Record<string, HTMLDivElement>>({});

  useEffect(() => {
    // Create a container for the indicators
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';
    container.style.zIndex = '10';
    document.body.appendChild(container);
    containerRef.current = container;

    return () => {
      if (containerRef.current) {
        document.body.removeChild(containerRef.current);
      }
    };
  }, []);

  useFrame(() => {
    if (!containerRef.current || !myId) return;

    const gameState = useGameStore.getState().gameState;
    const myPlayer = gameState.players[myId];
    if (!myPlayer) return;

    const myTeam = myPlayer.team;
    const players = gameState.players;

    // Keep track of which indicators we need this frame
    const activeIds = new Set<string>();

    for (const [id, player] of Object.entries(players)) {
      // Only show for me and my teammates
      if (id !== myId && player.team !== myTeam) continue;

      const pos = new THREE.Vector3(player.position[0], player.position[1] + 1, player.position[2]);
      
      // Project 3D position to 2D screen space
      pos.project(camera);

      // Check if the player is behind the camera or outside the screen bounds
      const isBehind = pos.z > 1;
      const isOffScreen = pos.x < -1 || pos.x > 1 || pos.y < -1 || pos.y > 1 || isBehind;

      if (isOffScreen) {
        activeIds.add(id);

        let indicator = indicatorsRef.current[id];
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.style.position = 'absolute';
          indicator.style.width = '40px';
          indicator.style.height = '40px';
          indicator.style.transformOrigin = '50% 50%';
          indicator.style.display = 'flex';
          indicator.style.flexDirection = 'column';
          indicator.style.alignItems = 'center';
          indicator.style.justifyContent = 'center';
          indicator.style.pointerEvents = 'none';
          
          const arrow = document.createElement('div');
          arrow.className = 'indicator-arrow';
          arrow.style.width = '0';
          arrow.style.height = '0';
          arrow.style.borderLeft = '10px solid transparent';
          arrow.style.borderRight = '10px solid transparent';
          
          // Me: Yellow, Teammate: Team color
          const color = id === myId ? '#fbbf24' : (myTeam === 'red' ? '#ef4444' : '#3b82f6');
          arrow.style.borderBottom = `15px solid ${color}`;
          arrow.style.transformOrigin = '50% 50%';
          arrow.style.filter = 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))';
          
          // Add a small label
          const label = document.createElement('div');
          label.textContent = id === myId ? 'ME' : player.name.substring(0, 3).toUpperCase();
          label.style.color = 'white';
          label.style.fontSize = '10px';
          label.style.fontWeight = 'bold';
          label.style.textShadow = '1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black';
          label.style.marginTop = '2px';

          indicator.appendChild(arrow);
          indicator.appendChild(label);

          containerRef.current.appendChild(indicator);
          indicatorsRef.current[id] = indicator;
        }

        // Calculate position on the edge of the screen
        let x = pos.x;
        let y = pos.y;

        // If behind camera, invert x and y to point in the correct direction
        if (isBehind) {
          x = -x;
          y = -y;
        }

        // Normalize to get direction
        const angle = Math.atan2(y, x);
        
        // Find intersection with screen edge
        // Screen coordinates are -1 to 1
        const absX = Math.abs(x);
        const absY = Math.abs(y);
        
        let edgeX, edgeY;
        
        if (absX > absY) {
          edgeX = Math.sign(x);
          edgeY = y / absX;
        } else {
          edgeX = x / absY;
          edgeY = Math.sign(y);
        }

        // Convert from normalized device coordinates (-1 to 1) to pixel coordinates (0 to width/height)
        // Add some padding from the edge
        const padding = 30;
        const screenX = (edgeX * 0.5 + 0.5) * size.width;
        const screenY = (-edgeY * 0.5 + 0.5) * size.height; // Y is inverted in screen space

        // Clamp to screen with padding
        const finalX = Math.max(padding, Math.min(size.width - padding, screenX));
        const finalY = Math.max(padding, Math.min(size.height - padding, screenY));

        // Calculate rotation for the arrow to point outward
        // The arrow points UP by default (border-bottom).
        // We want it to point towards the edge.
        const rotation = -angle + Math.PI / 2;

        indicator.style.left = `${finalX}px`;
        indicator.style.top = `${finalY}px`;
        indicator.style.transform = `translate(-50%, -50%)`;
        
        const arrow = indicator.querySelector('.indicator-arrow') as HTMLDivElement;
        if (arrow) {
          arrow.style.transform = `rotate(${rotation}rad)`;
        }
      }
    }

    // Remove indicators for players that are no longer off-screen or left the game
    for (const id in indicatorsRef.current) {
      if (!activeIds.has(id)) {
        const indicator = indicatorsRef.current[id];
        if (indicator && indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
        delete indicatorsRef.current[id];
      }
    }
  });

  return null;
}
