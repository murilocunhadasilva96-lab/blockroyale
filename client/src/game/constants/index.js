// Shared game constants (client-side copy)

export const GAME_CONFIG = {
  PREP_DURATION: 60,
  WAVE_COUNT: 3,
  WAVE_INTERVAL: 10,
  ELIXIR_MAX: 10,
  ELIXIR_REGEN_RATE: 1,
  BASE_HP: 100,
}

export const MAP_PATH = [
  [2, 2], [2, 5], [2, 8],
  [5, 8], [8, 8], [11, 8],
  [11, 5], [11, 2], [14, 2],
  [17, 2], [17, 5], [17, 8],
  [17, 11], [17, 14], [17, 17],
]

export const TILE_SIZE = 1
export const MAP_SIZE = 20

export const COLORS = {
  GRASS:    0x52b788,
  GRASS_DARK: 0x40916c,
  PATH:     0xa0785a,
  PATH_DARK: 0x8d6345,
  BASE:     0x1565c0,
  BG:       0x0f1923,
}
