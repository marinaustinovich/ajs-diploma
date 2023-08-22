import GamePlay from '../GamePlay';
import GameState from '../GameState';
import Bowman from '../characters/Bowman';
import { upAttackDefence } from '../utils';

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    const gamePlay = new GamePlay();
    gameState = new GameState(gamePlay);
  });

  it('should initialize new teams', () => {
    gameState.initNewTeams();
    expect(gameState.userTeam.length).toBeGreaterThan(0);
    expect(gameState.compTeam.length).toBeGreaterThan(0);
  });

  it('should level up players', () => {
    const attackBefore = 100;
    const healthBefore = 100;

    gameState.allPlayer = [{ character: new Bowman(1) }];
    gameState.allPlayer[0].character.attack = attackBefore;
    gameState.allPlayer[0].character.health = healthBefore;
    upAttackDefence((before, life) => before + life);

    gameState.updatePlayersStats();
    const { character: char } = gameState.allPlayer[0];

    expect(char.attack).toBe(180);
    expect(char.defence).toBe(45);
    expect(char.level).toBe(2);
    expect(char.health).toBe(100);
  });

  it('should calculate sum points', () => {
    gameState.userTeam = [
      { character: { health: 30 } },
      { character: { health: 40 } },
    ];
    expect(gameState.calculateSumPoints()).toBe(70);
  });
});
