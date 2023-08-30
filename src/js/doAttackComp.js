export default async function doAttackComp(obj) {
  /* eslint-disable */
  const { gameState, gamePlay } = obj;
  const activeComp = getStrongestCharacter(gameState.compTeam);
  gameState.activeChar = activeComp;
  obj.reactOnClick(activeComp, activeComp.position, [
    "daemon",
    "undead",
    "vampire",
  ]);

  const userPosition = gameState.getUserPosition();

  if (userPosition !== undefined) {
    const responseDoDamage = await obj.doDamage(userPosition);
    if (responseDoDamage) {
      checkAndEndGameIfNecessary(gameState, gamePlay);
      gamePlay.redrawPositions(gameState.getAllPlayer());
    }
  } else {
    moveToRandomPosition(activeComp, gameState);
    gamePlay.redrawPositions(gameState.getAllPlayer());
  }

  gameState.activeChar = undefined;
  obj.reset();

  return true;
}

function getStrongestCharacter(team) {
  return team.reduce((acc, curr) =>
    acc.character.attack > curr.character.attack ? acc : curr
  );
}

function checkAndEndGameIfNecessary(gameState, gamePlay) {
  if (gameState.userTeam.length === 0) {
    gameState.block = true;
    gamePlay.showModalMessage("You lose!", "129335");
  }
}

function moveToRandomPosition(character, gameState) {
  let rand;
  let isPlayer;
  do {

    rand = Math.floor(Math.random() * gameState.transitionCells.length);
    const potentialPosition = gameState.transitionCells[rand];
    isPlayer = gameState.getAllPlayer().find((o) => o.position === potentialPosition);
  } while (isPlayer);

  character.position = gameState.transitionCells[rand];
}
