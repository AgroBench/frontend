# AgroBench

Frontend do AgroBench — benchmarking regional com dados anonimizados e recompensa em blockchain.

## Stack

- Vue 3 + Vite
- Vuetify
- Vue Router
- Axios

## Como rodar

**Stack completa (API + Postgres + frontend, com hot-reload):**

```bash
# na raiz do repositório
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:8080

Se a porta 3000 estiver ocupada: `FRONTEND_PORT=3010 docker compose up --build`.

**Só o frontend (API já no ar em `:8080`):**

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:8080
npm install
npm run dev
```

A URL da API fica em `.env` (`VITE_API_URL`). Se a API do backend subiu em outra porta (ex. `8081` porque a `8080` já estava ocupada), aponte o `.env` para essa URL.

A chain da demo é **Solana Devnet**. Programa Anchor `EytN8UaXrfTQc6Pq4AdQbQyJwUX37ddXsV7URayBBLrN` (stake/pool on-chain). O stepper de contribuir **trava 10 USDC** (a wallet do browser assina) e só então faz o commit.

Para o lock: cadastre um produtor **neste aparelho** (`ensureWallet`). O login seed `produtor@agrobench.local` / `demo12345` tem blob dummy e **não** assina. SMS, CAR e pagamento continuam mock.

## Estrutura

- `src/models/` — acesso à API, tipos de domínio, sessão, cripto do payload
- `src/views/` — páginas
- `src/components/` — componentes reutilizáveis de UI
- `src/router/` — rotas
- `src/services/api.js` — cliente HTTP (Axios, refresh automático)
- `src/plugins/` — Vuetify e plugins globais
