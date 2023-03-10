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
      }
      obj.gamePlay.redrawPositions(obj.gameState.allPlayer);
    }
  } else {
    activeComp.position = obj.gameState.transitionCells[0];
    obj.gamePlay.redrawPositions(obj.gameState.allPlayer);
  }

  obj.reset();
  return true;
}
