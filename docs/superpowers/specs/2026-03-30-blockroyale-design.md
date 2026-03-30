# BlockRoyale — Design Spec
**Data:** 2026-03-30
**Status:** Aprovado pelo usuário

---

## Visão Geral

BlockRoyale é um jogo de estratégia em tempo real para navegador que combina a mecânica de construção do Minecraft com o combate de tropas do Clash Royale. O jogador passa por uma fase de preparação (construção de defesas com minérios) seguida de uma fase de batalha (invocação de tropas com elixir contra ondas de inimigos ou outro jogador).

---

## Visual & Câmera

- **Estilo:** Low Poly 3D — blocos geométricos simplificados, cores vibrantes e sólidas
- **Câmera:** Isométrica fixa (ângulo diagonal 45°), visão total do mapa sem rotação
- **Motor:** Three.js renderizando cenas 3D no canvas do navegador

---

## Modos de Jogo

### 1v1 Online
- Dois jogadores entram em partida juntos
- Ambos passam pela fase de prep simultaneamente (cada um vê seu próprio mapa)
- Na batalha, cada um invoca tropas para atacar o castelo inimigo
- **Condição de vitória:** destruir o castelo do oponente antes que ele destrua o seu
- **Empate:** ao fim do tempo, vence quem tiver o castelo com mais HP

### vs Máquina (Tower Defense)
- Jogador único enfrenta ondas de inimigos controlados pela IA
- Dificuldade aumenta a cada onda
- **Condição de vitória:** sobreviver a todas as ondas sem que a base seja destruída
- **Derrota:** base chegar a 0 HP durante qualquer onda

---

## Loop de Jogo

```
[PREP] → [BATALHA] → [RESULTADO]
```

### Fase de Prep
- Duração: 60 segundos (configurável por modo)
- Jogador coleta minérios disponíveis no mapa (Madeira, Pedra, Ferro)
- Gasta minérios para posicionar estruturas de defesa ao longo do caminho fixo
- Escolhe o deck de tropas (até 4 cartas) que usará na batalha
- O caminho dos inimigos é pré-definido e visível desde o início

### Fase de Batalha
- Ondas de inimigos surgem e percorrem o caminho fixo
- Elixir regenera automaticamente (1 unidade por segundo, máx 10)
- Jogador invoca tropas do deck gastando elixir
- Tropas e estruturas de defesa atacam inimigos automaticamente
- No modo 1v1, as tropas invocadas avançam para o castelo inimigo

### Resultado
- Tela de vitória/derrota com pontuação e XP ganho
- Recompensas: moedas e chance de nova carta de tropa

---

## Economia

### Minérios (Fase de Prep)
| Recurso | Uso | Raridade |
|---------|-----|----------|
| Madeira | Torres básicas, cercas | Comum |
| Pedra   | Torres médias, muros | Médio |
| Ferro   | Torres avançadas, armadilhas | Raro |

### Elixir (Fase de Batalha)
- Regenera 1/s automaticamente, cap em 10
- Cada carta de tropa custa entre 2–7 de elixir
- Idêntico ao sistema do Clash Royale

---

## Estruturas de Defesa (exemplos iniciais)

| Estrutura | Custo | Função |
|-----------|-------|--------|
| Torre de Arqueiro | 2 Madeira | Ataque à distância, baixo dano |
| Canhão de Pedra | 3 Pedra | Ataque splash em área |
| Armadilha de Ferro | 2 Ferro | Dano instantâneo ao primeiro inimigo que passar |
| Muro de Pedra | 1 Pedra | Bloqueia e desacelera inimigos |

---

## Tropas (exemplos iniciais)

Nomes são paródias das tropas do Clash Royale — o "gigante" é propositalmente minúsculo.

| Tropa | Paródia de | Custo Elixir | Função |
|-------|-----------|-------------|--------|
| Palito | Esqueleto | 2 | Rápido, 1 de HP, ataca em bando |
| Gigantinho | Gigante | 5 | Minúsculo, mas acha que é enorme. Baixo HP, alto dano |
| Mira Torta | Arqueiro | 3 | Atira pra todo lado menos no inimigo. Dano aleatório |
| Bombinha | Bomba | 4 | Explode ao morrer, dano em área. Tamanho de uma uva |
| Cavaleiro de Papelão | Cavaleiro | 3 | HP razoável, dano médio, tem medo de chuva |
| Porquinho de Bicicleta | Hog Rider | 4 | Vai direto à base inimiga ignorando tropas |
| Lagartixa | Baby Dragon | 4 | Voa, ataque splash, menos intimidante que parece |
| FOFOCA | P.E.K.K.A | 7 | Tanque lento e poderoso. Ninguém sabe o que significa |

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| 3D Engine | Three.js |
| Multiplayer | Socket.io |
| Backend | Node.js + Express |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

---

## Arquitetura do Sistema

```
[Browser - React + Three.js]
        ↕ WebSocket (Socket.io)
[Node.js Server]
  ├── Gerenciamento de salas (1v1 matchmaking)
  ├── Autoridade do estado de jogo (anti-cheat básico)
  └── IA do tower defense (geração de ondas)
```

- O servidor é a fonte da verdade para estado de batalha
- O cliente renderiza e envia inputs (invocar tropa, posicionar defesa)
- O servidor valida, aplica e broadcasta o novo estado para ambos os clientes

---

## Estrutura de Arquivos (projeto)

```
blockroyale/
├── client/               # React + Three.js
│   ├── src/
│   │   ├── components/   # UI (HUD, menus, deck)
│   │   ├── game/         # Three.js scene, entities, loop
│   │   └── socket/       # Conexão com servidor
├── server/               # Node.js + Socket.io
│   ├── rooms/            # Lógica de salas 1v1
│   ├── ai/               # Geração de ondas (vs Máquina)
│   └── game/             # Estado de jogo autoritativo
└── shared/               # Constantes e tipos compartilhados
```

---

## Escopo do MVP

O MVP inclui:
- [ ] Mapa isométrico fixo com caminho definido
- [ ] Fase de prep: coleta de 3 minérios + 3 estruturas de defesa
- [ ] Fase de batalha: 3 ondas no modo vs Máquina
- [ ] 4 tropas jogáveis
- [ ] Modo 1v1 online básico (matchmaking simples)
- [ ] HUD com elixir, HP da base, timer

Fora do MVP (v2):
- Sistema de progressão/cartas
- Mais mapas
- Ranking / leaderboard
- Mobile responsivo
