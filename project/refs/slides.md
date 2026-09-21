# Base de Conhecimento — Engenharia de Software

- **Processos são contextuais**: os próprios materiais rejeitam a ideia de uma “receita de bolo” universal.

---

## Introdução à Engenharia de Software
### Natureza e definição de software
Software inclui o programa que executa instruções para atingir um objetivo, os dados necessários para sua execução e a documentação associada ou sua especificação. É um elemento lógico, abstrato e intangível.
**Pontos-chave**
- Software não é um artefato físico e não é manufaturado no sentido clássico.
- A ausência de limitações físicas dá flexibilidade, mas também permite que a complexidade e o custo cresçam rapidamente.
- O material resume a evolução dizendo que software não 'desgasta' como hardware, mas pode se deteriorar em consequência de mudanças.

**Relações:** complexidade, manutenção, evolução, engenharia de software

**Fonte:** `Introducao a Engenharia de Software (1).pdf` p. 4, 5, 6, 8

### Engenharia de Software
Engenharia de Software é a disciplina de engenharia preocupada com todos os aspectos do desenvolvimento, desde os estágios iniciais de especificação até a manutenção após o sistema entrar em uso. Engloba processos, métodos/práticas e ferramentas.
**Pontos-chave**
- O custo do software está fortemente concentrado em sua engenharia.
- A atividade envolve análise de problemas e síntese de soluções; o design é central.
- Manter e evoluir sistemas complexos é uma preocupação fundamental.

**Relações:** processo de software, métodos, ferramentas, design, manutenção

**Fonte:** `Introducao a Engenharia de Software (1).pdf` p. 3, 8, 10

### Qualidade de software é multidimensional
Qualidade não é uma propriedade única: depende de expectativas, perspectivas e necessidades explícitas e implícitas. Pode ser vista como conformidade com requisitos e também como satisfação do cliente/usuário.
**Pontos-chave**
- Características observadas podem divergir das especificadas.
- Problemas podem existir tanto na especificação quanto na observação/avaliação.
- Qualidade interna/externa considera o produto; qualidade em uso considera o usuário em um contexto específico.

**Relações:** requisitos, qualidade em uso, métricas, garantia da qualidade, controle da qualidade

**Fonte:** `Introducao a Engenharia de Software (1).pdf` p. 14, 15, 16, 18, 19, 24

### Características de qualidade no ISO SQuaRE apresentadas no material
O material usa o modelo ISO SQuaRE para organizar características de qualidade de produto.
**Pontos-chave**
- Desempenho: desempenho em relação à quantidade de recursos usada nas condições estabelecidas.
- Compatibilidade: capacidade de trocar informações/coexistir e realizar funções no mesmo ambiente.
- Usabilidade: eficácia, eficiência e satisfação de usuários específicos em contexto de uso.
- Confiabilidade: realizar funções especificadas sob determinadas condições por um período.
- Segurança: proteger informação/dados e controlar níveis/tipos de acesso e autorização.
- Manutenibilidade: eficácia e eficiência com que o produto pode ser modificado.
- Portabilidade: eficácia e eficiência para transferir o sistema entre ambientes.

**Relações:** qualidade de produto, requisitos não funcionais, métricas

**Fonte:** `Introducao a Engenharia de Software (1).pdf` p. 35

### Garantia da Qualidade versus Controle da Qualidade
Garantia da Qualidade (QA) é orientada ao processo e à prevenção; Controle da Qualidade (QC) é orientado ao produto e à detecção/correção de defeitos.
**Pontos-chave**
- QA avalia se o processo definido foi seguido e é efetivo; usa procedimentos, padrões, treinamentos e monitoramento de processos.
- QC usa técnicas como revisões e testes para avaliar se os artefatos possuem a qualidade planejada.
- QA procura garantir que a equipe trabalha da forma adequada; QC verifica conformidade do produto.

**Relações:** processo, produto, prevenção, detecção, testes, revisões

**Fonte:** `Introducao a Engenharia de Software (1).pdf` p. 26, 27, 28, 29, 30

### Medição de qualidade
A qualidade pode ser aferida por opiniões, fatos, métricas e modelos; métricas podem ser de produto, processo ou recursos e precisam de validade teórica e empírica.
**Pontos-chave**
- Exemplos de produto: falhas por semana, complexidade ciclomática, fan-in/fan-out.
- Exemplos de processo: produtividade média, esforço de manutenção, taxa de detecção de defeitos.
- Exemplos de recursos: produtividade individual/equipe, custo por hora, experiência.

