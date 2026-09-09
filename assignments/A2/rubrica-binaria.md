# A2 — Rubrica binária de sucesso

## Escopo e distinção

- O arquivo [Atividade 2 - Eng SFT.pdf](./Atividade%202%20-%20Eng%20SFT.pdf) é o enunciado fornecido na atividade.
- Este Markdown é uma checklist operacional derivada do enunciado para verificar evidências no repositório.
- A checklist não substitui a entrega pelo Classroom nem altera a avaliação oficial em quatro níveis (`Ótimo`, `Bom`, `Insuficiente` e `Ausente/Inadequado`).

## Regra binária

- Marque a caixa `PASS` de cada item quando houver evidência objetiva no repositório, no histórico, no Pull Request, no pipeline ou nas configurações do GitHub.
- Se a caixa `PASS` permanecer desmarcada, considere o item como `FAIL`.
- Um critério C1–C6 é considerado `PASS` somente quando todos os seus itens obrigatórios estiverem como `PASS`.
- A verificação final deve considerar o estado identificado pela tag `a2-v1.0.0`; alterações posteriores não entram na avaliação da baseline.

## Pesos oficiais

| Critério | Tema | Peso |
|---|---|---:|
| C1 | Configuração e proteção do repositório | 20% |
| C2 | Fluxo de desenvolvimento e revisão | 30% |
| C3 | Testes automatizados e cobertura | 20% |
| C4 | Qualidade estática | 10% |
| C5 | Integração contínua | 10% |
| C6 | Release e baseline | 10% |

## C1 — Configuração e proteção do repositório

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| C1.1 | O professor `cafeo-unicamp` foi adicionado como colaborador. | Configuração de acesso do repositório. | - [ ] PASS |
| C1.2 | O PED `Andre-Satorres` foi adicionado como colaborador. | Configuração de acesso do repositório. | - [ ] PASS |
| C1.3 | A branch `main` está protegida por Ruleset ou mecanismo equivalente. | Configuração visível da proteção. | - [ ] PASS |
| C1.4 | A branch `develop` está protegida por Ruleset ou mecanismo equivalente. | Configuração visível da proteção. | - [ ] PASS |
| C1.5 | A integração em branches protegidas exige Pull Request. | Regra ativa e aplicada a `main` e `develop`. | - [ ] PASS |
| C1.6 | O Pull Request exige ao menos uma aprovação de outro integrante da equipe. | Regra de aprovação e revisão registrada. | - [ ] PASS |
| C1.7 | Discussões de revisão precisam estar resolvidas antes do merge. | Regra de conversas resolvidas. | - [ ] PASS |
| C1.8 | Checks obrigatórios precisam terminar com sucesso antes do merge. | Checks associados à regra de proteção. | - [ ] PASS |
| C1.9 | Usuários administradores não podem ignorar as regras. | Opção equivalente a “não permitir bypass”. | - [ ] PASS |
| C1.10 | Force push não é permitido nas branches protegidas. | Regra de restrição de force push. | - [ ] PASS |
| C1.11 | Exclusão de `main` e `develop` não é permitida. | Regra de restrição de exclusão. | - [ ] PASS |
| C1.12 | A proteção controla efetivamente a integração. | Tentativa ou evidência de PR/checks bloqueados quando uma condição obrigatória não é atendida. | - [ ] PASS |

