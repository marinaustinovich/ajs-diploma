import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import createPositionsChar, { chooseRandPositions } from './createPositions';
import themes from './themes';

export default class GameState {
  constructor(gamePlay) {
    this.levelGame = 1;
    this.gamePlay = gamePlay;
    this.userTeam = [];
    this.compTeam = [];
    this.allPlayer = [];
    this.isMove = 'user';
    this.countClick = 0;
    this.survivos = [];
    this.history = [];
    this.block = false;

    this.initNewTeams();
  }

  getUserTeam([maxLevel, characterCount]) {
    const userTypes = [Bowman, Swordsman, Magician];
    /* eslint-disable */
    const userTeam = createPositionsChar(userTypes, this.gamePlay.boardSize, false, [maxLevel, characterCount]);
    this.userTeam = userTeam;
    return userTeam;
  }

  getCompTeam([maxLevel, characterCount]) {
    const compTypes = [Vampire, Daemon, Undead];
    /* eslint-disable */
    const compTeam = createPositionsChar(compTypes, this.gamePlay.boardSize, true, [maxLevel, characterCount]);
    this.compTeam = compTeam;
    return compTeam;
  }

  getAllPositions(array1, array2) {
    if (!array1 || array1.length === 0) return array2;
    if (!array2 || array2.length === 0) return array1;
    return array1.concat(array2);
  }

  initNewTeams() {
    this.userTeam = this.getUserTeam([this.levelGame, this.levelGame]);
    this.compTeam = this.getCompTeam([this.levelGame, this.levelGame]);
    this.allPlayer = this.getAllPositions(this.userTeam, this.compTeam);
  }

  getInfo(player) {
    return `\u{1F396}${player.level} \u2694${player.attack} \u{1F6E1}${player.defence} \u2764${player.health}`;
  }

  levelUp() {
    for (const player of this.allPlayer) {
      const char = player.character;
      char.attack = this.upAttackDefence(char.attack, char.health);
      char.defence = this.upAttackDefence(char.defence, char.health);
      char.level = (char.level + 1) <= 4 ? char.level + 1 : char.level = 4;
      char.health = (char.health + 80) < 100 ? char.health + 80 : 100;
    }

    this.gamePlay.drawUi(Object.values(themes)[this.levelGame - 1]);
    const newUserTeam = this.getUserTeam([this.levelGame - 1, this.levelGame]);
    const allStartPositions = chooseRandPositions(this.gamePlay.boardSize);
    newUserTeam.forEach((item) => allStartPositions.splice(allStartPositions.indexOf(item.position), 1));
    this.survivos.forEach((item) => {
      if (!allStartPositions.includes(item.position)) {
        const rand = Math.floor(Math.random() * allStartPositions.length);
        item.position = allStartPositions[rand];
      }
    });

    this.userTeam = this.survivos.concat(newUserTeam);
    this.compTeam = this.getCompTeam([this.levelGame, this.levelGame + this.allPlayer.length]);
    this.allPlayer = this.getAllPositions(this.userTeam, this.compTeam);
    this.countClick = 0;
  }

  upAttackDefence(before, life) {
    return Math.floor(Math.max(before, (before * (80 + life) / 100)));
  }

  calculateSumPoints() {
    return this.userTeam.reduce((a, b) => a + b.character.health, 0);
  }
}