**Relações:** ISO SQuaRE, qualidade, medição, processo

**Fonte:** `Introducao a Engenharia de Software (1).pdf` p. 20, 21, 22, 23

### Visão sociotécnica
O material apresenta Engenharia de Software como atividade sociotécnica: a complexidade deve ser entendida sem separar rigidamente aspectos técnicos e humanos.
**Pontos-chave**
- Técnico e não técnico estão entrelaçados.
- Há conhecimento tácito/não formalizável.
- Modelos formais do trabalho podem não capturar tudo que ocorre na prática.

**Relações:** pessoas, organização, produto, processo, conhecimento tácito

**Fonte:** `Introducao a Engenharia de Software (1).pdf` p. 31, 32, 33, 34

---

## Processos de Software
### Definição de processo de software
Processo de software é uma sequência de atividades que leva à produção de software de qualidade. Utiliza recursos, produz artefatos intermediários e finais, opera sob restrições e pode ser decomposto em subprocessos interligados.
**Pontos-chave**
- Atividades têm critérios de entrada e saída.
- Princípios explicam os objetivos das atividades.
- O processo deve ser adaptado ao contexto; não existe uma receita universal.

**Relações:** atividades, artefatos, recursos, restrições, adaptação

**Fonte:** `Processos de Software (1).pdf` p. 2, 5, 6

### Atividades fundamentais e guarda-chuva
As quatro atividades fundamentais são especificação, desenvolvimento, validação e evolução. Atividades guarda-chuva atravessam o projeto.
**Pontos-chave**
- Especificação: define o software e restrições operacionais.
- Desenvolvimento: projeta e implementa o software.
- Validação: verifica se o software satisfaz requisitos.
- Evolução: modifica o software para refletir mudanças nos requisitos.
- Guarda-chuva: monitoramento/controle, riscos, qualidade, revisões técnicas, medição, gerência de configuração e reutilização.

**Relações:** ciclo de vida, V&V, evolução, gerência de configuração, qualidade

**Fonte:** `Processos de Software (1).pdf` p. 3

### Processo deve ser contextual
O processo de um projeto é particular: varia no fluxo/dependências, detalhamento das atividades, artefatos, intensidade das atividades guarda-chuva, rigor, envolvimento de stakeholders, autonomia da equipe e prescrição de papéis.
**Pontos-chave**
- Processo é intelectual e criativo.
- Decisões e julgamentos humanos são centrais.
- Confiança excessiva no processo pode prejudicar; é necessário equilibrar disciplina e criatividade.

**Relações:** contexto organizacional, autonomia, stakeholders, disciplina, criatividade

**Fonte:** `Processos de Software (1).pdf` p. 5, 6, 7

### Modelo Cascata / Sequencial
Adequado, no cenário proposto pelo material, quando requisitos são bem definidos e estáveis e o fluxo pode ser tratado de maneira sequencial.
**Pontos-chave**
- É difícil explicitar todos os requisitos no início.
- Software utilizável tende a aparecer tarde.
- Mudanças grandes podem inviabilizar o projeto.
- Há espera entre equipes/atividades e mudanças podem exigir repetição de etapas anteriores.

**Relações:** modelo prescritivo, requisitos estáveis, mudança, feedback tardio

**Fonte:** `Processos de Software (1).pdf` p. 8, 9

### Modelo-V
O Modelo-V parte de um cenário semelhante ao cascata, mas enfatiza Verificação e Validação (V&V).
**Pontos-chave**
- Permite algum paralelismo no planejamento/projeto dos testes.
- Mantém desvantagens do cascata.
- Aumenta esforço e custo devido à maior ênfase em V&V.

**Relações:** cascata, verificação, validação, testes

**Fonte:** `Processos de Software (1).pdf` p. 10, 11

### Modelo Incremental
Entrega o produto em incrementos sucessivos. Identifica primeiro o núcleo/requisitos básicos e repete fluxos sequenciais até completar o produto.
**Pontos-chave**
- Melhora gestão de incerteza e facilita mudanças em comparação ao cascata.
- Facilita feedback e entrega mais cedo de software útil.
- Incrementos podem exigir menos pessoas.
- Incrementos grandes podem causar espera/retrabalho; a estrutura pode degradar com adições sucessivas.

