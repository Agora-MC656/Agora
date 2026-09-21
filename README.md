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

## Módulo Gorilla (`backend/src/modules/gorilla`)

Módulo responsável pela integração e fornecimento de dados da API do Gorilla no backend.

### Estrutura do Módulo:

* `gorilla.types.ts`: Tipagens e interfaces dos dados retornados pela API.
* `gorilla.service.ts`: Serviço que gerencia a leitura dos dados locais e o polling da API externa.
* `gorilla.controller.ts`: Controller que recebe requisições HTTP e devolve os dados estruturados.
* `gorilla.routes.ts`: Rota exposta em `/api/gorilla`.
* `gorilla.test.ts`: Testes automatizados com Vitest (unitários e de integração).

### Endpoints Disponíveis:

* `POST /api/gorilla/fetch`: Dispara uma nova busca na API externa do Gorilla (POST inicial + polling GET), persiste o resultado no arquivo local `backend/data/gorilla-sample.json` e retorna os dados atualizados. Opcionalmente aceita um corpo JSON `{ "query": "termo de busca" }`.
* `GET /api/gorilla`: Retorna instantaneamente os dados já armazenados no arquivo local sem consumir créditos da API.

### Como rodar os testes do módulo:

```bash
npm run test:coverage
```

### Como testar localmente:

1. **Configurar a chave de API (necessária para o POST):**
   No arquivo `backend/.env`:
   ```env
   GORILLA_API_KEY=grla_sua_chave_aqui
   ```

2. **Iniciar o backend:**
   ```bash
   npm run dev --workspace backend
   ```

3. **Disparar uma nova busca na API do Gorilla (POST):**
   Você pode passar o termo de busca diretamente na URL (recomendado para Windows PowerShell):
   ```powershell
   curl.exe -k -X POST "https://localhost:3000/api/gorilla/fetch?query=Gremio"
   ```
   Ou sem parâmetros (usará o tema padrão `"orçamento participativo"`):
   ```powershell
   curl.exe -k -X POST https://localhost:3000/api/gorilla/fetch
   ```

4. **Ler os dados retornados e cacheados (GET):**
   ```powershell
   curl.exe -k https://localhost:3000/api/gorilla
   ```

