# Ágora

Uma plataforma para visualizar e compreender dados orçamentários, acompanhar a distribuição de recursos e participar de decisões coletivas sobre como esses recursos podem ser utilizados.

Membros:

- Lucas Mantovani Boaro - 281303
- Gabriel Saia Schade - 281202
- Bruno Amaral Salles de Moraes - 281129
- Fernando de Almeida Maciel Penido - 281180
- Mateus Pachela Garcia - 259554

Projeto da Disciplina MC656 - Engenharia de Software, orientado pelo Professor Bruno Cafeo

## Estrutura

```text
.
├── backend/   # Node.js, TypeScript, Express, HTTPS e Vitest
└── frontend/  # React, TypeScript, Vite e Tailwind CSS
```

## Primeiros passos

Instale as dependências a partir da raiz:

```bash
npm install
```

Para executar o backend localmente, crie os certificados HTTPS e o arquivo de ambiente:

```bash
cp backend/.env.example backend/.env
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout backend/certs/localhost-key.pem \
  -out backend/certs/localhost-cert.pem \
  -days 365 -subj "/CN=localhost"
```

Inicie os dois projetos:

```bash
npm run dev
```

O frontend será servido em `http://localhost:5173` e o backend em `https://localhost:3000`.

Outros comandos disponíveis:

```bash
npm run build
npm test
npm run lint
npm run lint:fix
npm run format
npm run format:check
```
