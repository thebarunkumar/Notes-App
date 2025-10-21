# Client

This folder contains the React + Vite frontend for the Notes App.

Quick start (development):

1. Install dependencies

```powershell
cd "client";
npm install
```

2. Copy `.env.example` to `.env` at client root and edit `VITE_API_URL` if your backend runs elsewhere.

3. Run development server

```powershell
npm run dev
```

Notes:
- The frontend uses `import.meta.env.VITE_API_URL` (see `src/lib/api.js`) to determine API base URL.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
