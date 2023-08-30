import GameController from '../GameController';
import GamePlay from '../GamePlay';

jest.mock('../GameState', () => jest.fn().mockImplementation(() => {}));

jest.mock('../GamePlay', () => {
  const originalModule = jest.requireActual('../GamePlay');
  class MockGamePlay extends originalModule {
    showModalMessage = jest.fn();
  }
  return MockGamePlay;
});

describe('GameController initialization', () => {
  test('should initialize GameController with provided parameters', () => {
    const mockGamePlay = {};
    const mockStateService = {};
    const controller = new GameController(mockGamePlay, mockStateService);

    expect(controller.gamePlay).toBe(mockGamePlay);
    expect(controller.stateService).toBe(mockStateService);
    expect(controller.gameState).toBeDefined();
  });
});

describe('GameController newGame method', () => {
  test('should reset the game state', () => {
    const mockGamePlay = { redrawPositions: jest.fn() };
    const mockStateService = {};
    const controller = new GameController(mockGamePlay, mockStateService);
    controller.gameState = {
      history: [],
      block: true,
      levelGame: 2,
      points: 100,
      countClick: 3,
      initNewTeams: jest.fn(),
    };
    controller.reset = jest.fn();
    controller.updatePicture = jest.fn();

    controller.newGame();

    expect(controller.gameState.history.length).toBe(1);
    expect(controller.gameState.block).toBeFalsy();
    expect(controller.gameState.levelGame).toBe(1);
    expect(controller.gameState.points).toBe(0);
    expect(controller.gameState.countClick).toBe(0);
    expect(controller.gameState.initNewTeams).toHaveBeenCalled();
    expect(controller.reset).toHaveBeenCalled();
    expect(controller.updatePicture).toHaveBeenCalled();
  });
});

test('should save the game state', async () => {
  const mockGamePlay = new GamePlay();
  const mockStateService = { save: jest.fn() };
  const controller = new GameController(mockGamePlay, mockStateService);
  controller.gameState = {};

  await controller.saveGame();

  expect(mockStateService.save).toHaveBeenCalledWith(controller.gameState);
  expect(mockGamePlay.showModalMessage).toHaveBeenCalledWith('Your game has saved!', '9997');
});
