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

## Prova de Conceito (POC) — Integração com a API do Gorilla

Esta POC implementa a coleta e consumo de dados de redes sociais através da API do Gorilla, adotando a estratégia de **pre-fetching** (coleta assíncrona prévia com persistência em cache local) para fornecer respostas instantâneas no backend.

### Como funciona:

1. **Script Coletor (`backend/scripts/fetch-gorilla.ts`):** 
   - Dispara uma busca via `POST` na API do Gorilla.
   - Executa um loop de sondagem (*polling*) via `GET` a cada 2 segundos até o status mudar para `completed`.
   - Salva o resultado retornado no arquivo local `backend/data/gorilla-sample.json`.
2. **Endpoint no Backend (`backend/src/app.ts`):** 
   - Cria a rota `GET /api/gorilla` no Express.
   - Lê o arquivo `gorilla-sample.json` de forma não-bloqueante (`readFile`) e entrega os dados como JSON.
   - Inclui cabeçalho de CORS liberando acesso para clientes.

### Como executar a POC:

1. **Configurar a chave de API:**
   No arquivo `backend/.env`, adicione sua chave de API:
   ```env
   GORILLA_API_KEY=grla_sua_chave_aqui
   ```

2. **Executar a coleta de dados:**
   A partir da raiz do repositório, rode o script:
   ```bash
   npx tsx backend/scripts/fetch-gorilla.ts
   ```
   *(O script buscará os dados na API e salvará o arquivo `backend/data/gorilla-sample.json`).*

3. **Iniciar o backend:**
   ```bash
   npm run dev --workspace backend
   ```

4. **Verificar os dados retornados:**
   Acesse pelo navegador em:
   ```text
   https://localhost:3000/api/gorilla
   ```
   Ou pelo terminal:
   ```bash
   curl -k https://localhost:3000/api/gorilla
   ```
