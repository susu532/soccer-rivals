const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'server', 'src', 'index.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Room interface
content = content.replace(
  /  lastTouchId: string \| null;\n  secondLastTouchId: string \| null;\n}/,
  `  lastTouchId: string | null;\n  secondLastTouchId: string | null;\n  waitingTicks?: number;\n}`
);

// 2. createRoom return
content = content.replace(
  /    lastTouchId: null,\n    secondLastTouchId: null,\n  };\n}/,
  `    lastTouchId: null,\n    secondLastTouchId: null,\n    waitingTicks: 0,\n  };\n}`
);

// 3. BOT_NAMES and addBot / updateBots
const addBotOriginal = /function addBot\(room: Room, team: 'red' \| 'blue'\) {[\s\S]*?name: \`AI \(\$\{room\.difficulty\.toUpperCase\(\)\}\)\`,\n[\s\S]*?return botId;\n}\n\nfunction updateBots\(room: Room\) {\n  if \(\!room\.isTraining \|\| room\.botIds\.length === 0\) return;/;

const addBotReplacement = `const BOT_NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Charlie', 'Avery', 'Parker', 'Quinn', 'Peyton', 'Skyler', 'Dakota', 'Reese', 'Rowan', 'Hayden', 'Emerson', 'Finley', 'Mia', 'Liam', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah'];

