import { MAP_PATH, GAME_CONFIG } from '../constants'

const TROOPS_STATS = {
  palito:            { hp: 10,  damage: 5,  speed: 3,   range: 1.2, color: 0xffffff },
  gigantinho:        { hp: 40,  damage: 25, speed: 0.8, range: 1.2, color: 0x4caf50 },
  mira_torta:        { hp: 25,  damage: 15, speed: 1.5, range: 3.5, color: 0x2196f3 },
  bombinha:          { hp: 20,  damage: 35, speed: 1.2, range: 1.2, color: 0xff5722, splashOnDeath: true },
  cavaleiro_papelao: { hp: 60,  damage: 12, speed: 1.5, range: 1.2, color: 0xffc107 },
  porquinho:         { hp: 35,  damage: 20, speed: 2.5, range: 1.2, color: 0xe91e63, targetBase: true },
  lagartixa:         { hp: 30,  damage: 18, speed: 2.0, range: 2.5, color: 0x9c27b0, splash: true },
  fofoca:            { hp: 120, damage: 40, speed: 0.6, range: 1.2, color: 0x607d8b },
}

const ENEMY_STATS = {
  light:  { hp: 20,  maxHp: 20,  damage: 8,  speed: 2.0, color: 0xef5350 },
  medium: { hp: 50,  maxHp: 50,  damage: 15, speed: 1.5, color: 0xe53935 },
  tank:   { hp: 150, maxHp: 150, damage: 25, speed: 0.8, color: 0xb71c1c },
}

const WAVES_DEF = [
  [{ type: 'light',  count: 5 }],
  [{ type: 'light',  count: 4 }, { type: 'medium', count: 3 }],
  [{ type: 'medium', count: 4 }, { type: 'tank',   count: 1 }],
]

const STRUCTURE_STATS = {
  archer_tower: { damage: 10, range: 3.0, attackSpeed: 1000 },
  cannon:       { damage: 20, range: 2.5, attackSpeed: 2000, splash: true, splashRadius: 1.5 },
  trap:         { damage: 50, range: 1.0, attackSpeed: 0, oneShot: true },
  wall:         { damage: 0,  range: 0,   attackSpeed: 0, hp: 150 },
}

let _nextId = 1
function uid() { return _nextId++ }

export default class BattleEngine {
  constructor({ structures, deck, onStateUpdate, onBaseDamage, onWaveComplete, onVictory, onDefeat }) {
    this.structures = structures.map(s => ({
      ...s,
      hp: STRUCTURE_STATS[s.type]?.hp ?? 60,
      maxHp: STRUCTURE_STATS[s.type]?.hp ?? 60,
      lastAttack: 0,
      triggered: false,
    }))
    this.deck = deck
    this.onStateUpdate = onStateUpdate
    this.onBaseDamage = onBaseDamage
    this.onWaveComplete = onWaveComplete
    this.onVictory = onVictory
    this.onDefeat = onDefeat

    this.enemies = []
    this.troops = []
    this.elixir = 5
    this.wave = 0
    this.spawnQueue = []
    this.spawnTimer = 0
    this.waveTimer = 0
    this.betweenWaves = false
    this.running = false
    this.lastTick = 0
    this.baseHp = GAME_CONFIG.BASE_HP
    this.elixirAccum = 0
  }

  start() {
    this.running = true
    this.lastTick = performance.now()
    this._startWave(0)
    this._loop()
  }

  stop() { this.running = false }

  _startWave(waveIdx) {
    if (waveIdx >= WAVES_DEF.length) { this.onVictory?.(); this.running = false; return }
    this.wave = waveIdx + 1
    this.betweenWaves = false
    // Build spawn queue with delay between enemies
    const waveDef = WAVES_DEF[waveIdx]
    const queue = []
    let delay = 0
    for (const group of waveDef) {
      for (let i = 0; i < group.count; i++) {
        queue.push({ type: group.type, delay })
        delay += 1500 // 1.5s between each enemy spawn
      }
    }
    this.spawnQueue = queue
    this.spawnTimer = performance.now()
    this.waveStartTime = performance.now()
  }

