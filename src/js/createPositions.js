import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export function chooseRandPositions(boardSize, opponent = false) {
  const cells = [];
  if (!opponent) {
    for (let i = 0; i < boardSize ** 2; i += 8) {
      cells.push(i);
      cells.push(i + 1);
    }
  } else {
    for (let i = boardSize - 2; i < boardSize ** 2; i += boardSize) {
      cells.push(i);
      cells.push(i + 1);
    }
  }
  return cells;
}

function chooseRandPosition(boardSize, opponent = false) {
  const cells = chooseRandPositions(boardSize, opponent);
  const rand = Math.floor(Math.random() * cells.length);
  return cells[rand];
}

/* eslint-disable */
export default function createPositionsChar(playerTypes, boardSize, opponent, [maxLevel, characterCount]) {
  const positions = [];
  const team = generateTeam(playerTypes, maxLevel, characterCount);

  const randPositions = [];
  team.characters.forEach((char) => {
    let randPosition;
    let isPositionUnique = false;
    do {
      randPosition = chooseRandPosition(boardSize, opponent);
      if (randPositions.find((el) => el === randPosition)) {
        randPosition = chooseRandPosition(boardSize, opponent);
      } else {
        randPositions.push(randPosition);
        isPositionUnique = true;
      }
    } while (!isPositionUnique);
    positions.push(new PositionedCharacter(char, randPosition));
  });
  return positions;
}

export function restoreChar(obj) {
  let CharClass;
  switch (obj.character.type) {
    case 'bowman':
      CharClass = Bowman;
      break;
    case 'swordsman':
      CharClass = Swordsman;
      break;
    case 'magician':
      CharClass = Magician;
      break;
    case 'daemon':
      CharClass = Daemon;
      break;
    case 'undead':
      CharClass = Undead;
      break;
    case 'vampire':
      CharClass = Vampire;
      break;
    default: break;
  }
  const char = new CharClass(obj.character.level);
  const restorePositionedChar = new PositionedCharacter(char, obj.position);
  restorePositionedChar.attack = obj.character.attack;
  restorePositionedChar.health = obj.character.health;
  restorePositionedChar.defence = obj.character.defence;

  return restorePositionedChar;
}
