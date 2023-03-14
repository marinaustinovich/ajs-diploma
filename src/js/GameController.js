import themes from './themes';
import GameState from './GameState';
import GamePlay from './GamePlay';
import cursors from './cursors';
import getTransitionAttackCells from './transitionAttackCells';
import doAttackComp from './doAttackComp';
import { restoreChar } from './createPositions';

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

      if (loadGameState) {
        /* eslint-disable */
        loadGameState.block === true ? this.gameState.levelGame = (loadGameState.levelGame - 1) : this.gameState.levelGame = loadGameState.levelGame;
        this.gameState.countClick = loadGameState.countClick;
        this.gameState.history = loadGameState.history;
        this.gameState.isMove = loadGameState.isMove;
        this.gameState.block = loadGameState.block;
        this.gameState.points = loadGameState.points;
        this.gameState.userTeam = [];
        this.gameState.compTeam = [];
        this.reset();

        const restartActChar = restoreChar(loadGameState.activeChar);
        loadGameState.userTeam.forEach((o) => this.gameState.userTeam.push(restoreChar(o)));
        loadGameState.compTeam.forEach((o) => this.gameState.compTeam.push(restoreChar(o)));
        /* eslint-disable */
        this.gameState.allPlayer = this.gameState.getAllPositions(this.gameState.userTeam, this.gameState.compTeam);
        this.updatePicture();
        this.reactOnClick(restartActChar, restartActChar.position, ['bowman', 'swordsman', 'magician']);

        if (this.gameState.points) {
          GamePlay.showPoints(`Your points ${this.gameState.points}`, '128076');
        } else {
          GamePlay.showPoints('There\'s no points. \n It\'s the first round', '128083');
        }
      }
    } catch (e) {
      /* eslint-disable */
      console.error(e);
      GamePlay.showError('There`s no game in memory', '128075');
      this.newGame();
    }
  }

  async onCellClick(index) {
    // TODO: react to click
    if (!this.gameState.block) {
      if (this.gameState.activeChar) {
        if (this.gameState.indexSelect.green === index) {
          this.gameState.activeChar.position = index;
          this.gameState.countClick += 1;
          this.gamePlay.redrawPositions(this.gameState.allPlayer);
        }

        if (this.gameState.indexSelect.red === index) {
          // do attack user
          this.gameState.isMove = 'user';
          const responseDoDamage = await this.doDamage(index);
          if (responseDoDamage) {
            this.gameState.countClick += 1;
            this.gamePlay.redrawPositions(this.gameState.allPlayer);

            if (this.gameState.compTeam.length === 0) {
              this.gameState.levelGame += 1;
              this.gameState.points += this.gameState.calculateSumPoints();
              this.reset();
/*
              // stop game
              if (this.gameState.levelGame >= 5) {
                this.gameState.point = this.gameState.calculateSumPoints();
                this.gameState.block = true;
                this.gamePlay.redrawPositions(this.gameState.allPlayer);
                GamePlay.showMessage(`You win! Your points are ${this.gameState.point}`, '127881');

                return;
              }
 */
              // level up
              this.gameState.survivos = this.gameState.userTeam;

              GamePlay.showMessage(`Level up! Your total points are ${this.gameState.points}`, '9996');
              this.gameState.levelUp();
              this.gamePlay.redrawPositions(this.gameState.allPlayer);
            }
          }
        }
      }

      const player = this.gameState.allPlayer.find((el) => el.position === index);
      this.reactOnClick(player, index, ['bowman', 'swordsman', 'magician']);

      if (this.gameState.countClick >= 1) {
        this.gameState.activeCharUser = this.gameState.activeChar;
        this.gameState.isMove = 'comp';
        const responseDoAttackComp = await doAttackComp(this);
        if (responseDoAttackComp) {
          this.gameState.countClick = 0;
          this.gameState.isMove = 'user';

          if (this.isDead()) {
            this.gameState.activeChar = this.gameState.activeCharUser;
            this.reactOnClick(this.gameState.activeChar, this.gameState.activeChar.position, ['bowman', 'swordsman', 'magician']);
            this.gamePlay.redrawPositions(this.gameState.allPlayer);
          }
        }
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter

    // show information about player
    if (!this.gameState.block) {
      const player = this.gameState.allPlayer.find((el) => el.position === index);
      if (player) {
        this.gamePlay.showCellTooltip(this.gameState.getInfo(player.character), index);
      }

      // show cells that player can go to
      if (this.gameState.activeChar) {
        this.gamePlay.setCursor(cursors.pointer);

        if (this.gameState.transitionCells.find((item) => item === index)
          && !this.gameState.userTeam.find((item) => item.position === index)
          && !this.gameState.compTeam.find((item) => item.position === index)) {
          this.gameState.indexSelect.green = index;
          this.gamePlay.selectCell(index, 'green');
        }

        if (this.gameState.attackCells.find((item) => item === index)
          && this.gameState.compTeam.find((item) => item.position === index)) {
          this.gameState.indexSelect.red = index;
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        }
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    // TODO: react to mouse leave
    if (!this.gameState.block) {
      if (document.querySelector('.selected-green')) {
        this.gamePlay.deselectCell(this.gameState.indexSelect.green);

        // show cells whit opponents that player ca do nothing
        if (!this.gameState.attackCells.find((item) => item === index)
          && this.gameState.compTeam.find((item) => item.position === index)) {
          this.gamePlay.deselectCell(this.gameState.indexSelect.green);
          this.gamePlay.setCursor(cursors.notallowed);
        }

        // show cells that player attack go to
        if (document.querySelector('.selected-red')) {
          this.gamePlay.deselectCell(this.gameState.indexSelect.red);
        }
      }
    }
  }

  reactOnClick(obj, num, arrayTypes) {
    if (obj) {
      if (obj.character.type === arrayTypes[0] || obj.character.type === arrayTypes[1] || obj.character.type === arrayTypes[2]) {
        if (document.querySelector('.selected-yellow')) {
          this.gamePlay.deselectCell(this.gameState.indexSelect.yellow);
          this.gameState.indexSelect.yellow = num;
        } else {
          this.gameState.indexSelect = { yellow: num };
        }

        this.gamePlay.selectCell(num);
        this.gamePlay.boardEl.classList.add('mountain');
        this.gameState.activeChar = obj;
        let maxRange;
        let maxAttack;
        switch (obj.character.type) {
          case 'vampire':
          case 'bowman':
            maxRange = 2;
            maxAttack = 2;
            break;
          case 'undead':
          case 'swordsman':
            maxRange = 4;
            maxAttack = 1;
            break;
          case 'daemon':
          case 'magician':
            maxRange = 1;
            maxAttack = 4;
            break;
          default:
            maxRange = 1;
            maxAttack = 1;
            break;
        }

        this.gameState.transitionCells = getTransitionAttackCells(num, this.gamePlay.boardSize, maxRange);
        this.gameState.attackCells = getTransitionAttackCells(num, this.gamePlay.boardSize, maxAttack, true);
      } else if (this.gameState.indexSelect
        && !this.gameState.attackCells.find((item) => item === num)
        && this.gameState.compTeam.find((item) => item.position === num)) {
        GamePlay.showError("It can't be done", '9940');
      } else if (!this.gameState.activeChar) {
        GamePlay.showError('This isn`t your character', '9995');
      }
    }
  }

  async doDamage(index) {
    const attacking = this.gameState.activeChar.character.attack;
    const opponent = this.gameState.allPlayer.find((el) => el.position === index);
    const damage = Math.round(Math.max(attacking - opponent.character.defence, attacking * 0.3));
    const responseShowDamage = await this.gamePlay.showDamage(index, damage);

    if (responseShowDamage) {
      opponent.character.health = opponent.character.health - damage;
      this.checkHealthRemoveDead(opponent);
      return true;
    }
  }

  checkHealthRemoveDead(player) {
    if (player.character.health <= 0) {
      if (this.gameState.isMove === 'comp') {
        const findIndex = this.gameState.userTeam.findIndex((item) => player.position === item.position);
        this.gameState.userTeam.splice(findIndex, 1);
      }

      if (this.gameState.isMove === 'user') {
        const findIndex = this.gameState.compTeam.findIndex((item) => player.position === item.position);
        this.gameState.compTeam.splice(findIndex, 1);
      }

      this.gameState.allPlayer = this.gameState.getAllPositions(this.gameState.userTeam, this.gameState.compTeam);
    }
  }

  reset() {
    if (this.gameState.indexSelect) {
      if (this.gameState.indexSelect.yellow) this.gamePlay.deselectCell(this.gameState.indexSelect.yellow);
      if (this.gameState.indexSelect.red) this.gamePlay.deselectCell(this.gameState.indexSelect.red);
      if (this.gameState.indexSelect.green) this.gamePlay.deselectCell(this.gameState.indexSelect.green);
    }

    this.gamePlay.setCursor(cursors.auto);
  }

  isDead() {
    return this.gameState.allPlayer.find(e => e.position === this.gameState.activeCharUser.position);
  }

  updatePicture() {
    this.gamePlay.drawUi(Object.values(themes)[this.gameState.levelGame - 1]);
    this.gamePlay.redrawPositions(this.gameState.allPlayer);
  }
}
