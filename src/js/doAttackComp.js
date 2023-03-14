import GamePlay from './GamePlay';

export default async function doAttackComp(obj) {
  /* eslint-disable */
  const activeComp = obj.gameState.compTeam.reduce((acc, curr) => (acc.character.attack > curr.character.attack ? acc : curr));
  obj.gameState.activeChar = activeComp;
  obj.reactOnClick(activeComp, activeComp.position, ['daemon', 'undead', 'vampire']);

  let isGoal = false;
  let userPosition;
  for (const item of obj.gameState.userTeam) {
    if (obj.gameState.attackCells.includes(item.position)) {
      isGoal = true;
      userPosition = item.position;
    }
  }

  if (isGoal) {
    const responseDoDamage = await obj.doDamage(userPosition);
    if (responseDoDamage) {
      if (obj.gameState.userTeam.length === 0) {
        // stop game
        obj.gameState.block = true;
        GamePlay.showMessage('You lose!', '129335');
      }
      obj.gamePlay.redrawPositions(obj.gameState.allPlayer);
    }
  } else {
    let rand;
    let isPlayer;
    do {
      rand = Math.floor(Math.random() * obj.gameState.transitionCells.length);
      isPlayer = obj.gameState.allPlayer.find(o => o.position === rand);
    } while (isPlayer);

    activeComp.position = obj.gameState.transitionCells[rand];
    obj.gamePlay.redrawPositions(obj.gameState.allPlayer);
  }
  obj.gameState.activeChar = undefined;
  obj.reset();

  return true;
}
