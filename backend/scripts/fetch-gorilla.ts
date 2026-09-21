import dotenv from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
// Carrega especificamente o backend/.env relativo à localização deste script
dotenv.config({ path: resolve(import.meta.dirname, "../.env") });
const API_KEY = process.env.GORILLA_API_KEY;

if (!API_KEY) {
  console.error("Erro: GORILLA_API_KEY não foi definida no arquivo backend/.env");
  process.exit(1);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("1. Disparando busca na API do Gorilla...");

  // Dispara a busca (POST)
  const postResponse = await fetch("https://usegorilla.app/v1/v2-search-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY as string,
    },
    body: JSON.stringify({
      query: "orçamento participativo",
      since: "30d",
      limit: 5, // limite pequeno para gastar poucos créditos e ser rápido
    }),
  });

  if (!postResponse.ok) {
    const errorText = await postResponse.text();
    throw new Error(`Falha no POST (${postResponse.status}): ${errorText}`);
  }

  const { search_id } = await postResponse.json();
  console.log(`2. Busca iniciada com sucesso! search_id: ${search_id}`);

  // Loop de Polling (GET a cada 2 segundos até terminar)
  console.log("3. Aguardando a consolidação dos resultados...");
  let finalData: any = null;

  while (true) {
    await sleep(2000); // espera 2 segundos antes de perguntar novamente

    const pollResponse = await fetch(
      `https://usegorilla.app/v1/v2-search-stream?id=${search_id}`,
      {
        headers: {
          "x-api-key": API_KEY as string,
        },
      }
    );

    if (!pollResponse.ok) {
      throw new Error(`Erro no polling: ${pollResponse.statusText}`);
    }

    const data = await pollResponse.json();
    console.log(`   Status atual: ${data.status}`);

    if (data.status === "completed") {
      finalData = data;
      break;
    }
  }

  // Garante que a pasta data existe e salva o arquivo
  const dataDir = resolve("backend/data");
  await mkdir(dataDir, { recursive: true });

  const filePath = resolve(dataDir, "gorilla-sample.json");
  await writeFile(filePath, JSON.stringify(finalData, null, 2), "utf-8");

  console.log(`4. Sucesso! ${finalData.results?.length ?? 0} resultados salvos em: ${filePath}`);
}

run().catch(console.error);