## C2 — Fluxo de desenvolvimento e revisão

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| C2.1 | Cada integrante é responsável por uma funcionalidade pequena e útil. | Issue, branch, commits e PR identificáveis por integrante. | - [ ] PASS |
| C2.2 | Existe uma issue para cada funcionalidade. | Issues correspondentes no repositório. | - [ ] PASS |
| C2.3 | Cada issue possui o label `Atividade2`. | Label visível em todas as issues da atividade. | - [ ] PASS |
| C2.4 | Cada branch de funcionalidade foi criada a partir de `develop`. | Histórico da branch e ponto de origem. | - [ ] PASS |
| C2.5 | O nome de cada branch segue `feature/nome-da-feature`. | Lista e histórico das branches. | - [ ] PASS |
| C2.6 | A implementação foi realizada na branch de funcionalidade correspondente. | Commits da funcionalidade fora de `develop`/`main` até o PR. | - [ ] PASS |
| C2.7 | Os commits registram adequadamente a evolução da implementação. | Histórico coerente, identificável e relacionado à funcionalidade. | - [ ] PASS |
| C2.8 | Foi aberto um PR de cada `feature/*` para `develop`. | PR com branches de origem e destino corretas. | - [ ] PASS |
| C2.9 | Cada PR está relacionado à issue correspondente. | Link, fechamento automático ou referência explícita entre PR e issue. | - [ ] PASS |
| C2.10 | A revisão foi solicitada a outros integrantes. | Review request ou participação registrada no PR. | - [ ] PASS |
| C2.11 | A contribuição foi revisada antes da integração. | Review submetido antes do merge. | - [ ] PASS |
| C2.12 | Problemas encontrados em revisão ou pipeline foram corrigidos na própria branch. | Commits de correção no PR antes do merge, quando aplicável. | - [ ] PASS |
| C2.13 | O merge em `develop` ocorreu somente após aprovação e checks obrigatórios bem-sucedidos. | Linha do tempo do PR e status dos checks. | - [ ] PASS |
| C2.14 | A issue correspondente foi encerrada após a integração. | Issue fechada, preferencialmente por associação automática ao PR. | - [ ] PASS |
| C2.15 | A rastreabilidade completa é identificável. | Cadeia `issue → feature/* → commits → PR → revisão → develop`. | - [ ] PASS |

## C3 — Testes automatizados e cobertura

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| C3.1 | Cada funcionalidade possui testes automatizados relacionados ao comportamento implementado. | Testes versionados e vinculáveis a cada feature. | - [ ] PASS |
| C3.2 | Os testes verificam comportamentos relevantes e significativos. | Casos que exercitam os principais comportamentos da funcionalidade. | - [ ] PASS |
| C3.3 | Os testes podem ser executados automaticamente a partir do repositório. | Script/comando reproduzível e configuração versionada. | - [ ] PASS |
| C3.4 | Todos os testes do repositório são executados pelo pipeline. | Log do pipeline com a suíte completa. | - [ ] PASS |
| C3.5 | A falha de qualquer teste faz o pipeline falhar. | Execução com status de falha ou configuração equivalente. | - [ ] PASS |
| C3.6 | O pipeline calcula a cobertura com ferramenta adequada à tecnologia. | Comando, configuração e log/artefato da ferramenta. | - [ ] PASS |
| C3.7 | O resultado da cobertura fica disponível para consulta. | Resumo na execução do pipeline ou relatório gerado. | - [ ] PASS |

## C4 — Qualidade estática

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| C4.1 | O projeto usa ferramenta adequada de lint, análise estática ou qualidade. | Ferramenta compatível com a tecnologia adotada. | - [ ] PASS |
| C4.2 | A configuração da ferramenta está versionada. | Arquivo de configuração no repositório. | - [ ] PASS |
| C4.3 | A análise é executada automaticamente. | Etapa correspondente no pipeline. | - [ ] PASS |
| C4.4 | Existem violações de qualidade previamente definidas pela equipe. | Regras ou configuração explícita da ferramenta. | - [ ] PASS |
| C4.5 | Violações configuradas como impeditivas fazem a verificação falhar. | Execução com erro bloqueante ou configuração equivalente. | - [ ] PASS |

## C5 — Integração contínua

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| C5.1 | O pipeline é executado automaticamente em Pull Requests antes do merge. | Workflow e execuções de PR. | - [ ] PASS |
| C5.2 | O pipeline é executado automaticamente após integração em `develop`. | Workflow e execução pós-merge. | - [ ] PASS |
| C5.3 | O pipeline é executado automaticamente após integração em `main`. | Workflow e execução pós-merge. | - [ ] PASS |
| C5.4 | O build/preparação resolve ou instala dependências. | Etapa de instalação/resolução no pipeline. | - [ ] PASS |
| C5.5 | O build usa scripts ou arquivos de configuração versionados. | Arquivos necessários presentes no repositório. | - [ ] PASS |
| C5.6 | O projeto pode ser construído a partir de um clone limpo. | Execução reproduzível sem arquivos locais não versionados. | - [ ] PASS |
| C5.7 | O pipeline contém build, testes, cobertura e análise estática. | Jobs/steps correspondentes e logs. | - [ ] PASS |
| C5.8 | Os checks do pipeline estão associados às regras de proteção. | Configuração de checks obrigatórios nos branches protegidos. | - [ ] PASS |
| C5.9 | O merge é bloqueado quando os checks obrigatórios não têm sucesso. | Regra aplicada em PR. | - [ ] PASS |
| C5.10 | Uma nova execução valida o estado da branch de destino após o merge. | Execução automática pós-integração em `develop` e `main`. | - [ ] PASS |