**Relações:** incrementos, feedback, mudança, arquitetura

**Fonte:** `Processos de Software (1).pdf` p. 12, 13

### Modelo Iterativo
Baseia-se em refinamentos sucessivos: uma versão do sistema é disponibilizada e funcionalidades dos subsistemas são modificadas a cada nova liberação.
**Pontos-chave**
- Gerencia melhor incertezas do que cascata.
- Facilita mudanças localizadas e feedback.
- Pode acelerar entrega/implantação de software útil.
- Pode ser difícil ter uma versão suficientemente completa logo na primeira iteração.

**Relações:** iteração, refinamento, feedback, incremental

**Fonte:** `Processos de Software (1).pdf` p. 14, 15

### Modelos evolucionários: prototipação e espiral
Modelos evolucionários servem a cenários com pressões externas e incerteza, quando alguns requisitos-chave já são conhecidos e o produto deve evoluir com o tempo.
**Pontos-chave**
- Prototipação foca aspectos visíveis ao usuário; protótipos são avaliados por stakeholders e podem ser descartados ou reutilizados.
- Prototipação é útil quando requisitos carecem de detalhes e para V&V, mas protótipos podem induzir decisões ruins de design/tecnologia.
- Espiral aumenta ciclicamente o nível de definição/implementação e é orientado a riscos; o risco tende a reduzir ao longo das iterações.

**Relações:** incerteza, prototipação, espiral, riscos, stakeholders

**Fonte:** `Processos de Software (1).pdf` p. 16, 17, 18, 19

### Outras abordagens de processo
O material inclui desenvolvimento baseado em componentes, métodos formais e Processo Unificado.
**Pontos-chave**
- Componentes: alto reúso com interfaces bem definidas; pode aumentar qualidade/produtividade, mas força compromissos com componentes existentes e reduz controle sobre evolução.
- Métodos formais: especificação matemática para reduzir ambiguidade/incompletude/inconsistência; custo/tempo e necessidade de conhecimento especializado são limitações.
- Processo Unificado: orientado a casos de uso, centrado em arquitetura, iterativo e incremental.

**Relações:** reúso, formalismo, arquitetura, casos de uso

**Fonte:** `Processos de Software (1).pdf` p. 20, 21, 22

### Melhoria de processos
Melhoria de processos envolve avaliar e aperfeiçoar processos por modelos de maturidade/capacidades e métodos de avaliação.
**Pontos-chave**
- Exemplos citados: CMMI, ISO 12207, MPS.BR (MR-MPS).
- Métodos de avaliação citados: SCAMPI/CMM, SPICE/ISO 15504, MA-MPS.
- Kanban também aparece como método de melhoria contínua.

**Relações:** maturidade, capacidade, avaliação, melhoria contínua

**Fonte:** `Processos de Software (1).pdf` p. 26

---

## Desenvolvimento Ágil e Enxuto
### Objetivo e valores ágeis
O objetivo enfatizado é entrega contínua de software funcionando em ciclos curtos, para demonstrar progresso, verificar necessidades e obter feedback cedo.
**Pontos-chave**
- Indivíduos e interações > processos e ferramentas.
- Software funcionando > documentação abrangente.
- Colaboração com o cliente > negociação de contratos.
- Responder a mudanças > seguir um plano.

**Relações:** feedback, entrega contínua, Manifesto Ágil, mudança

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 5, 6

### Princípios ágeis destacados
Os materiais enfatizam colaboração diária entre negócio e desenvolvimento, equipes motivadas e auto-organizáveis, comunicação direta, software funcional como medida de progresso, simplicidade e excelência técnica.
**Pontos-chave**
- Satisfação do cliente por entrega antecipada e contínua de valor.
- Mudanças de requisitos são aceitas inclusive tardiamente.
- Entrega frequente em ciclos curtos.
- Ritmo sustentável.
- Reflexão e ajuste contínuos.

**Relações:** cliente, equipe, sustentabilidade, simplicidade, excelência técnica

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 7, 8

