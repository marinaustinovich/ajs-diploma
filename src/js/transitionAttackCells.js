function getTable(cells, boardSize) {
  const result = [];
  for (let s = 0, e = boardSize; s < cells.length; s += boardSize, e += boardSize) {
    result.push(cells.slice(s, e));
  }
  return result;
}

function getTransitionTable(cells, index, maxRange) {
  const allowedCells = [];
  let findIndex;
  let row;
  for (let i = 0; i < cells.length; i += 1) {
    row = i;
    findIndex = cells[i].findIndex((el) => el === index);
    if (findIndex !== -1) break;
  }
  for (let i = -maxRange; i <= maxRange; i += 1) {
    for (let j = -maxRange; j <= maxRange; j += 1) {
      if ((row + i) >= 0 && (findIndex + j) >= 0
        && (row + i < cells.length) && (findIndex + j < cells.length)
        && (cells[row + i][findIndex + j]) !== index) {
        allowedCells.push(cells[row + i][findIndex + j]);
      }
    }
  }
  return allowedCells;
}

export default function getTransitionAttackCells(index, boardSize, maxRange) {
  const arrayCells = [];
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    arrayCells.push(i);
  }

  const tableCells = getTable(arrayCells, boardSize);
  return getTransitionTable(tableCells, index, maxRange);
}
