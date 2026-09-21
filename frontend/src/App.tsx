import { useState, type FormEvent } from "react";

type Agenda = { title: string; items: string[] };

export default function App() {
  const [context, setContext] = useState("");
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAgenda(null);

    try {
      const response = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Não foi possível gerar a pauta.";
        throw new Error(message);
      }

      setAgenda(result as Agenda);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível gerar a pauta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Gerador de pautas</h1>
      <p className="mb-6 text-gray-600">
        Descreva o tema ou objetivo da reunião para organizar os pontos de
        discussão.
      </p>

      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="space-y-3"
      >
        <label htmlFor="context" className="block font-medium">
          Tema ou contexto
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(event) => setContext(event.target.value)}
          maxLength={500}
          required
          rows={5}
          className="w-full rounded border border-gray-300 p-3"
          placeholder="Ex.: decidir as prioridades do orçamento do próximo semestre"
        />
        <button
          type="submit"
          disabled={loading || !context.trim()}
          className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar pauta"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>
      )}

      {agenda && (
        <section className="mt-8" aria-label="Pauta gerada">
          <h2 className="mb-3 text-2xl font-semibold">{agenda.title}</h2>
          <ol className="list-decimal space-y-2 pl-6">
            {agenda.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