### Scrum no material
O Scrum é apresentado como ciclo repetitivo em que o Product Owner mantém/demanda trabalho no Product Backlog, a equipe seleciona parte dele para a Sprint, produz um incremento de valor e depois equipe/stakeholders inspecionam resultados e ajustam a próxima Sprint.
**Pontos-chave**
- Elementos visuais incluem Product Backlog, Sprint Planning, Sprint Backlog, Daily Scrum, Sprint Review e Sprint Retrospective.
- Planejamento é adaptativo e orientado à prioridade do backlog.
- O material atribui ao Product Owner responsabilidade pelo Product Backlog.

**Relações:** sprint, product backlog, incremento, review, retrospective, daily scrum

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 12, 13, 22, 39

### Extreme Programming (XP)
XP é apresentado como método fortemente iterativo, com histórias, pequenas liberações, feedback contínuo, testes, integração contínua, programação em pares e base coletiva de código.
**Pontos-chave**
- Práticas associadas no diagrama: on-site customer, planning game, 40-hour week, simple design, short releases, testing, refactoring, pair programming, coding standards, collective ownership e continuous integration.
- O cliente em XP escreve histórias e testes funcionais, define prioridade e quando um requisito está satisfeito.

**Relações:** histórias de usuário, programação em pares, TDD, refatoração, integração contínua

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 14, 15, 38

### Requisitos e planejamento ágil
Requisitos são trabalhados com cliente presente, feedback imediato e histórias de usuário/features. Planejamento usa iterações curtas, backlog priorizado, time-boxing e planejamento adaptativo.
**Pontos-chave**
- Histórias/features ajudam a acompanhar progresso.
- Features prioritárias são selecionadas para a próxima iteração.
- O backlog pode mudar; isso reduz risco de construir features desnecessárias.
- No time-boxing, datas são fixas e escopo se adapta ao prazo.
- Planning game envolve cliente, desenvolvedores e gerentes para alinhar prioridade e implementação.

**Relações:** backlog, priorização, histórias, time-boxing, planning game

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 17, 22, 23

### Práticas técnicas e de qualidade ágeis
A agilidade depende de práticas técnicas que tornam mudanças mais seguras e baratas.
**Pontos-chave**
- Refactoring: melhoria contínua de manutenibilidade, legibilidade e simplificação.
- Padrões de codificação promovem uniformidade.
- Posse coletiva permite que todos alterem o código.
- Arquitetura de baixa dependência aumenta flexibilidade.
- Programação em pares fornece revisão contínua.
- TDD implementa casos de teste antes da funcionalidade e favorece automação.
- Integração contínua segue ciclo integrate-build-test.
- Gerência de configuração preserva consistência entre versões e integridade.

**Relações:** refatoração, pair programming, TDD, CI, controle de versão

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 18, 19, 20

### Organização da equipe ágil
O material favorece equipes co-localizadas, multifuncionais e autônomas, com comunicação direta, redução de handoffs/documentação adicional e ritmo sustentável.
**Pontos-chave**
- Stand-ups diários curtos: o que foi feito, o que será feito, impedimentos.
- Evitar horas extras como rotina; pessoas descansadas cometem menos erros.
- Autonomia aumenta comprometimento e alinha tarefas às competências.

**Relações:** comunicação, autonomia, stand-up, ritmo sustentável

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 24, 25

### Princípios Lean para software
Lean é apresentado por sete princípios: eliminar desperdício, amplificar aprendizado, decidir o mais tarde possível, entregar o mais rápido possível, empoderar a equipe, construir com qualidade e ver o todo fim-a-fim.
**Pontos-chave**
- Fluxo Lean: definir valor, mapear cadeia de valor, criar fluxo, estabelecer sistema puxado e perseguir perfeição.
- Exemplos de desperdício em software: trabalho parcialmente pronto, reaprendizado, features extras, handoffs, atrasos, troca de contexto e defeitos.

**Relações:** valor, fluxo, desperdício, pull, qualidade

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 27, 29

### Fluxo fim-a-fim e Kanban
Lean enfatiza otimizar o fluxo fim-a-fim, não apenas etapas isoladas. Value-stream mapping busca tempos de espera e oportunidades de melhoria; teoria de filas/restrições ajuda a tratar gargalos.
**Pontos-chave**
- Kanban implementa sistema puxado: requisitos são retirados conforme prioridade do cliente e capacidade da equipe.
- O sistema puxado evita sobrecarga e reduz dependência de planejamento de longo prazo.
- O quadro Kanban torna o progresso visível.

**Relações:** value stream, teoria das restrições, WIP, pull system, backlog

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 31, 32, 33

