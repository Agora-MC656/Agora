import { NavLink } from "react-router-dom";

import "./HomePage.css";

const REGIMENTO_URL = "https://www.pg.unicamp.br/norma/2834/1";
const IC_DOCUMENTS_URL =
  "https://ic.unicamp.br/sobre/regimentos-normas-e-documentos/";

const FEATURES = [
  {
    to: "/orcamento",
    title: "Consultar orçamento IC",
    description:
      "Veja a previsão orçamentária do instituto por seção, com explicações dos termos e busca por item.",
  },
  {
    to: "/votacao",
    title: "Acompanhar pautas e votar",
    description:
      "Conheça as pautas, vote uma vez em cada uma e acompanhe a apuração.",
  },
  {
    to: "/debate",
    title: "Explorar opinião pública",
    description:
      "Leia manifestações públicas em redes sociais e filtre por palavra-chave.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">
          <span className="accent">Instituto de Computação</span> · Unicamp ·
          Previsão orçamentária 2020
        </p>
        <h1>Ágora — participação acadêmica no IC/UNICAMP</h1>
        <p className="lead">
          O Ágora aproxima a comunidade do Instituto de Computação do orçamento
          do instituto: torna a proposta orçamentária fácil de ler, reúne a
          opinião da comunidade em consultas e mostra o que está sendo dito
          publicamente sobre os temas.
        </p>
        <nav className="feature-grid" aria-label="Funcionalidades">
          {FEATURES.map((feature, index) => (
            <NavLink key={feature.to} to={feature.to} className="feature-card">
              <span className="feature-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{feature.title}</strong>
              <span className="feature-description">{feature.description}</span>
              <span className="feature-go" aria-hidden="true">
                Abrir →
              </span>
            </NavLink>
          ))}
        </nav>
      </section>

      <section className="home-section" aria-labelledby="how-it-works">
        <div className="section-head">
          <p className="eyebrow">Regimento Interno do IC</p>
          <h2 id="how-it-works">Como o orçamento do IC é decidido</h2>
          <p className="page-lead">
            O Regimento Interno do IC define dois órgãos colegiados que tratam
            do orçamento:
          </p>
        </div>
        <ol className="steps">
          <li>
            <span className="step-number" aria-hidden="true">
              01 · Elabora
            </span>
            <strong>Conselho Interdepartamental.</strong> Elabora a proposta
            orçamentária do instituto e acompanha sua execução. É formado pelo
            diretor, pelos chefes de departamento, pelos responsáveis pela
            graduação, pós-graduação, extensão e pesquisa, e por representantes
            eleitos dos alunos e dos servidores. Reúne-se mensalmente.
          </li>
          <li>
            <span className="step-number" aria-hidden="true">
              02 · Delibera
            </span>
            <strong>Congregação.</strong> Órgão superior do instituto, com
            docentes, alunos e servidores. Define os critérios do orçamento e
            delibera sobre o parecer do Conselho Interdepartamental antes que a
            proposta siga para as instâncias superiores da Unicamp. Reúne-se a
            cada dois meses.
          </li>
          <li className="community">
            <span className="step-number" aria-hidden="true">
              03 · Participa
            </span>
            <strong>Comunidade.</strong> O Ágora não substitui esses órgãos. As
            consultas são consultivas: mostram a preferência da comunidade e
            podem apoiar a atuação dos seus representantes.
          </li>
        </ol>
        <p className="sources">
          Fontes:{" "}
          <a href={REGIMENTO_URL} target="_blank" rel="noreferrer">
            Regimento Interno do Instituto de Computação
          </a>{" "}
          e{" "}
          <a href={IC_DOCUMENTS_URL} target="_blank" rel="noreferrer">
            documentos publicados pelo IC
          </a>
          .
        </p>
      </section>

      <section className="home-section scope" aria-labelledby="scope">
        <p className="eyebrow">Versão atual</p>
        <h2 id="scope">Escopo desta versão</h2>
        <p className="page-lead">
          Esta versão cobre o Instituto de Computação e a previsão orçamentária
          de 2020, a proposta publicada pelo instituto. Outros contextos e a
          geração automática de pautas ficam para versões futuras, que podem
          reaproveitar os módulos do backend.
        </p>
      </section>
    </div>
  );
}