  _spawnEnemy(type) {
    const stats = { ...ENEMY_STATS[type] }
    const [sx, sz] = MAP_PATH[0]
    this.enemies.push({
      id: uid(), type,
      hp: stats.hp, maxHp: stats.maxHp,
      damage: stats.damage, speed: stats.speed, color: stats.color,
      x: sx, z: sz,
      waypointIdx: 0,
      attackTimer: 0,
    })
  }

  spawnTroop(troopId, tileX, tileZ) {
    const stats = TROOPS_STATS[troopId]
    if (!stats || this.elixir < this._elixirCost(troopId)) return false
    this.elixir = Math.max(0, this.elixir - this._elixirCost(troopId))
    this.troops.push({
      id: uid(), type: troopId,
      hp: stats.hp, maxHp: stats.hp,
      damage: stats.damage, speed: stats.speed,
      range: stats.range, color: stats.color,
      splashOnDeath: !!stats.splashOnDeath,
      splash: !!stats.splash,
      targetBase: !!stats.targetBase,
      x: tileX, z: tileZ,
      targetId: null, attackTimer: 0,
    })
    return true
  }

  _elixirCost(id) {
    const costs = { palito:2, gigantinho:5, mira_torta:3, bombinha:4, cavaleiro_papelao:3, porquinho:4, lagartixa:4, fofoca:7 }
    return costs[id] ?? 3
  }

  _loop() {
    if (!this.running) return
    const now = performance.now()
    const dt = Math.min((now - this.lastTick) / 1000, 0.1) // seconds, capped
    this.lastTick = now

    this._updateElixir(dt)
    this._processSpawnQueue(now)
    this._moveEnemies(dt)
    this._moveTroops(dt)
    this._structuresAttack(now)
    this._troopsAttack(now)
    this._checkWaveEnd(now)
    this._cleanup()

    this.onStateUpdate?.({
      enemies: this.enemies,
      troops: this.troops,
      structures: this.structures,
      elixir: this.elixir,
      wave: this.wave,
      baseHp: this.baseHp,
    })

    requestAnimationFrame(() => this._loop())
  }

  _updateElixir(dt) {
    this.elixirAccum += dt * GAME_CONFIG.ELIXIR_REGEN_RATE
    if (this.elixirAccum >= 1) {
      const gained = Math.floor(this.elixirAccum)
      this.elixirAccum -= gained
      this.elixir = Math.min(GAME_CONFIG.ELIXIR_MAX, this.elixir + gained)
    }
  }

  _processSpawnQueue(now) {
    if (!this.spawnQueue.length) return
    const elapsed = now - this.spawnTimer
    while (this.spawnQueue.length && this.spawnQueue[0].delay <= elapsed) {
      this._spawnEnemy(this.spawnQueue.shift().type)
    }
  }

  _moveEnemies(dt) {
    for (const e of this.enemies) {
      if (e.hp <= 0) continue
      if (e.waypointIdx >= MAP_PATH.length) {
        // Reached base
        this.baseHp = Math.max(0, this.baseHp - e.damage)
        e.hp = 0
        this.onBaseDamage?.(this.baseHp)
        if (this.baseHp <= 0) { this.onDefeat?.(); this.running = false; return }
        continue
      }
      const [tx, tz] = MAP_PATH[e.waypointIdx]
      const dx = tx - e.x, dz = tz - e.z
      const dist = Math.sqrt(dx*dx + dz*dz)
      if (dist < 0.1) {
        e.waypointIdx++
      } else {
        const move = e.speed * dt
        e.x += (dx / dist) * Math.min(move, dist)
        e.z += (dz / dist) * Math.min(move, dist)
      }
    }
  }

