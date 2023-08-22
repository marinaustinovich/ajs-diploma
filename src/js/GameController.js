import themes from './themes';
import GameState from './GameState';
import GamePlay from './GamePlay';
import cursors from './cursors';
import getTransitionAttackCells from './transitionAttackCells';
import doAttackComp from './doAttackComp';
import { restoreChar } from './createPositions';
import {
  getAllPositions,
  getInfo,
  getMaxRangeAndAttack,
  restoreCharacters,
} from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState(this.gamePlay);

    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.newGame = this.newGame.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.loadGame = this.loadGame.bind(this);
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.events();
    this.updatePicture();
  }

  events() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addNewGameListener(this.newGame);
    this.gamePlay.addSaveGameListener(this.saveGame);
    this.gamePlay.addLoadGameListener(this.loadGame);
  }

  newGame() {
    this.gameState.history.push({
      levelGame: this.gameState.levelGame,
      points: this.gameState.points,
    });
    this.gameState.block = false;
    this.gameState.levelGame = 1;
    this.gameState.points = 0;
    this.gameState.countClick = 0;

    this.reset();
    this.gameState.initNewTeams();
    this.updatePicture();
  }

  saveGame() {
    this.stateService.save(this.gameState);
    GamePlay.showMessage('Your game has saved!', '9997');
  }

  loadGame() {
    try {
      const loadGameState = this.stateService.load();

      if (!loadGameState) throw new Error();

      this.gameState.levelGame = loadGameState.block
        ? loadGameState.levelGame - 1
        : loadGameState.levelGame;
      this.gameState.countClick = loadGameState.countClick;
      this.gameState.history = loadGameState.history;
      this.gameState.isMove = loadGameState.isMove;
      this.gameState.block = loadGameState.block;
      this.gameState.points = loadGameState.points;

      this.resetTeams(loadGameState);
      this.gameState.allPlayer = getAllPositions(
        this.gameState.userTeam,
        this.gameState.compTeam,
      );

      const restartActChar = restoreChar(loadGameState.activeChar);
      this.reactOnClick(restartActChar, restartActChar.position, [
        'bowman',
        'swordsman',
        'magician',
      ]);

      this.updatePicture();
      this.showGamePoints();
    } catch (e) {
      GamePlay.showError("There's no game in memory", '128075');
      this.newGame();
    }
  }

  resetTeams(gameState) {
    this.gameState.userTeam = restoreCharacters(gameState.userTeam);
    this.gameState.compTeam = restoreCharacters(gameState.compTeam);
  }

  showGamePoints() {
    const message = this.gameState.points
      ? `Your points ${this.gameState.points}`
      : "There's no points. \n It's the first round";
    const iconCode = this.gameState.points ? '128076' : '128083';

    GamePlay.showPoints(message, iconCode);
  }

  async onCellClick(index) {
    if (this.gameState.block) return;

    const player = this.gameState.allPlayer.find((el) => el.position === index);

    if (this.gameState.activeChar) {
      await this.handleActiveCharClick(index);
    }

    this.reactOnClick(player, index, ['bowman', 'swordsman', 'magician']);

    if (this.gameState.countClick >= 1) {
      await this.handleComputerTurn();
    }
  }

  async handleActiveCharClick(index) {
    if (this.gameState.indexSelect.green === index) {
      this.gameState.activeChar.position = index;
      this.gameState.countClick += 1;
      this.gamePlay.redrawPositions(this.gameState.allPlayer);
    }

    if (this.gameState.indexSelect.red === index) {
      this.gameState.isMove = 'user';
      const responseDoDamage = await this.doDamage(index);
      if (responseDoDamage) {
        this.gameState.countClick += 1;
        this.gamePlay.redrawPositions(this.gameState.allPlayer);
        await this.checkGameProgress();
      }
    }
  }

  async checkGameProgress() {
    if (this.gameState.compTeam.length === 0) {
      this.gameState.levelGame += 1;
      this.gameState.points += this.gameState.calculateSumPoints();
      this.reset();

      // Uncomment the following if you want to handle game ending
      // await this.checkGameOver();

      this.gameState.survivors = this.gameState.userTeam;
      GamePlay.showMessage(
        `Level up! Your total points are ${this.gameState.points}`,
        '9996',
      );
      this.gameState.levelUp();
      this.gamePlay.redrawPositions(this.gameState.allPlayer);
    }
  }

  // Uncomment the following if you want to handle game ending
  // async checkGameOver() {
  //   if (this.gameState.levelGame >= 5) {
  //     this.gameState.point = this.gameState.calculateSumPoints();
  //     this.gameState.block = true;
  //     this.gamePlay.redrawPositions(this.gameState.allPlayer);
  //     GamePlay.showMessage(`You win! Your points are ${this.gameState.point}`, '127881');
  //     return;
  //   }
  // }

  async handleComputerTurn() {
    this.gameState.activeCharUser = this.gameState.activeChar;
    this.gameState.isMove = 'comp';
    const responseDoAttackComp = await doAttackComp(this);
    if (responseDoAttackComp) {
      this.gameState.countClick = 0;
      this.gameState.isMove = 'user';

      if (this.isDead()) {
        this.gameState.activeChar = this.gameState.activeCharUser;
        this.reactOnClick(
          this.gameState.activeChar,
          this.gameState.activeChar.position,
          ['bowman', 'swordsman', 'magician'],
        );
        this.gamePlay.redrawPositions(this.gameState.allPlayer);
      }
    }
  }

  onCellEnter(index) {
    if (this.gameState.block) return;

    const player = this.gameState.allPlayer.find((el) => el.position === index);

    if (player) {
      this.gamePlay.showCellTooltip(getInfo(player.character), index);
    }

    if (!this.gameState.activeChar) return;

    const isTransitionCell = this.gameState.transitionCells.includes(index);
    const isAttackCell = this.gameState.attackCells.includes(index);
    const isUserCell = this.gameState.userTeam.some(
      (item) => item.position === index,
    );
    const isCompCell = this.gameState.compTeam.some(
      (item) => item.position === index,
    );

    this.gamePlay.setCursor(cursors.pointer);

    if (isTransitionCell && !isUserCell && !isCompCell) {
      this.gameState.indexSelect.green = index;
      this.gamePlay.selectCell(index, 'green');
    }

    if (isAttackCell && isCompCell) {
      this.gameState.indexSelect.red = index;
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor(cursors.crosshair);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);

    if (this.gameState.block) return;

    const hasSelectedGreen = document.querySelector('.selected-green');
    const isAttackCell = this.gameState.attackCells?.includes(index);
    const isCompTeamPosition = this.gameState.compTeam.some(
      (item) => item.position === index,
    );

    if (hasSelectedGreen) {
      this.gamePlay.deselectCell(this.gameState.indexSelect.green);

      if (!isAttackCell && isCompTeamPosition) {
        this.gamePlay.deselectCell(this.gameState.indexSelect.green);
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }

    if (document.querySelector('.selected-red')) {
      this.gamePlay.deselectCell(this.gameState.indexSelect.red);
    }
  }

  reactOnClick(obj, num, arrayTypes) {
    if (!obj) return;

    if (arrayTypes.includes(obj.character.type)) {
      this.updateSelectedCell(num);
      this.gamePlay.selectCell(num);
      this.gamePlay.boardEl.classList.add('mountain');
      this.gameState.activeChar = obj;

      const { maxRange, maxAttack } = getMaxRangeAndAttack(obj.character.type);

      this.gameState.transitionCells = getTransitionAttackCells(
        num,
        this.gamePlay.boardSize,
        maxRange,
      );
      this.gameState.attackCells = getTransitionAttackCells(
        num,
        this.gamePlay.boardSize,
        maxAttack,
        true,
      );
    } else {
      this.handleInvalidSelection(num);
    }
  }

  updateSelectedCell(num) {
    if (document.querySelector('.selected-yellow')) {
      this.gamePlay.deselectCell(this.gameState.indexSelect.yellow);
    }
    this.gameState.indexSelect = { yellow: num };
  }

  handleInvalidSelection(num) {
    if (
      this.gameState.indexSelect
      && !this.gameState.attackCells.find((item) => item === num)
      && this.gameState.compTeam.find((item) => item.position === num)
    ) {
      GamePlay.showError("It can't be done", '9940');
    } else if (!this.gameState.activeChar) {
      GamePlay.showError('This isn`t your character', '9995');
    }
  }

  async doDamage(index) {
    const { attack: attacking } = this.gameState.activeChar.character;
    const opponent = this.gameState.allPlayer.find(
      (el) => el.position === index,
    );
    const { defence, health } = opponent.character;

    const damage = Math.round(Math.max(attacking - defence, attacking * 0.3));
    const responseShowDamage = await this.gamePlay.showDamage(index, damage);

    if (responseShowDamage) {
      opponent.character.health = health - damage;
      this.checkHealthRemoveDead(opponent);
      return true;
    }

    return false;
  }

  checkHealthRemoveDead(player) {
    if (player.character.health <= 0) {
      const teamKey = this.gameState.isMove === 'comp' ? 'userTeam' : 'compTeam';
      const findIndex = this.gameState[teamKey].findIndex(
        (item) => player.position === item.position,
      );

      if (findIndex !== -1) {
        this.gameState[teamKey].splice(findIndex, 1);
      }

      this.gameState.allPlayer = getAllPositions(
        this.gameState.userTeam,
        this.gameState.compTeam,
      );
    }
  }

  reset() {
    if (this.gameState.indexSelect) {
      for (const color in this.gameState.indexSelect) {
        if (
          Object.prototype.hasOwnProperty.call(
            this.gameState.indexSelect,
            color,
          )
        ) {
          this.gamePlay.deselectCell(this.gameState.indexSelect[color]);
        }
      }
    }

    this.gamePlay.setCursor(cursors.auto);
  }

  isDead() {
    return this.gameState.allPlayer.find(
      (e) => e.position === this.gameState.activeCharUser.position,
    );
  }

  updatePicture() {
    this.gamePlay.drawUi(Object.values(themes)[this.gameState.levelGame - 1]);
    this.gamePlay.redrawPositions(this.gameState.allPlayer);
  }
}