## C6 — Release e baseline

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| C6.1 | A branch `release/*` foi criada a partir de `develop` após as funcionalidades serem integradas. | Histórico da branch e estado de `develop`. | - [ ] PASS |
| C6.2 | A branch de release contém somente ajustes de preparação da versão. | Diff sem novas funcionalidades. | - [ ] PASS |
| C6.3 | Foi aberto um PR de `release/*` para `main`. | PR com origem e destino corretos. | - [ ] PASS |
| C6.4 | O merge da release ocorreu após aprovação e checks obrigatórios bem-sucedidos. | Linha do tempo do PR e status dos checks. | - [ ] PASS |
| C6.5 | A tag exata `a2-v1.0.0` existe no commit da versão integrada em `main`. | Tag apontando para o commit correto. | - [ ] PASS |
| C6.6 | `develop` foi atualizada com as alterações presentes em `main` após a release. | Histórico/diff entre branches após a release. | - [ ] PASS |
| C6.7 | A tag identifica uma baseline reproduzível da entrega. | Clone/checkout da tag reproduz o estado avaliado. | - [ ] PASS |

> **Bloqueio explícito do enunciado:** a ausência da tag `a2-v1.0.0` implica nota zero na atividade.

## Participação individual

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| P.1 | Cada integrante desenvolveu uma das funcionalidades selecionadas. | Issue, branch e PR atribuíveis ao integrante. | - [ ] PASS |
| P.2 | Cada integrante possui commits relacionados à sua funcionalidade. | Autoria no histórico da branch/PR. | - [ ] PASS |
| P.3 | Cada integrante desenvolveu ou contribuiu para os testes correspondentes. | Commits ou alterações de teste identificáveis. | - [ ] PASS |
| P.4 | Cada integrante participou do PR associado à sua funcionalidade. | Autor, reviewer, comentário ou outra participação rastreável. | - [ ] PASS |
| P.5 | Cada integrante revisou pelo menos um PR de outro integrante. | Review submetido em PR de outra pessoa. | - [ ] PASS |
| P.6 | Não há integrante sem participação efetiva no desenvolvimento. | Evidências mínimas acima atendidas por todo o grupo. | - [ ] PASS |

## Entrega

| ID | Verificação binária | Evidência esperada | PASS |
|---|---|---|---|
| E.1 | A entrega foi submetida por apenas um integrante no formulário do Classroom. | Registro da submissão. | - [ ] PASS |
| E.2 | As evidências necessárias estão diretamente no histórico e nas configurações do repositório. | Issues, PRs, reviews, workflows, checks, branches, tag e regras acessíveis. | - [ ] PASS |

## Resumo de apuração

| Critério | Itens PASS | Itens FAIL | PASS |
|---|---:|---:|---|
| C1 |  |  | - [ ] PASS |
| C2 |  |  | - [ ] PASS |
| C3 |  |  | - [ ] PASS |
| C4 |  |  | - [ ] PASS |
| C5 |  |  | - [ ] PASS |
| C6 |  |  | - [ ] PASS |

### Observações

- A lista de ferramentas do PDF é sugestiva; uma ferramenta equivalente adequada à tecnologia do projeto também atende ao requisito.
- A nota individual pode reduzir a nota da equipe conforme a participação observada, mesmo que os critérios coletivos estejam completos.
- O PDF informa que não é necessário produzir um relatório narrativo; esta rubrica serve apenas para organizar a conferência das evidências.
