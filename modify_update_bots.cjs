const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'server', 'src', 'index.ts');
let content = fs.readFileSync(targetFile, 'utf8');

const updateBotsOriginal = `function updateBots(room: Room) {
  if (room.botIds.length === 0) return;

  const ballPos = room.ballBody.position;
  // Make bots generally slower to react in standard non-training matches 
  // (30 ticks = 0.5s delay, 45 ticks = 0.75s delay)
  const reactionDelay = room.isTraining ? 
    (room.difficulty === 'easy' ? 30 : room.difficulty === 'medium' ? 15 : 5) : 45;

  // Group bots by team`;

const updateBotsReplacement = `function updateBots(room: Room) {
  if (room.botIds.length === 0) return;

  const ballPos = room.ballBody.position;

  if (room.isTraining) {
    const reactionDelay = room.difficulty === 'easy' ? 30 : room.difficulty === 'medium' ? 15 : 5;
    for (const botId of room.botIds) {
      const botBody = room.playerBodies[botId];
      const botState = room.gameState.players[botId];
      if (!botBody || !botState) continue;

      if (room.ticks % reactionDelay !== 0) continue;

      const input = room.playerInputs[botId];
      const opponentGoalZ = botState.team === 'red' ? -20 : 20;

      const toBallX = ballPos.x - botBody.position.x;
      const toBallZ = ballPos.z - botBody.position.z;
      const distToBall = Math.sqrt(toBallX * toBallX + toBallZ * toBallZ);

      let targetX = ballPos.x;
      let targetZ = ballPos.z;

      const isBallBehind = botState.team === 'red' ? (ballPos.z > botBody.position.z + 1) : (ballPos.z < botBody.position.z - 1);

      if (isBallBehind) {
        targetZ = ballPos.z + (botState.team === 'red' ? 3 : -3);
        if (Math.abs(toBallX) < 2) {
          targetX = ballPos.x + (toBallX > 0 ? -3 : 3);
        }
      }

      const dirX = targetX - botBody.position.x;
      const dirZ = targetZ - botBody.position.z;
      const dist = Math.sqrt(dirX * dirX + dirZ * dirZ);

      if (dist > 0.5) {
        input.x = dirX / dist;
        input.z = dirZ / dist;
      } else {
        input.x = 0;
        input.z = 0;
      }

      if (distToBall < 2.5) {
        const toGoalX = 0 - botBody.position.x;
        const toGoalZ = opponentGoalZ - botBody.position.z;
        const dot = (toBallX * toGoalX + toBallZ * toGoalZ);
        
        if (dot > 0 || room.difficulty === 'hard') {
          input.kick = true;
          input.cameraAngle = Math.atan2(-toGoalX, -toGoalZ);
        }
      }

      if (room.difficulty === 'hard' && Math.random() < 0.01 && botBody.position.y < 1.1) {
        input.jump = true;
      }
    }
    return;
  }

  // Make bots generally slower to react in standard non-training matches 
  // (30 ticks = 0.5s delay, 45 ticks = 0.75s delay)
  const reactionDelay = 45;

  // Group bots by team`;

content = content.replace(updateBotsOriginal, updateBotsReplacement);
fs.writeFileSync(targetFile, content);
console.log('Modified updateBots logic successfully');