### Liberações incrementais
Ágil/Lean tratam releases como incrementos sucessivos, permitindo ao cliente receber valor continuamente.
**Pontos-chave**
- Liberação interna: software em qualidade suficiente para liberar, mas retido por razões estratégicas.
- Liberação externa: software efetivamente liberado ao usuário/cliente.

**Relações:** release, incremento, entrega contínua, valor

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 21

### DevOps: motivação e definição
DevOps é apresentado como movimento que muda a atitude sobre entrega de software por colaboração entre desenvolvimento e operações, apoiada por cultura, automação, medição e compartilhamento.
**Pontos-chave**
- Motivações: entregas frequentes/SaaS, comunicação Dev-Ops ineficiente, ambientes burocráticos, requisitos não funcionais, escalabilidade, gargalos de release e conflitos sociotécnicos.
- A agilidade no desenvolvimento pode expor gargalos operacionais; DevOps amplia o foco para o fluxo até produção.

**Relações:** desenvolvimento, operações, entrega, automação, cultura

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 36, 37, 45, 46, 47, 48

### Princípios e práticas DevOps
O material organiza DevOps em aspectos sociais, automação, medição, compartilhamento, garantia da qualidade e leanness; o conjunto C-A-M-S destaca Culture, Automation, Measurement e Sharing.
**Pontos-chave**
- Práticas colaborativas: objetivos comuns Dev/Ops, canais de comunicação, resposta conjunta a incidentes, observação direta, métricas visíveis, comunicação face a face, equipes estáveis e compartilhamento de responsabilidade.
- Práticas de processo: métricas comuns, controle de versão para ambientes reproduzíveis, pipeline de deployment, product management, postmortem, release management e pipelines padronizados.
- Práticas de desenvolvimento: testes automatizados, peer review, testes de segurança, CI, gestão de configuração, requisitos não funcionais e qualidade.
- Práticas de operações: monitoramento contínuo, gerenciamento de configuração de infraestrutura, virtualização de ambientes, análise de dados de produção, provisionamento automatizado e monitoramento de usuários.

**Relações:** CAMS, pipeline, observabilidade, infraestrutura, CI, qualidade

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 50, 51, 52, 53

### Benefícios e limitações dos métodos ágeis reportados
Os slides resumem evidências empíricas com benefícios de colaboração, feedback, adaptação e satisfação, mas também limitações e dependência do contexto.
**Pontos-chave**
- Programação em pares pode ser ineficiente/exaustiva em algumas situações.
- XP pode depender mais de desenvolvedores experientes.
- Há relatos de menor atenção a projeto/arquitetura.
- Cliente co-locado pode ser estressante e não sustentável.
- Habilidades interpessoais, confiança e equilíbrio entre autonomia e responsabilidade corporativa são fatores críticos.
- Resultados sobre qualidade são geralmente positivos, mas o material ressalta limitações metodológicas e evidência inconclusiva em alguns estudos.

**Relações:** evidência empírica, contexto, fatores humanos, arquitetura, qualidade

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 62, 63, 64, 65, 66, 67, 68, 69

---

## Gerenciamento de Configuração
### Gerenciamento de configuração
Gerenciamento de configuração é o subprocesso voltado ao controle da evolução de sistemas de software complexos. Uma configuração é um conjunto de versões específicas de cada artefato/item de configuração.
**Pontos-chave**
- Abrange solicitação de mudança, análise de impacto, rastreabilidade e continuidade de entrega.
- Inclui controle de versão, build, dependências/automação, release e pipeline de deploy.

**Relações:** mudança, rastreabilidade, versionamento, build, release, deploy

**Fonte:** `Gerenciamento de Configuracao.pdf` p. 4, 5

### Conceitos de controle de versão
Versão/revisão representa o estado de um artefato após criação ou alterações. Repositório guarda artefatos sob controle de versão; workspace é a cópia local do usuário e pode estar sincronizado ou não.
**Pontos-chave**
- Modelos podem ser cliente-servidor ou distribuídos.
- No distribuído há repositório local e remoto.

**Relações:** repositório, workspace, versão, distribuído, cliente-servidor

**Fonte:** `Gerenciamento de Configuracao.pdf` p. 6, 7, 8