function addBot(room: Room, team: 'red' | 'blue', isHumanLike: boolean = false) {
  const botId = \`bot_\${Math.random().toString(36).substring(2, 8)}\`;
  const color = team === 'red' ? '#ff007f' : '#00ffff';
  const startZ = team === 'red' ? 10 : -10;

  const botBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
    position: new CANNON.Vec3((Math.random() - 0.5) * 10, 1, startZ),
    material: room.playerMaterial,
    fixedRotation: true,
    linearDamping: 0.9,
  });
  room.world.addBody(botBody);
  room.playerBodies[botId] = botBody;
  room.playerInputs[botId] = { x: 0, z: 0, kick: false, jump: false, cameraAngle: 0 };
  room.botIds.push(botId);
  
  const botName = isHumanLike ? BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] : \`AI (\${room.difficulty.toUpperCase()})\`;

  room.gameState.players[botId] = {
    id: botId,
    name: botName,
    position: [botBody.position.x, botBody.position.y, botBody.position.z],
    velocity: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    color,
    team,
    score: 0,
    lastKickTime: 0,
    lastJumpTime: 0,
    character: 'robot',
    goals: 0,
    assists: 0,
    kicks: 0,
  };

  return botId;
}

function updateBots(room: Room) {
  if (room.botIds.length === 0) return;`;

content = content.replace(addBotOriginal, addBotReplacement);

// 4. joinRoom
const joinRoomOriginal = `  function joinRoom(socket: any, room: Room, name: string, worldCupCountry?: string) {\n    socket.join(room.id);`;
const joinRoomReplacement = `  function joinRoom(socket: any, room: Room, name: string, worldCupCountry?: string) {
    if (room.botIds.length > 0) {
      const maxPlayers = room.isWorldCup ? 2 : 4;
      const currentTotal = Object.keys(room.gameState.players).length;
      if (currentTotal >= maxPlayers) {
        const botIdToRemove = room.botIds[0];
        
        if (room.playerBodies[botIdToRemove]) {
          room.world.removeBody(room.playerBodies[botIdToRemove]);
          delete room.playerBodies[botIdToRemove];
        }
        delete room.playerInputs[botIdToRemove];
        delete room.gameState.players[botIdToRemove];
        room.botIds = room.botIds.filter(id => id !== botIdToRemove);
        
        io.to(room.id).emit("playerLeft", botIdToRemove);
      }
    }

    socket.join(room.id);`;
content = content.replace(joinRoomOriginal, joinRoomReplacement);

// 5. joinQueue target finding
const joinQueueFindOriginal = /const playerCount = Object\.keys\(room\.gameState\.players\)\.length;\n\s+const maxPlayers = isWorldCup \? 2 : 4;\n\s+if \(playerCount < maxPlayers && room\.gameState\.matchState !== 'gameover'\) {/;
const joinQueueFindReplacement = `const humanCount = Object.keys(room.gameState.players).filter(id => !room.botIds.includes(id)).length;
          const maxPlayers = isWorldCup ? 2 : 4;
          if (humanCount < maxPlayers && room.gameState.matchState !== 'gameover') {`;
content = content.replace(joinQueueFindOriginal, joinQueueFindReplacement);

// 6. processQueue
const processQueueOriginal = `          // Try to find a room for this queued player
          let targetRoom: Room | null = null;
          for (const room of rooms.values()) {
            if (room.id !== 'FREEPLAY' && room.id !== 'WORLD_CUP_FREEPLAY' && !room.isPrivate && room.isWorldCup === isWorldCup) {
              const playerCount = Object.keys(room.gameState.players).length;
              const maxPlayers = isWorldCup ? 2 : 4;
              if (playerCount < maxPlayers && room.gameState.matchState !== 'gameover') {
                targetRoom = room;
                break;
              }
            }
          }

          if (targetRoom) {
            const sourceRoom = isWorldCup ? worldCupFreePlayRoom : freePlayRoom;
            const name = sourceRoom.gameState.players[pid]?.name || 'Player';
            const worldCupCountry = sourceRoom.gameState.players[pid]?.worldCupCountry;
            leaveRoom(s);
            joinRoom(s, targetRoom, name, worldCupCountry);
            playersToRemove.push(pid);
          }
        }

        // Clean up queue
        for (const pid of playersToRemove) {
          const idx = queue.indexOf(pid);
          if (idx !== -1) queue.splice(idx, 1);
        }
      }

      // If still have enough for a new match
      if (queue.length >= 2) {
        const p1 = queue.shift()!;
        const p2 = queue.shift()!;
        
        const matchRoomId = generateRoomCode();
        const matchRoom = createRoom(matchRoomId, false, false, 'medium', isWorldCup);
        rooms.set(matchRoomId, matchRoom);

        const playersToMove = [p1, p2];
        const sourceRoom = isWorldCup ? worldCupFreePlayRoom : freePlayRoom;
        for (const pid of playersToMove) {
          const s = io.sockets.sockets.get(pid);
          if (s) {
            const name = sourceRoom.gameState.players[pid]?.name || 'Player';
            const worldCupCountry = sourceRoom.gameState.players[pid]?.worldCupCountry;
            leaveRoom(s);
            joinRoom(s, matchRoom, name, worldCupCountry);
          }
        }
      }`;
const processQueueReplacement = `          // Try to find a room for this queued player
          let targetRoom: Room | null = null;
          for (const room of rooms.values()) {
            if (room.id !== 'FREEPLAY' && room.id !== 'WORLD_CUP_FREEPLAY' && !room.isPrivate && room.isWorldCup === isWorldCup) {
              const humanCount = Object.keys(room.gameState.players).filter(id => !room.botIds.includes(id)).length;
              const maxPlayers = isWorldCup ? 2 : 4;
              if (humanCount < maxPlayers && room.gameState.matchState !== 'gameover') {
                targetRoom = room;
                break;
              }
            }
          }

          if (targetRoom) {
            const sourceRoom = isWorldCup ? worldCupFreePlayRoom : freePlayRoom;
            const name = sourceRoom.gameState.players[pid]?.name || 'Player';
            const worldCupCountry = sourceRoom.gameState.players[pid]?.worldCupCountry;
            leaveRoom(s);
            joinRoom(s, targetRoom, name, worldCupCountry);
            playersToRemove.push(pid);
          }
        }

        // Clean up queue
        for (const pid of playersToRemove) {
          const idx = queue.indexOf(pid);
          if (idx !== -1) queue.splice(idx, 1);
        }
      }

      // If still have enough for a new match
      if (queue.length >= 1) {
        const maxPlayers = isWorldCup ? 2 : 4;
        const playersToMove = [];
        while (queue.length > 0 && playersToMove.length < maxPlayers) {
          playersToMove.push(queue.shift()!);
        }
        
        const matchRoomId = generateRoomCode();
        const matchRoom = createRoom(matchRoomId, false, false, 'medium', isWorldCup);
        rooms.set(matchRoomId, matchRoom);

        const sourceRoom = isWorldCup ? worldCupFreePlayRoom : freePlayRoom;
        for (const pid of playersToMove) {
          const s = io.sockets.sockets.get(pid);
          if (s) {
            const name = sourceRoom.gameState.players[pid]?.name || 'Player';
            const worldCupCountry = sourceRoom.gameState.players[pid]?.worldCupCountry;
            leaveRoom(s);
            joinRoom(s, matchRoom, name, worldCupCountry);
          }
        }
      }`;
content = content.replace(processQueueOriginal, processQueueReplacement);

// 7. Physics Loop updates
const physicsLoopOriginal = `    for (const room of rooms.values()) {
      room.ticks++;
      
      // Update AI if in training mode
      if (room.isTraining) {
        updateBots(room);
      }

      if (room.ticks >= TICK_RATE) {
        room.ticks = 0;
        
        if (room.gameState.matchState === 'waiting' || (room.gameState.matchState === 'freeplay' && room.id !== 'FREEPLAY')) {
          if (Object.keys(room.gameState.players).length >= 2) {
            room.gameState.matchState = 'countdown';
            room.gameState.timer = 5;
            room.gameState.message = '';
            room.gameState.score = { red: 0, blue: 0 };
            room.gameState.isOvertime = false;
            delete room.gameState.lastScorer;
            room.resetPositions();
          }
        } else if (room.gameState.matchState === 'countdown') {`;
const physicsLoopReplacement = `    for (const room of rooms.values()) {
      room.ticks++;
      
      if (room.botIds.length > 0) {
        updateBots(room);
      }

      if (room.ticks >= TICK_RATE) {
        room.ticks = 0;
        
        if (room.gameState.matchState === 'waiting' || (room.gameState.matchState === 'freeplay' && room.id !== 'FREEPLAY' && room.id !== 'WORLD_CUP_FREEPLAY')) {
          const maxPlayers = room.isWorldCup ? 2 : 4;
          const currentTotal = Object.keys(room.gameState.players).length;
          const humanCount = Object.keys(room.gameState.players).filter(id => !room.botIds.includes(id)).length;

          if (currentTotal >= maxPlayers) {
            room.gameState.matchState = 'countdown';
            room.gameState.timer = 5;
            room.gameState.message = '';
            room.gameState.score = { red: 0, blue: 0 };
            room.gameState.isOvertime = false;
            room.waitingTicks = 0;
            delete room.gameState.lastScorer;
            room.resetPositions();
          } else if (humanCount > 0 && humanCount < maxPlayers) {
            room.waitingTicks = (room.waitingTicks || 0) + TICK_RATE;
            
            if (room.waitingTicks >= 10 * TICK_RATE) {
              while (Object.keys(room.gameState.players).length < maxPlayers) {
                const teamCount = Object.values(room.gameState.players).reduce(
                  (acc, p) => { acc[p.team]++; return acc; },
                  { red: 0, blue: 0 }
                );
                const team = teamCount.red <= teamCount.blue ? 'red' : 'blue';
                addBot(room, team, true);
              }
              room.gameState.matchState = 'countdown';
              room.gameState.timer = 5;
              room.gameState.message = '';
              room.gameState.score = { red: 0, blue: 0 };
              room.gameState.isOvertime = false;
              room.waitingTicks = 0;
              delete room.gameState.lastScorer;
              room.resetPositions();
            } else {
              room.gameState.message = \`Waiting for players...\`;
            }
          } else {
            room.waitingTicks = 0;
          }
        } else if (room.gameState.matchState === 'countdown') {`;
content = content.replace(physicsLoopOriginal, physicsLoopReplacement);

fs.writeFileSync(targetFile, content);
console.log('Modified server index.ts successfully');
