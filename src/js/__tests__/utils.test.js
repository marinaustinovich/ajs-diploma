import {
  calcTileType,
  calcHealthLevel,
  getAllPositions,
  upAttackDefence,
  getInfo,
} from '../utils';

test.each([
  [1, 8, 'top', 'top edge'],
  [6, 8, 'top', 'top edge'],
  [1, 7, 'top', 'top edge'],
  [5, 7, 'top', 'top edge'],
  [57, 8, 'bottom', 'bottom edge'],
  [62, 8, 'bottom', 'bottom edge'],
  [43, 7, 'bottom', 'bottom edge'],
  [47, 7, 'bottom', 'bottom edge'],
  [8, 8, 'left', 'left edge'],
  [48, 8, 'left', 'left edge'],
  [7, 7, 'left', 'left edge'],
  [35, 7, 'left', 'left edge'],
  [15, 8, 'right', 'right edge'],
  [55, 8, 'right', 'right edge'],
  [13, 7, 'right', 'right edge'],
  [41, 7, 'right', 'right edge'],
  [0, 8, 'top-left', 'top-left edge'],
  [7, 8, 'top-right', 'top-right edge'],
  [0, 7, 'top-left', 'top-left edge'],
  [6, 7, 'top-right', 'top-right edge'],
  [56, 8, 'bottom-left', 'bottom-left edge'],
  [63, 8, 'bottom-right', 'bottom-left edge'],
  [42, 7, 'bottom-left', 'bottom-right edge'],
  [48, 7, 'bottom-right', 'bottom-right edge'],
  [35, 8, 'center', 'center edge'],
  [25, 7, 'center', 'center edge'],
])(
  'should return %s for index %i with board size %i',
  (index, boardSize, expected) => {
    const result = calcTileType(index, boardSize);

    expect(result).toBe(expected);
  },
);

test.each([
  [0, 'critical', 'when health is 0'],
  [10, 'critical', 'when health is 10'],
  [14, 'critical', 'when health is 14'],
  [15, 'normal', 'when health is 15'],
  [35, 'normal', 'when health is 35'],
  [49, 'normal', 'when health is 49'],
  [50, 'high', 'when health is 50'],
  [51, 'high', 'when health is 51'],
  [100, 'high', 'when health is 100'],
])('should return %s %s', (health, expected) => {
  const result = calcHealthLevel(health);

  expect(result).toBe(expected);
});

describe('getAllPositions', () => {
  it('should return the second array if the first one is empty or null', () => {
    expect(getAllPositions([], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(getAllPositions(null, [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should return the first array if the second one is empty or null', () => {
    expect(getAllPositions([1, 2, 3], [])).toEqual([1, 2, 3]);
    expect(getAllPositions([1, 2, 3], null)).toEqual([1, 2, 3]);
  });

  it('should return concatenated arrays if both are non-empty', () => {
    expect(getAllPositions([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('upAttackDefence', () => {
  it('should calculate the attack/defence correctly', () => {
    expect(upAttackDefence(100, 50)).toBe(130);
    expect(upAttackDefence(0, 50)).toBe(0);
  });
});

describe('getInfo', () => {
  it('should return the correct info string', () => {
    const player = {
      level: 5,
      attack: 100,
      defence: 50,
      health: 80,
    };
    const expectedString = '\u{1F396}5 \u2694100 \u{1F6E1}50 \u276480';
    expect(getInfo(player)).toBe(expectedString);
  });
});