### Operações de versionamento
Operações centrais: add coloca artefato sob controle; commit submete nova versão; update/check-out recupera versão; push envia alterações a remoto; pull traz alterações; log mantém histórico ordenado.
**Pontos-chave**
- Em Git, staging area funciona como buffer para agrupar logicamente conteúdo de commits.
- fetch importa commits do remoto sem necessariamente integrar; pull sincroniza recuperando mudanças; push envia mudanças.

**Relações:** Git, staging, commit, push, pull, fetch, histórico

**Fonte:** `Gerenciamento de Configuracao.pdf` p. 9, 16, 17, 19, 21

### Recuperação e desfazer alterações em Git
O material diferencia checkout, revert e reset para recuperar estados.
**Pontos-chave**
- checkout <commit>: move para o commit especificado sem alterar a árvore histórica.
- revert: desfaz o efeito de um commit gerando um novo commit.
- reset: move o estado do repositório local para outro ponto e pode deixar commits órfãos.

**Relações:** Git, histórico, revert, reset, checkout

**Fonte:** `Gerenciamento de Configuracao.pdf` p. 18

### Branch, merge e branch por feature
Branches separam linhas de desenvolvimento e merges as reúnem. O material mostra branch-per-feature e um fluxo inspirado em Gitflow.
**Pontos-chave**
- Para cada feature cria-se branch; desenvolvimento ocorre nela; ao final ela é integrada à principal.
- Fluxo fim-a-fim mostrado: issue → branch a partir de develop → desenvolvimento → pull request → revisão → merge em develop → fechar issue.
- Gitflow citado: master, develop, feature branch e release branch.

**Relações:** branch, merge, pull request, Gitflow, feature

**Fonte:** `Gerenciamento de Configuracao.pdf` p. 24, 26, 27, 28

### Tags e releases
Tags são referências para pontos específicos do histórico, tratadas como uma fotografia/configuração e usadas para marcar releases.
**Pontos-chave**
- Exemplo conceitual: tag v1.2.1.
- Metáfora apresentada: branch que não muda.

**Relações:** release, histórico, versão, configuração

**Fonte:** `Gerenciamento de Configuracao.pdf` p. 29

### Boas práticas de controle de versão
Os materiais recomendam sincronização frequente, commits comentados, limpeza do repositório, coordenação antes de merges/grandes mudanças e manutenção de uma branch principal funcional.
**Pontos-chave**
- Atualizar antes de usar/modificar.
- Não adicionar itens alheios ao projeto nem usar o repositório compartilhado para testes improvisados.
- Comunicar mudanças relevantes via pull/merge request.
- Material sugere branches separadas para trabalho paralelo e branch/release workflow.

**Relações:** main, pull request, sincronização, commit, release

**Fonte:** `Gerenciamento de Configuracao.pdf` p. 30

---

## Integração Contínua
### Motivação e definição de Integração Contínua
Integração Contínua (CI) busca integrar e construir o sistema muitas vezes ao dia, idealmente sempre que uma tarefa é concluída.
**Pontos-chave**
- Motivações: time-to-market, mudanças externas, qualidade, requisitos não funcionais, infraestrutura complexa, SaaS, riscos de release e pouco feedback de uso.
- Incrementos pequenos reduzem conflitos e esforço de integração, facilitam detecção/remoção de defeitos e mantêm a aplicação em estado funcional.

**Relações:** feedback, build, testes, frequência, incrementos pequenos

**Fonte:** `Integracao Continua.pdf` p. 2, 5, 6

### Pressupostos para CI
CI depende de controle de versão, build automatizado e comprometimento da equipe.
**Pontos-chave**
- Tudo necessário para instalar, executar e testar deve estar no repositório: código, configurações, scripts de teste, build e deployment.
- Scripts de build são tratados como código da aplicação.
- CI é uma prática organizacional, não apenas uma ferramenta.

**Relações:** controle de versão, build automatizado, cultura, reprodutibilidade

**Fonte:** `Integracao Continua.pdf` p. 8

### Build automatizado
Build automatizado usa scripts/ferramentas para construir um executável/pacote de maneira repetível; todos os arquivos necessários devem estar versionados.
**Pontos-chave**
- O material ilustra Maven com ciclo default: validate → compile → test → package → integration-test → verify → install → deploy.
- Automatizar build reduz variação manual e sustenta CI.

**Relações:** Maven, automação, reprodutibilidade, testes, deploy

**Fonte:** `Integracao Continua.pdf` p. 10, 13, 14

