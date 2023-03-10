import { calcTileType, calcHealthLevel } from '../utils';

test.each([
  [1, 8, 'top'],
  [6, 8, 'top'],
  [1, 7, 'top'],
  [5, 7, 'top'],
  [57, 8, 'bottom'],
  [62, 8, 'bottom'],
  [43, 7, 'bottom'],
  [47, 7, 'bottom'],
  [8, 8, 'left'],
  [48, 8, 'left'],
  [7, 7, 'left'],
  [35, 7, 'left'],
  [15, 8, 'right'],
  [55, 8, 'right'],
  [13, 7, 'right'],
  [41, 7, 'right'],
  [0, 8, 'top-left'],
  [7, 8, 'top-right'],
  [0, 7, 'top-left'],
  [6, 7, 'top-right'],
  [56, 8, 'bottom-left'],
  [63, 8, 'bottom-right'],
  [42, 7, 'bottom-left'],
  [48, 7, 'bottom-right'],
  [35, 8, 'center'],
  [25, 7, 'center'],
])(('should return string'), (index, boardSize, expected) => {
  const result = calcTileType(index, boardSize);

  expect(result).toBe(expected);
});

test.each([
  [0, 'critical'],
  [10, 'critical'],
  [14, 'critical'],
  [15, 'normal'],
  [35, 'normal'],
  [49, 'normal'],
  [50, 'high'],
  [51, 'high'],
  [100, 'high'],
])(('should return health as string'), (health, expected) => {
  const result = calcHealthLevel(health);

  expect(result).toBe(expected);
});
