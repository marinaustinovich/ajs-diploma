import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

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