  _moveTroops(dt) {
    const [baseX, baseZ] = MAP_PATH[MAP_PATH.length - 1]
    for (const t of this.troops) {
      if (t.hp <= 0) continue
      // Find nearest enemy
      let nearest = null, nearDist = Infinity
      for (const e of this.enemies) {
        if (e.hp <= 0) continue
        const d = Math.hypot(e.x - t.x, e.z - t.z)
        if (d < nearDist) { nearDist = d; nearest = e }
      }
      if (nearest && nearDist <= t.range) {
        t.targetId = nearest.id // in range, attack handled elsewhere
      } else if (nearest) {
        // Move toward nearest enemy
        const dx = nearest.x - t.x, dz = nearest.z - t.z
        const dist = Math.sqrt(dx*dx + dz*dz)
        const move = t.speed * dt
        t.x += (dx / dist) * Math.min(move, dist)
        t.z += (dz / dist) * Math.min(move, dist)
        t.targetId = null
      } else {
        // No enemies — move toward spawn point (reverse path)
        const tx = MAP_PATH[0][0], tz = MAP_PATH[0][1]
        const dx = tx - t.x, dz = tz - t.z
        const dist = Math.sqrt(dx*dx + dz*dz)
        if (dist > 1) {
          const move = t.speed * dt
          t.x += (dx / dist) * Math.min(move, dist)
          t.z += (dz / dist) * Math.min(move, dist)
        }
      }
    }
  }

  _structuresAttack(now) {
    for (const s of this.structures) {
      if (s.hp <= 0) continue
      const stats = STRUCTURE_STATS[s.type]
      if (!stats || stats.damage === 0) continue

      if (stats.oneShot) {
        // Trap: trigger when enemy walks over it
        for (const e of this.enemies) {
          if (e.hp <= 0 || s.triggered) continue
          const d = Math.hypot(e.x - s.tileX, e.z - s.tileZ)
          if (d < 1.0) { e.hp = 0; s.triggered = true; s.hp = 0 }
        }
        continue
      }

      if (now - s.lastAttack < stats.attackSpeed) continue

      // Find nearest enemy in range
      let target = null, best = Infinity
      for (const e of this.enemies) {
        if (e.hp <= 0) continue
        const d = Math.hypot(e.x - s.tileX, e.z - s.tileZ)
        if (d < stats.range && d < best) { best = d; target = e }
      }
      if (!target) continue
      s.lastAttack = now

      if (stats.splash) {
        for (const e of this.enemies) {
          if (e.hp <= 0) continue
          if (Math.hypot(e.x - target.x, e.z - target.z) <= (stats.splashRadius ?? 1.5)) {
            e.hp = Math.max(0, e.hp - stats.damage)
          }
        }
      } else {
        target.hp = Math.max(0, target.hp - stats.damage)
      }
    }
  }

  _troopsAttack(now) {
    for (const t of this.troops) {
      if (t.hp <= 0) continue
      const target = this.enemies.find(e => e.id === t.targetId && e.hp > 0)
        ?? this.enemies.find(e => e.hp > 0 && Math.hypot(e.x - t.x, e.z - t.z) <= t.range)
      if (!target) continue
      if (now - (t.attackTimer ?? 0) < 1000) continue
      t.attackTimer = now
      if (t.splash) {
        for (const e of this.enemies) {
          if (e.hp > 0 && Math.hypot(e.x - target.x, e.z - target.z) <= 1.5) {
            e.hp = Math.max(0, e.hp - t.damage)
          }
        }
      } else {
        target.hp = Math.max(0, target.hp - t.damage)
        if (target.hp === 0 && t.splashOnDeath) {
          for (const e of this.enemies) {
            if (e.hp > 0 && Math.hypot(e.x - target.x, e.z - target.z) <= 2) {
              e.hp = Math.max(0, e.hp - t.damage)
            }
          }
        }
      }
    }
  }

  _checkWaveEnd(now) {
    if (this.betweenWaves) return
    const allSpawned = this.spawnQueue.length === 0
    const allDead = this.enemies.every(e => e.hp <= 0)
    if (allSpawned && allDead) {
      this.betweenWaves = true
      this.enemies = []
      this.troops = []
      const nextWave = this.wave
      setTimeout(() => {
        if (!this.running) return
        if (nextWave >= WAVES_DEF.length) { this.onVictory?.(); this.running = false }
        else this._startWave(nextWave)
      }, GAME_CONFIG.WAVE_INTERVAL * 1000)
      this.onWaveComplete?.(this.wave, WAVES_DEF.length)
    }
  }

  _cleanup() {
    this.enemies = this.enemies.filter(e => e.hp > 0)
    this.troops = this.troops.filter(t => t.hp > 0)
  }
}
