import GameStateService from '../GameStateService';

const stateService = new GameStateService({});

beforeEach(() => {
  jest.clearAllMocks();
});

test('Check load', () => {
  const expected = { point: 10, maxPoint: 10, level: 1 };
  stateService.load = jest.fn().mockReturnValue(expected);
  expect(stateService.load()).toEqual(expected);
});

test('Check load on error', () => {
  const expected = new Error('Invalid state');
  stateService.load = jest.fn().mockReturnValue(expected);
  expect(stateService.load()).toEqual(expected);
});
