# AgroBench

Frontend do AgroBench — benchmarking regional com dados anonimizados e recompensa em blockchain.

## Stack

- Vue 3 + Vite
- Vuetify
- Vue Router
- Axios

## Como rodar

```bash
npm install
npm run dev
```

O app sobe em `http://localhost:3000`.

A URL da API fica em `.env` (`VITE_API_URL`). Copie `.env.example` se precisar.

## Estrutura

- `src/views/` — páginas
- `src/components/` — componentes reutilizáveis
- `src/router/` — rotas
- `src/services/api.js` — cliente HTTP (Axios)
- `src/plugins/` — Vuetify e plugins globais
