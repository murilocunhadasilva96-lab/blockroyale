# ⚔️ BlockRoyale

> Clash Royale encontra Minecraft — construa defesas, invoque tropas, destrua o inimigo.

![BlockRoyale](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Three.js](https://img.shields.io/badge/Three.js-3D-blue)
![React](https://img.shields.io/badge/React-Vite-61dafb)

---

## 🎮 Como Jogar

### Fase de Preparação (60 segundos)
1. **Colete minérios** — clique nos cubos coloridos espalhados pelo mapa
   - 🪵 Madeira (cubo marrom)
   - 🪨 Pedra (cubo cinza)
   - ⚙️ Ferro (cubo prateado)
2. **Construa defesas** — selecione uma estrutura no painel e clique em um tile adjacente ao caminho
3. **Monte seu deck** — escolha 4 tropas das 8 disponíveis
4. Clique **PRONTO** ou aguarde o timer zerar

### Fase de Batalha
- Ondas de inimigos percorrem o caminho até sua base
- O **elixir** (barra roxa) regenera automaticamente
- Clique em uma carta do deck → clique no mapa para invocar a tropa
- Suas defesas atacam os inimigos automaticamente
- Sobreviva às **3 ondas** para vencer!

---

## 🏰 Estruturas de Defesa

| Estrutura | Custo | Função |
|-----------|-------|--------|
| 🏹 Torre Arqueiro | 2 Madeira | Ataque à distância |
| 💣 Canhão de Pedra | 3 Pedra | Dano em área (splash) |
| ⚡ Armadilha de Ferro | 2 Ferro | Dano instantâneo único |
| 🧱 Muro de Pedra | 1 Pedra | Bloqueia e desacelera |

---

## 🪖 Tropas (paródias do Clash Royale)

| Tropa | Paródia de | Custo 💜 |
|-------|-----------|---------|
| 🦴 Palito | Esqueleto | 2 |
| 💪 Gigantinho | Gigante | 5 |
| 🏹 Mira Torta | Arqueiro | 3 |
| 💥 Bombinha | Bomba | 4 |
| 🛡️ Cavaleiro de Papelão | Cavaleiro | 3 |
| 🐷 Porquinho de Bicicleta | Hog Rider | 4 |
| 🦎 Lagartixa | Baby Dragon | 4 |
| 👁️ FOFOCA | P.E.K.K.A | 7 |

---

## 🖥️ Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- [Git](https://git-scm.com/)

### 1. Clone o repositório
```bash
git clone https://github.com/murilocunhadasilva96-lab/blockroyale.git
cd blockroyale
```

### 2. Instale as dependências do client
```bash
cd client
npm install
```

### 3. Instale as dependências do server
```bash
cd ../server
npm install
```

### 4. Rode o jogo

**Terminal 1 — Server:**
```bash
cd server
node index.js
```
> Server rodando em `http://localhost:3001`

**Terminal 2 — Client:**
```bash
cd client
npm run dev
```
> Abra `http://localhost:5173` no navegador

---

## 🗂️ Estrutura do Projeto

```
blockroyale/
├── client/               # React + Vite + Three.js
│   └── src/
│       ├── components/   # UI (telas, HUD)
│       ├── game/
│       │   ├── scene/    # Cenas 3D (Three.js)
│       │   ├── systems/  # Lógica do jogo (engine, estado)
│       │   └── constants/# Configurações e stats
│       └── App.jsx
├── server/               # Node.js + Socket.io
│   └── index.js          # Server de multiplayer
├── shared/
│   └── constants.js      # Stats compartilhados
└── README.md
```

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| 3D Engine | Three.js |
| Multiplayer | Socket.io |
| Backend | Node.js + Express |
| Deploy Frontend | Vercel *(em breve)* |
| Deploy Backend | Railway *(em breve)* |

---

## 🚧 Status do Desenvolvimento

- [x] Tela inicial
- [x] Mapa isométrico 3D (Low Poly)
- [x] Fase de preparação (minérios + defesas + deck)
- [x] Fase de batalha (ondas + elixir + tropas)
- [x] HUD completo
- [x] Tela de resultado
- [ ] Modo 1v1 Online
- [ ] Deploy público

---

## 📄 Licença

MIT — fique à vontade para usar, modificar e distribuir.

---

*Feito com ⚔️ e muito elixir*
