import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

test('should be two players', () => {
  const gameController = new GameController(new GamePlay(), new GameStateService());
  /* eslint-disable */
  const result = gameController.gameState.getAllPositions(gameController.gameState.userTeam, gameController.gameState.compTeam).length;
  expect(result).toBe(2);
});

test('should be  one players', () => {
  const gameController = new GameController(new GamePlay(), new GameStateService());
  /* eslint-disable */
  const result = gameController.gameState.getAllPositions(undefined, gameController.gameState.compTeam).length;
  expect(result).toBe(1);
});

test('should be one players', () => {
  const gameController = new GameController(new GamePlay(), new GameStateService());
  const result = gameController.gameState.getAllPositions(gameController.gameState.userTeam).length;
  expect(result).toBe(1);
});

test('should up attack', () => {
  const gameController = new GameController(new GamePlay(), new GameStateService());
  gameController.gameState.upAttackDefence(10, 10);
  const result = gameController.gameState.upAttackDefence(10, 10);
  expect(result).toBe(10);
});

test.each([
  [{
    type: 'vampire', level: 4, attack: 25, defence: 25, health: 50,
  },
  '\u{1F396}4 \u269425 \u{1F6E1}25 \u276450'],
])(('should get message about character'), (player, expected) => {
  const gameController = new GameController(new GamePlay(), new GameStateService());
  const result = gameController.gameState.getInfo(player);
  expect(result).toBe(expected);
});
