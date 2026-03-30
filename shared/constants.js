// Shared constants between client and server

const GAME_CONFIG = {
  PREP_DURATION: 60,       // seconds
  WAVE_COUNT: 3,
  WAVE_INTERVAL: 10,       // seconds between waves
  ELIXIR_MAX: 10,
  ELIXIR_REGEN_RATE: 1,    // per second
  BASE_HP: 100,
};

const RESOURCES = {
  WOOD:  { id: 'wood',  label: 'Madeira', color: 0x795548 },
  STONE: { id: 'stone', label: 'Pedra',   color: 0x9e9e9e },
  IRON:  { id: 'iron',  label: 'Ferro',   color: 0xb0bec5 },
};

const STRUCTURES = {
  ARCHER_TOWER: {
    id: 'archer_tower',
    label: 'Torre Arqueiro',
    cost: { wood: 2 },
    hp: 60, damage: 10, range: 3, attackSpeed: 1,
  },
  CANNON: {
    id: 'cannon',
    label: 'Canhão de Pedra',
    cost: { stone: 3 },
    hp: 80, damage: 20, range: 2, attackSpeed: 0.5, splash: true,
  },
  TRAP: {
    id: 'trap',
    label: 'Armadilha de Ferro',
    cost: { iron: 2 },
    hp: 1, damage: 50, range: 1, oneShot: true,
  },
  WALL: {
    id: 'wall',
    label: 'Muro de Pedra',
    cost: { stone: 1 },
    hp: 150, damage: 0, range: 0,
  },
};

const TROOPS = {
  PALITO: {
    id: 'palito',
    label: 'Palito',
    elixirCost: 2,
    hp: 10, damage: 5, speed: 3, range: 1,
    color: 0xffffff,
    description: 'Rápido, 1 de HP, ataca em bando',
  },
  GIGANTINHO: {
    id: 'gigantinho',
    label: 'Gigantinho',
    elixirCost: 5,
    hp: 40, damage: 25, speed: 0.8, range: 1,
    color: 0x4caf50,
    description: 'Minúsculo, mas acha que é enorme',
  },
  MIRA_TORTA: {
    id: 'mira_torta',
    label: 'Mira Torta',
    elixirCost: 3,
    hp: 25, damage: 15, speed: 1.5, range: 3,
    color: 0x2196f3,
    description: 'Atira pra todo lado menos no inimigo',
  },
  BOMBINHA: {
    id: 'bombinha',
    label: 'Bombinha',
    elixirCost: 4,
    hp: 20, damage: 35, speed: 1.2, range: 1, splashOnDeath: true,
    color: 0xff5722,
    description: 'Explode ao morrer, tamanho de uma uva',
  },
  CAVALEIRO_PAPELAO: {
    id: 'cavaleiro_papelao',
    label: 'Cavaleiro de Papelão',
    elixirCost: 3,
    hp: 60, damage: 12, speed: 1.5, range: 1,
    color: 0xffc107,
    description: 'HP razoável, tem medo de chuva',
  },
  PORQUINHO: {
    id: 'porquinho',
    label: 'Porquinho de Bicicleta',
    elixirCost: 4,
    hp: 35, damage: 20, speed: 2.5, range: 1, targetBase: true,
    color: 0xe91e63,
    description: 'Vai direto à base inimiga',
  },
  LAGARTIXA: {
    id: 'lagartixa',
    label: 'Lagartixa',
    elixirCost: 4,
    hp: 30, damage: 18, speed: 2, range: 2.5, flying: true, splash: true,
    color: 0x9c27b0,
    description: 'Voa, menos intimidante que parece',
  },
  FOFOCA: {
    id: 'fofoca',
    label: 'FOFOCA',
    elixirCost: 7,
    hp: 120, damage: 40, speed: 0.6, range: 1,
    color: 0x607d8b,
    description: 'Ninguém sabe o que significa',
  },
};

const ENEMIES = {
  LIGHT:  { id: 'light',  hp: 20,  damage: 5,  speed: 2,   reward: 1, color: 0xef5350 },
  MEDIUM: { id: 'medium', hp: 50,  damage: 10, speed: 1.5, reward: 2, color: 0e53935 },
  TANK:   { id: 'tank',   hp: 150, damage: 20, speed: 0.8, reward: 5, color: 0xb71c1c },
};

const WAVES = [
  { enemies: [{ type: 'light', count: 5 }] },
  { enemies: [{ type: 'light', count: 5 }, { type: 'medium', count: 3 }] },
  { enemies: [{ type: 'medium', count: 5 }, { type: 'tank', count: 1 }] },
];

// Path waypoints [x, z] on a 20x20 grid
const MAP_PATH = [
  [2, 2], [2, 5], [2, 8],
  [5, 8], [8, 8], [11, 8],
  [11, 5], [11, 2], [14, 2],
  [17, 2], [17, 5], [17, 8],
  [17, 11], [17, 14], [17, 17],
];

module.exports = { GAME_CONFIG, RESOURCES, STRUCTURES, TROOPS, ENEMIES, WAVES, MAP_PATH };