### Servidor e pipeline de CI
Servidores de CI funcionam como escalonadores/orquestradores de tarefas e executam fluxos configuráveis de build, teste e eventualmente deploy.
**Pontos-chave**
- GitLab CI usa arquivo .gitlab-ci.yml e runners; o material exemplifica stages build, test e deploy.
- GitHub Actions usa workflows YAML em .github/workflows/*.yml.

**Relações:** pipeline, GitLab Runner, GitHub Actions, YAML, jobs

**Fonte:** `Integracao Continua.pdf` p. 15, 16, 17, 18

### Fluxo recomendado antes e depois do commit
Antes de submeter, verifique que o build atual está verde, sincronize o workspace, execute build/testes localmente, então faça commit/push e espere o servidor de CI validar as alterações.
**Pontos-chave**
- Se a build do servidor falhar, corrija imediatamente ou reverta.
- Não empilhe novas mudanças sobre uma build quebrada.
- Servidor de CI não deve ser usado como ferramenta de debug.

**Relações:** keep it green, commit, build, testes, revert

**Fonte:** `Integracao Continua.pdf` p. 19, 20, 22

### Práticas e cultura de CI
CI exige commits frequentes, suíte automatizada com boa cobertura, builds/testes rápidos e disciplina para nunca abandonar o repositório em estado instável.
**Pontos-chave**
- Commit Daily, Commit Often → Build Early, Build Often.
- Não ignorar testes falhos.
- Ferramentas sozinhas não bastam; frequência de integração depende de disciplina e awareness compartilhada.

**Relações:** cultura, disciplina, cobertura, feedback rápido, keep it green

**Fonte:** `Integracao Continua.pdf` p. 20, 21, 22

---

## Testes Automatizados
### Teste de software e oráculo
Um teste executa o produto com casos de teste e compara o resultado obtido com o resultado esperado definido por um oráculo.
**Pontos-chave**
- O testador seleciona entradas possíveis e constrói casos de teste.
- O oráculo representa o critério usado para decidir se o resultado está correto.

**Relações:** caso de teste, oráculo, resultado esperado, SUT

**Fonte:** `Testes Automatizados.pdf` p. 2

### Por que automatizar testes
Testes automatizados ajudam a manter percepção do estado funcional da base, aceleram regressão, permitem testes contínuos e expõem módulos de baixa testabilidade que podem demandar refatoração.
**Pontos-chave**
- A automação torna feedback repetível e rápido.
- Baixa testabilidade pode ser um sinal de design que dificulta isolamento.

**Relações:** regressão, CI, testabilidade, refatoração

**Fonte:** `Testes Automatizados.pdf` p. 3

### Ciclo de execução: SetUp, Run, TearDown
O ciclo de um teste automatizado inclui preparar dados/estruturas temporárias (SetUp), executar a suíte e produzir resultados (Run) e destruir/limpar recursos temporários (TearDown).
**Pontos-chave**
- Exemplo do material: criar usuário → executar login e verificar sucesso → remover usuário.

**Relações:** fixture, setup, teardown, isolamento

**Fonte:** `Testes Automatizados.pdf` p. 4, 5

### Estrutura de um caso de teste e asserções
Um caso de teste inclui entradas, procedimento e resultado esperado. O resultado pode envolver retorno, estados modificados, exceções, logs etc.; asserções verificam as expectativas.
**Pontos-chave**
- Um módulo de teste pode conter vários casos/métodos.
- AssertTrue/AssertFalse verificam condições; AssertException espera uma exceção.
- Asserções codificam o oráculo no teste automatizado.

**Relações:** asserção, oráculo, resultado esperado, caso de teste

**Fonte:** `Testes Automatizados.pdf` p. 7, 8, 9, 10

### Dublês de teste
Dublês substituem colaboradores reais para tornar testes mais controláveis e isolados.
**Pontos-chave**
- Dummy: passado apenas para preencher parâmetros, não é usado.
- Fake: implementação funcional simplificada com atalhos inviáveis em produção, como banco em memória.
- Stub: devolve respostas pré-programadas e auxilia verificação de estado.
- Spy: stub que registra informações sobre como foi chamado.
- Mock: possui expectativas pré-programadas sobre chamadas e verifica comportamento.
- Mocks aparecem com frequência em TDD/BDD.

**Relações:** isolamento, dependência, mock, stub, spy, fake, dummy

**Fonte:** `Testes Automatizados.pdf` p. 11, 12

### Design para testabilidade
O material associa dublês a interfaces/herança e wrappers para desacoplar o módulo em teste de dependências concretas e tornar o código mais testável.
**Pontos-chave**
- Quanto mais uma dependência pode ser substituída/controlada, mais fácil testar cenários específicos.
- Testabilidade é também um sinal útil para oportunidades de refatoração.

**Relações:** interfaces, herança, wrapper, injeção de dependência, refatoração

**Fonte:** `Testes Automatizados.pdf` p. 13, 14

---

## Relações entre os materiais
### Feedback curto como princípio unificador
Os materiais convergem em reduzir o tempo entre uma mudança e a descoberta de seu efeito: ágil encurta ciclos com cliente, testes automatizados encurtam validação técnica, CI encurta integração e DevOps encurta feedback de operação/produção.
**Pontos-chave**
- Quanto menor o lote de mudança, menor tende a ser o custo de integração e diagnóstico.
- Software funcionando e testado é usado como evidência de progresso.

**Relações:** Agile, CI, testes, DevOps, feedback

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 5, 8, 19; `Integracao Continua.pdf` p. 5, 6, 20; `Testes Automatizados.pdf` p. 3

### Capacidade de mudar com segurança
Agilidade depende de infraestrutura técnica de mudança: refatoração e baixo acoplamento reduzem custo de mudança; controle de versão preserva histórico e coordena trabalho; testes detectam regressões; CI integra continuamente; DevOps estende a automação e observabilidade até operações.
**Pontos-chave**
- Responder a mudanças não significa ausência de disciplina.
- Quanto maior a frequência de mudança, maior a importância de automação, rastreabilidade e qualidade contínua.

**Relações:** refatoração, versionamento, testes, CI, DevOps

**Fonte:** `Desenvolvimento Agil (1).pdf` p. 18, 19, 20, 48, 50; `Gerenciamento de Configuracao.pdf` p. 4, 5, 30; `Integracao Continua.pdf` p. 8, 20

### Não existe processo universal
A seleção entre cascata, incremental, iterativo, evolucionário, ágil, Lean ou outras abordagens deve considerar estabilidade de requisitos, riscos, necessidade de feedback, capacidade da equipe, contexto organizacional e exigências de qualidade/conformidade.
**Pontos-chave**
- Cascata pressupõe maior estabilidade.
- Incremental/iterativo favorecem feedback e mudança.
- Espiral favorece tratamento explícito de riscos.
- Ágil/Lean favorecem ciclos curtos, adaptação e fluxo de valor.

**Relações:** contexto, risco, feedback, mudança, processo

**Fonte:** `Processos de Software (1).pdf` p. 5, 6, 8, 12, 14, 16, 18, 23; `Desenvolvimento Agil (1).pdf` p. 5, 27

---

## Glossário mínimo para recuperação semântica

- **Artefato**: produto intermediário ou final criado no processo.
- **Build**: construção automatizada do software/pacote executável.
- **CI / Integração Contínua**: integrar, construir e testar mudanças frequentemente.
- **Configuração**: conjunto de versões específicas dos itens de configuração.
- **Deploy**: implantação do software em um ambiente.
- **Incremento**: parcela funcional de valor adicionada ao produto.
- **Oráculo de teste**: referência usada para decidir se o resultado obtido é o esperado.
- **Release**: versão preparada/liberada para consumo interno ou externo.
- **SUT**: System Under Test, unidade/sistema em teste.
- **V&V**: Verificação e Validação.
- **WIP**: trabalho em progresso; Lean/Kanban busca limitar sobrecarga e otimizar fluxo.

## Mapa conceitual textual

`Necessidades do cliente → requisitos/backlog → processo adaptado ao contexto → desenvolvimento em mudanças pequenas → controle de versão → build automatizado → testes automatizados → integração contínua → incremento/release → deploy/operação → feedback → repriorização/evolução`

`Qualidade` atravessa todo o fluxo:
- **QA** atua preventivamente sobre o processo.
- **QC** detecta/corrige defeitos no produto.
- **Testes** automatizam parte do QC.
- **CI** reduz o intervalo até descobrir problemas de integração.
- **DevOps** estende colaboração, automação, medição e compartilhamento até operações.
- **Lean** procura remover desperdício e otimizar o fluxo fim-a-fim.
