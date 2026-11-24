import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import HomePage from "./HomePage";

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  it("apresenta o Ágora e leva para as três funcionalidades", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Ágora — participação acadêmica no IC/UNICAMP",
      }),
    ).toBeInTheDocument();

    const features = within(
      screen.getByRole("navigation", { name: "Funcionalidades" }),
    ).getAllByRole("link");
    expect(features.map((link) => link.getAttribute("href"))).toEqual([
      "/orcamento",
      "/votacao",
      "/debate",
    ]);
    expect(features[0]).toHaveTextContent("Consultar orçamento IC");
  });

  it("explica o papel do Conselho Interdepartamental e da Congregação", () => {
    renderPage();

    const steps = within(
      screen.getByRole("region", { name: "Como o orçamento do IC é decidido" }),
    ).getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent(
      "Conselho Interdepartamental. Elabora a proposta orçamentária",
    );
    expect(steps[1]).toHaveTextContent("Congregação. Órgão superior");
    expect(steps[2]).toHaveTextContent("As consultas são consultivas");
  });

  it("cita as fontes institucionais", () => {
    renderPage();

    expect(
      screen.getByRole("link", {
        name: "Regimento Interno do Instituto de Computação",
      }),
    ).toHaveAttribute("href", "https://www.pg.unicamp.br/norma/2834/1");
    expect(
      screen.getByRole("link", { name: "documentos publicados pelo IC" }),
    ).toHaveAttribute(
      "href",
      "https://ic.unicamp.br/sobre/regimentos-normas-e-documentos/",
    );
  });

  it("descreve o escopo desta versão", () => {
    renderPage();

    expect(
      screen.getByRole("region", { name: "Escopo desta versão" }),
    ).toHaveTextContent("previsão orçamentária de 2020");
  });
});
