import Vampire from '../characters/Vampire';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Character from '../Character';

test.each([
  [Bowman, 1, {
    type: 'bowman', level: 1, attack: 25, defence: 25, health: 50,
  }],
  [Bowman, undefined, {
    type: 'bowman', level: 1, attack: 25, defence: 25, health: 50,
  }],
  [Swordsman, 1, {
    type: 'swordsman', level: 1, attack: 40, defence: 10, health: 50,
  }],
  [Swordsman, undefined, {
    type: 'swordsman', level: 1, attack: 40, defence: 10, health: 50,
  }],
  [Magician, 1, {
    type: 'magician', level: 1, attack: 10, defence: 40, health: 50,
  }],
  [Magician, undefined, {
    type: 'magician', level: 1, attack: 10, defence: 40, health: 50,
  }],
  [Vampire, 1, {
    type: 'vampire', level: 1, attack: 25, defence: 25, health: 50,
  }],
  [Vampire, undefined, {
    type: 'vampire', level: 1, attack: 25, defence: 25, health: 50,
  }],
  [Daemon, 1, {
    type: 'daemon', level: 1, attack: 10, defence: 10, health: 50,
  }],
  [Daemon, undefined, {
    type: 'daemon', level: 1, attack: 10, defence: 10, health: 50,
  }],
  [Undead, 1, {
    type: 'undead', level: 1, attack: 40, defence: 10, health: 50,
  }],
  [Undead, undefined, {
    type: 'undead', level: 1, attack: 40, defence: 10, health: 50,
  }],
])(('should create new class'), (Type, level, expected) => {
  const result = new Type(level);
  expect(result).toEqual(expected);
});

test('should be Error for create new Character', () => {
  expect(() => new Character(2)).toThrow('Invalid class');
});
