import getTransitionAttackCells from '../transitionAttackCells';

test.each([
  [0, 8, 1, [1, 8, 9]],
  [8, 7, 1, [0, 1, 2, 7, 9, 14, 15, 16]],
  [24, 5, 1, [18, 19, 23]],
])(('should be attackCells '), (index, boardSize, maxRange, expected) => {
  const result = getTransitionAttackCells(index, boardSize, maxRange);
  expect(result).toEqual(expected);
});
