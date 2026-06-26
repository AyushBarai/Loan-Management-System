# Frontend Development (Docker)

This project requires Node 20 or 22 due to native SWC bindings. Use one of the following approaches:

Option A — Local (recommended)

1. Install nvm (or nvm-windows) and switch to Node 20:

```bash
nvm install 20
nvm use 20
cd Frontend
npm ci
npm run dev
```

Option B — Docker (no Node change required locally)

```bash
cd Frontend
docker build -t lms-frontend:dev .
docker run -p 3000:3000 -v ${PWD}:/app -e "HOST=0.0.0.0" lms-frontend:dev
```
