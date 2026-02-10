# identification-app

## Visao geral
Aplicacao para registo e pesquisa de pessoas e documentos, com suporte a OCR.

## Requisitos
- Node.js (LTS)
- PostgreSQL

## Backend
1. Instalar dependencias:
   - `cd /Users/Sandra/identification-app/backend && npm install`
2. Variaveis de ambiente (exemplo):
   - `DATABASE_URL=postgresql://user:pass@localhost:5432/identification`
   - `JWT_SECRET=uma_chave_segura`
   - `FRONTEND_URL=http://localhost:5173`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=teu_email@gmail.com`
   - `SMTP_PASS=app_password`
   - `SMTP_FROM="ID FSS <teu_email@gmail.com>"`
3. Iniciar:
   - `npm run dev`

## Frontend
1. Instalar dependencias:
   - `cd /Users/Sandra/identification-app/frontend && npm install`
2. Iniciar:
   - `npm run dev`
3. (Opcional) API URL:
   - `VITE_API_URL=http://localhost:3000`

## PWA (instalavel)
1. Build:
   - `cd /Users/Sandra/identification-app/frontend && npm run build`
2. Servir build (exemplo):
   - `npm run preview`
3. No mobile, abrir o site e "Adicionar ao ecrã inicial".

## Testes (backend)
- `cd /Users/Sandra/identification-app/backend && npm test`
