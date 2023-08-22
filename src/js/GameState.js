import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import createPositionsChar, { chooseRandPositions } from './createPositions';
import themes from './themes';
import { getAllPositions, upAttackDefence } from './utils';

export default class GameState {
  constructor(gamePlay) {
    this.levelGame = 1;
    this.gamePlay = gamePlay;
    this.userTeam = [];
    this.compTeam = [];
    this.allPlayer = [];
    this.isMove = 'user';
    this.countClick = 0;
    this.survivors = [];
    this.history = [];
    this.points = 0;
    this.block = false;

    this.initNewTeams();
  }

  getUserTeam([maxLevel, charCount]) {
    const userTypes = [Bowman, Swordsman, Magician];
    const userTeam = createPositionsChar(
      userTypes,
      this.gamePlay.boardSize,
      false,
      [maxLevel, charCount],
    );
    this.userTeam = userTeam;
    return userTeam;
  }

  getCompTeam([maxLevel, charCount]) {
    const compTypes = [Vampire, Daemon, Undead];
    const compTeam = createPositionsChar(
      compTypes,
      this.gamePlay.boardSize,
      true,
      [maxLevel, charCount],
    );
    this.compTeam = compTeam;
    return compTeam;
  }

  initNewTeams() {
    this.userTeam = this.getUserTeam([this.levelGame, this.levelGame]);
    this.compTeam = this.getCompTeam([this.levelGame, this.levelGame]);
    this.allPlayer = getAllPositions(this.userTeam, this.compTeam);
  }

  levelUp() {
    this.updatePlayersStats();
    this.gamePlay.drawUi(Object.values(themes)[this.levelGame - 1]);
    this.updateTeams();
    this.countClick = 0;
  }

  updatePlayersStats() {
    for (const player of this.allPlayer) {
      const { character: char } = player;
      char.attack = upAttackDefence(char.attack, char.health);
      char.defence = upAttackDefence(char.defence, char.health);
      char.level = Math.min(char.level + 1, 4);
      char.health = Math.min(char.health + 80, 100);
    }
  }

  updateTeams() {
    const newUserTeam = this.getUserTeam([this.levelGame - 1, this.levelGame]);
    const allStartPositions = chooseRandPositions(this.gamePlay.boardSize);
    newUserTeam.forEach((item) => {
      allStartPositions.splice(allStartPositions.indexOf(item.position), 1);
    });

    this.survivors.forEach((survivor) => {
      if (!allStartPositions.includes(survivor.position)) {
        const newPosition = allStartPositions[
          Math.floor(Math.random() * allStartPositions.length)
        ];
        // eslint-disable-next-line no-param-reassign
        survivor.position = newPosition;
      }
    });

    this.userTeam = this.survivors.concat(newUserTeam);
    this.compTeam = this.getCompTeam([
      this.levelGame,
      this.levelGame + this.allPlayer.length,
    ]);
    this.allPlayer = getAllPositions(this.userTeam, this.compTeam);
  }

  calculateSumPoints() {
    return this.userTeam.reduce((a, b) => a + b.character.health, 0);
  }
}
