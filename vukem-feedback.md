# Feedback para evolução do Vukem

Registro de 2026-11-06, baseado no desenvolvimento do Vukem Music: Go, Inertia,
React, Bun, SQLite, autenticação opcional, aplicação bilíngue e deploy Railway.

A versão efetivamente usada é
`github.com/AlexGalhardo/vukem v0.0.0-20261104204150-45a36f80e729`, registrada no
[go.mod](go.mod). A inspeção do framework refere-se a
[esse commit](https://github.com/AlexGalhardo/vukem/tree/45a36f80e729), não a uma
auditoria da versão mais recente. O histórico da aplicação está em
[docs/verification.md](docs/verification.md).

Este arquivo registra feedback; não afirma que as propostas já foram implementadas
no Vukem. Não foram abertos issues nem enviados patches ao repositório do framework.

## Como interpretar os relatos

- **Observado:** aconteceu nesta aplicação, com evidência em código ou no registro
  de execução. Não implica automaticamente um defeito do framework.
- **Inspeção:** comportamento encontrado no código da versão fixada; quando não
  houve reprodução isolada, isso está indicado.
- **Proposta:** melhoria de API, documentação, scaffold ou ferramentas motivada
  pelo trabalho. Nomes de novos comandos/flags abaixo são sugestões.
- **P1:** priorizar para reduzir falhas de preparação/operação ou melhorar uma
  garantia concreta. **P2:** reduzir trabalho recorrente e erros de integração.
  **P3:** conveniência ou evolução que pode ficar em preset/plugin.

## O que funcionou e deve ser preservado

1. **Bootstrap explícito.** As opções em [bootstrap/app.go](bootstrap/app.go)
   tornam rotas, providers, migrações, traduções e Inertia rastreáveis, sem depender
   de descoberta implícita para entender a aplicação.
2. **Go estático com SQLite.** O driver pure Go permitiu `CGO_ENABLED=0` e uma imagem
   de runtime pequena. Migrações, dados e backup foram verificados também em
   produção; o framework não precisou de um servidor Node para servir React.
3. **Inertia e traduções integrados.** A aplicação recebeu props e catálogos por
   mecanismos do framework e manteve uma única camada de rotas Go.
4. **Primitivas de segurança reutilizáveis.** SessionGuard, hash Argon2id,
   middleware de origem/CSRF e rate limiting foram aproveitados, em vez de
   reimplementar criptografia ou sessões.
5. **Testes HTTP utilizáveis.** `vukemtest.New(t, bootstrap.New)`, clientes,
   assertions e verificações de banco permitiram testar isolamento entre contas,
   respostas, idiomas e persistência com pouco preparo.
6. **Standards e Docker como ponto de partida.** Lockfile, CI, secret scanning,
   arquivos comunitários e imagem multi-stage economizaram configuração inicial.
   As propostas abaixo devem evoluir esse ponto de partida sem exigir serviços
   opcionais de toda aplicação.

## Priorização sugerida

| ID | Prioridade | Área | Natureza principal |
| --- | --- | --- | --- |
| V01 | P1 | Preparação da chave e equivalência entre CLIs | Observado / DX |
| V02 | P1 | Escrita segura de `.env` existente | Inspeção / hardening |
| V03 | P2 | Diagnóstico do projeto pelo doctor | Inspeção / proposta |
| V04 | P1 | Teste de clone limpo e jornada do starter | Observado / proposta |
| V05 | P1 | Receita Railway com SQLite persistente | Observado / documentação |
| V06 | P2 | Propriedade do volume e execução sem root | Observado / operação |
| V07 | P2 | Docker portátil e otimizações opcionais | Observado na aplicação |
| V08 | P2 | Assets gerados fora do diretório Vite | Observado / documentação |
| V09 | P3 | Imagem do estágio de assets customizável | Necessidade da aplicação |
| V10 | P2 | Backup e restauração de SQLite | Implementação local / proposta |
| V11 | P2 | Portabilidade de testes entre Windows e Linux | Observado na aplicação |
| V12 | P2 | Contratos tipados Go → Inertia → TypeScript | Trabalho manual / proposta |
| V13 | P2 | i18n com navegação e estado preservados | Observado / receita |
| V14 | P2 | Autenticação opcional e identificador customizado | Caso de uso / receita |
| V15 | P2 | Descoberta de BindJSON e limites de corpo | Recurso existente / documentação |
| V16 | P2 | Props sob demanda e orçamento de payload | Recurso existente / receita |
| V17 | P3 | Preset React + shadcn/ui + sidebar | Integração manual / proposta |
| V18 | P2 | Atualização dos standards e dependências | Observado no tooling externo |
| V19 | P2 | Tratamento estreito de falsos positivos de secrets | Observado no tooling externo |
| V20 | P2 | Compatibilidade CLI/runtime e documentação versionada | Experiência de atualização |
| V21 | P2 | Lint respeitando arquivos privados e gerados | Observado no projeto |

## V01 — Tornar inequívoca a preparação da chave

**Constatação.** O comando da CLI global `vukem key:generate` escreve `.env`,
enquanto `go run ./cmd/app key:generate` imprime a chave. Confundir esses comandos
contribuiu para a falha de cold start do primeiro CI com navegador. Foi necessário
adicionar [scripts/setup-env.ts](scripts/setup-env.ts) e uma chave efêmera no
[Playwright](playwright.config.ts).

A diferença é intencional e aparece na documentação Docker do Vukem; não é uma
falha do algoritmo de geração. A CLI global já protege contra sobrescrita sem
`--force` e oferece `--show`.

**Melhoria.** Apresentar uma tabela explícita “CLI global × binário da aplicação”
na instalação, nos starters e no CI. Oferecer uma preparação idempotente de projeto
que funcione também sem instalação global, preserve uma chave existente e não
imprima segredos. Um eventual `setup`/`--if-missing` deve ser claramente diferente
de rotação.

**Aceite.** Um clone sem `.env` inicia com o procedimento documentado; repetir o
procedimento preserva a chave e variáveis existentes. CI não captura uma chave
real nos logs e não depende de uma `.env` prévia do desenvolvedor.

## V02 — Unificar escrita atômica e permissões do `.env`

**Inspeção.** Na revisão fixada, `internal/cli/key.go` usa
`os.WriteFile(path, data, 0o600)` em `writeAppKey`. Em um arquivo existente, esse
argumento de modo não altera suas permissões POSIX. O módulo também contém uma
rotina de escrita atômica em `internal/cli/key_rotate.go`. O setup local acrescentou
`chmod(0600)` e arquivo temporário.

Isso é uma constatação de código, não relato de exploração nem reprodução de
perda de chave nesta aplicação.

**Melhoria.** Reutilizar uma única rotina de escrita segura para geração e rotação:
escrita temporária no mesmo diretório, substituição atômica e tratamento explícito
de permissões, links e falhas. Definir separadamente o comportamento no Windows.

**Aceite.** Testes cobrem `.env` novo, existente com modo `0644`, chave preservada,
falha durante escrita e rotação. Em POSIX, o modo final esperado é `0600`; em
Windows, documentar/verificar a garantia aplicável de ACL, sem fingir equivalência.

## V03 — Evoluir o doctor existente para diagnóstico de projeto

**Inspeção.** O Vukem já possui `doctor`. Em `internal/cli/doctor.go` da versão usada,
a lista de ferramentas opcionais contém Betterleaks. Não proponho criar do zero
um comando que já existe.

**Melhoria.** Acrescentar um modo de diagnóstico do projeto: versões CLI/runtime,
Go/Bun e lockfile; presença válida de chave sem revelar valor; diretório de banco
gravável; configuração de porta/proxy; manifesto Vite e assets de produção. Permitir
checks opcionais registrados pela aplicação, sem embutir LilyPond ou FFmpeg no core.

**Aceite.** Saída humana e, opcionalmente, JSON informam estado e correção sugerida.
Separar modo informativo de modo estrito para CI; ausência de ferramenta opcional
não deve bloquear uma aplicação que não a utiliza. Nunca despejar ambiente/segredos.

## V04 — Testar o starter a partir de um clone realmente limpo

**Observado.** A aplicação funcionava no ambiente preparado, mas seu primeiro CI
de navegador falhou na preparação da chave. Depois do setup idempotente e da chave
efêmera de teste, a jornada passou em porta isolada.

**Melhoria.** Manter uma jornada de referência que gere/clone o starter, instale
com lockfile congelado, prepare configuração, migre, compile e abra uma página
Inertia. Não depender de `.env`, banco, CLI global ou assets de uma execução anterior.
Um preset Playwright opcional pode entregar essa jornada ao usuário.

**Aceite.** CI reproduz um clone sem artefatos locais, usa banco/porta/chave de teste
isolados e testa navegação inicial e requisição Inertia. O preset não deve transformar
cada teste Go em um teste de navegador.

## V05 — Dar destaque à receita Railway + SQLite

**Observado.** O deploy exigiu volume em `/app/storage`, caminho absoluto do banco,
uma réplica e migração no startup, com o volume já montado. A aplicação usa
[scripts/start.sh](scripts/start.sh) para migrar e depois executar o processo.
O procedimento está em [docs/deployment.md](docs/deployment.md).

A documentação do framework já aborda Docker, SQLite e Railway. A oportunidade é
uma trilha direta para esse conjunto, evitando que instruções de PostgreSQL e
pre-deploy sejam transplantadas para um banco em volume.

**Melhoria.** Oferecer exemplo completo e pequeno com SQLite, volume, startup,
healthcheck com banco, porta real da plataforma, réplica única, backup e redeploy.
Deixar explícito quando não usar pre-deploy para migração de um volume local.

**Aceite.** Seguir a receita instala o esquema uma vez, preserva registros após
redeploy e permite verificar `/up?checks=1`. Não alegar alta disponibilidade ou
escrita multi-instância apenas por usar um volume.

## V06 — Documentar o desvio entre usuário da imagem e dono do volume

**Observado.** A imagem define um usuário sem root, mas o deploy Railway adotou
`RAILWAY_RUN_UID=0` como workaround do volume. Essa configuração da plataforma está
em [.railway/railway.ts](.railway/railway.ts); não é evidência de falha de autorização
no Vukem.

**Melhoria.** Documentar como diagnosticar dono/permissões de volume e qual caminho
é preferível para manter execução sem root. Explicar o alcance e o custo operacional
do workaround, sem torná-lo uma recomendação universal.

**Aceite.** O exemplo informa o UID efetivo e testa escrita/migração/backup no volume.
A configuração segura recomendada é verificável; a imagem não parece “non-root”
apenas porque contém uma instrução `USER` que o deploy substitui.

## V07 — Preservar Docker portátil; tornar otimizações opcionais

**Observado na aplicação.** Otimizações locais com mounts BuildKit de cache/CA
foram rejeitadas pelo builder Railway usado. Foram removidas, e o Dockerfile
portátil foi implantado. O template Docker inspecionado do Vukem já usa passos
básicos sem esses mounts: a regressão foi introduzida na aplicação, não demonstrada
no template do framework.

**Melhoria.** Preservar esse baseline simples e documentar otimizações como perfis
opcionais com compatibilidade declarada. Testar a receita Railway no builder real,
em vez de inferir compatibilidade apenas de um `docker build` local.

**Aceite.** O starter padrão compila no caminho documentado. Cache, secrets mounts
e confiança em CA corporativa ficam em instruções específicas; não desativar TLS
para contornar um problema de certificado.

## V08 — Explicar assets que não são produzidos pelo Vite

**Observado.** As partituras geradas em `resources/public/generated-scores` precisaram
de um `COPY --from=assets` adicional. Copiar somente `resources/public/build`
não transporta automaticamente todo resultado de ferramentas do estágio de assets.

**Melhoria.** Documentar o contrato entre gerar arquivos, copiá-los ao estágio Go
e embuti-los. Dar exemplos de fontes, SVGs e outros assets gerados; explicar
`all:public`, diretórios ocultos do manifesto Vite e a fronteira entre `public`
e dados privados. Não assumir que todo output deve ser publicado.

**Aceite.** Um fixture com asset customizado responde em produção sem depender
de arquivos do host. Cache, `.env`, banco e outputs privados continuam fora do
contexto/publicação. Não é necessário adicionar um motor de partituras ao framework.

## V09 — Facilitar personalização da imagem que compila o frontend

**Observado.** O estágio Bun precisou de Debian slim para executar o binário glibc
do LilyPond; o runtime Go permaneceu Alpine. Isso decorre da ferramenta nativa
escolhida pela aplicação, não de uma incapacidade do Vukem de servir React.

**Melhoria.** Explicar como trocar apenas a imagem/etapa de assets e adicionar
pré-builds. Um preset/flag opcional de imagem pode ajudar, sem exigir glibc nem
ferramentas musicais de projetos comuns.

**Aceite.** A extensão não quebra lockfile, cópia dos assets ou binário Go estático;
o runtime final não carrega Bun, LilyPond e FFmpeg sem necessidade.

## V10 — Transformar backup SQLite em receita reutilizável

**Observado.** A aplicação criou [app/commands/backup.go](app/commands/backup.go),
um comando `db:backup` com `VACUUM INTO`, recusa de sobrescrita e arquivo privado.
Testes verificam integridade e dados; o backup foi também verificado após redeploy
real. Copiar apenas o arquivo principal de um SQLite em uso não é a receita adotada.

**Melhoria.** Publicar cookbook ou comando opcional para snapshot consistente,
restauração em caminho separado, retenção fora do volume e tratamento de WAL.
Na revisão Go inspecionada não encontrei `db:backup`/`VACUUM INTO`; isso não é uma
afirmação sobre versões futuras ou outras extensões.

**Aceite.** Snapshot inclui dados confirmados, recusa destino existente/link,
passa em `integrity_check` e restaura em diretório separado. Diferenciar esse teste
de um exercício completo de troca de tráfego para um volume restaurado.

## V11 — Separar contratos POSIX de testes portáteis

**Observado na aplicação.** O teste de backup exige modo `0600` e falhou no Windows,
embora o caminho Linux tenha passado. A assertion está em
[tests/backup_test.go](tests/backup_test.go); é um problema do nosso teste, não prova
de defeito em `vukemtest`.

**Melhoria.** Documentar padrões portáteis nos exemplos e considerar uma matriz
Windows/Linux para o smoke test do starter. Tratar permissões/ACL, shell, paths e
binários externos por plataforma. Um build Linux de produção não significa que
todas as ferramentas opcionais funcionarão nativamente no Windows.

**Aceite.** A garantia POSIX continua testada em POSIX; Windows tem uma expectativa
própria e explícita. Não “corrigir” o teste afrouxando a proteção do backup em Linux.

## V12 — Reduzir duplicação dos contratos Inertia/TypeScript

**Observado.** Props e respostas têm tipos Go e TypeScript mantidos manualmente,
como [resources/js/types.ts](resources/js/types.ts) e os contratos de progresso.
TypeScript não prova que o JSON emitido pelo Go corresponde à interface declarada.

**Melhoria.** Oferecer uma trilha de DTO/schema compartilhável ou geração opcional
de tipos a partir de contratos explícitos, com verificação de drift no CI.
Um nome como `types:generate` seria proposta, não comando disponível confirmado.

**Aceite.** Cobrir nullable, ponteiros, campos omitidos, arrays, enums e erros.
Não prometer inferir automaticamente todo modelo Go, tipo musical ou validação
de domínio; preservar a opção de contratos simples escritos à mão.

## V13 — Ensinar troca de idioma com estado Inertia preservado

**Observado.** Uma troca com recarregamento completo perdeu acorde/inversão e filtros.
O uso de `router.visit` com `preserveState`/`preserveScroll` resolveu a navegação.
Não foi necessário corrigir o resolvedor de idioma do framework.

**Melhoria.** Incluir esse caso nos exemplos React/i18n: locale, query string,
filtros, histórico, fallback e persistência de estado. Acrescentar receita de
paridade de catálogos e, opcionalmente, chaves de tradução tipadas; o helper local
atual aceita qualquer string e devolve a própria chave quando ela falta.

**Aceite.** Mudar EN↔pt-BR preserva a seleção declarada pela aplicação, traduz props
e controles e não perde parâmetros de URL. A documentação explica também quando
se deseja resetar o estado, em vez de preservar tudo indiscriminadamente.

## V14 — Mostrar autenticação mínima, opcional e com identificador customizado

**Observado.** `auth.SessionGuard` e `IdentifierField = "handle"` atenderam contas
sem email, adicionadas depois da experiência anônima. Um provider pequeno liga
isso ao SQLite em [app/accounts/accounts.go](app/accounts/accounts.go).

**Melhoria.** Publicar uma receita de identidade customizada e adoção incremental:
visitante continua usando o produto, conta é opcional e as políticas de progresso,
exclusão, recuperação e conflito são declaradas pela aplicação. Se houver um
preset mínimo, ele não deve instalar social login, email e recuperação por padrão.

**Aceite.** O exemplo reutiliza guard/hash/CSRF/rate limiter do framework e testa
isolamento entre usuários. Não confundir autenticar com decidir como mesclar dados
offline; essa semântica pertence ao domínio.

## V15 — Melhorar a descoberta do JSON estrito que já existe

**Observado/inspeção.** A aplicação escreveu um decoder de 64KiB com rejeição de
campos desconhecidos e conteúdo após o JSON. A revisão do framework mostrou que
`Ctx.BindJSON` já rejeita campos desconhecidos e trailing data; há `BodyLimit`
para ajustar o limite. O default de corpo é 10MiB na versão inspecionada.

**Melhoria.** Dar destaque a uma receita `BindJSON` + limite por rota + validação
de domínio, com exemplos de 413/415/422 e contrato de erro consumível pelo React.
A ação inicial pode ser refatorar nossa aplicação para esses recursos existentes,
não acrescentar outro decoder ao Vukem.

**Aceite.** O exemplo cobre corpo grande, tipo incorreto, campos extras e JSON
concatenado; regras de negócio continuam separadas do parsing. Documentar a
normalização de erro evita duplicar tratamento no frontend.

## V16 — Expor melhor Optional/Defer e partial reloads

**Observado/inspeção.** A aplicação compartilha dados de lições em várias páginas.
O framework já tem `inertia.Optional`, `inertia.Defer` e seleção de props em partial
reloads. Não houve benchmark que demonstre gargalo do Vukem neste projeto.

**Melhoria.** Adicionar exemplos de dashboards com orçamento de payload, consulta
lazy e lista/resumo separado do conteúdo detalhado. Mostrar inspeção do JSON e
contagem de queries para decidir se a otimização é necessária.

**Aceite.** Um exemplo demonstra que uma prop omitida não executa consulta cara,
sem quebrar tradução, autorização ou props compartilhadas. Evitar otimização
prematura e não exigir deferred props para uma página pequena.

## V17 — Oferecer dashboard shadcn/ui como preset opcional

**Observado.** O dashboard, sidebar, tema, foco, navegação mobile e integração com
i18n foram trabalho da aplicação sobre o starter React/Inertia.

**Melhoria.** Disponibilizar um preset pequeno com shadcn/ui, sidebar acessível,
layout responsivo, tema persistido e locale switch integrado. Manter um starter
mínimo para quem não quer essa interface.

**Aceite.** Sem CRUD de demonstração obrigatório em um projeto novo; teclado,
mobile, tradução e atribuição da licença dos componentes são verificados.
Não tratar uma biblioteca visual externa como funcionalidade do runtime Go.

## V18 — Manter standards com dependências atualizadas e explicáveis

**Observado.** A auditoria encontrou advisories em dependências transitivas das
ferramentas Markdown. Atualizamos o CLI e registramos overrides de KaTeX/re2js.
Não eram vulnerabilidades demonstradas no runtime Go do Vukem.

**Melhoria.** Manter smoke/audit dos standards gerados, uma política de atualização
e exemplos de override temporário com justificativa e critério de remoção.
Documentar o que cada camada verifica: tipos, lint, testes Go/JS, navegador,
vulnerabilidades e segredos.

**Aceite.** Um starter recém-gerado instala com lockfile e seus checks passam.
Ajustes locais não desligam auditoria nem são confundidos com correção upstream;
versões de ferramentas têm um caminho documentado de atualização.

## V19 — Documentar falsos positivos sem abrir exceções amplas

**Observado.** Betterleaks sinalizou labels de senha EN/PT e fixtures de teste.
A aplicação usou valores explicitamente de exemplo e uma allowlist limitada às
linhas exatas dos labels e aos caminhos dos catálogos. A regra foi mantida para
qualquer valor alterado; ver [.betterleaks.toml](.betterleaks.toml).

**Melhoria.** Incluir esse procedimento na documentação dos standards: examinar
regra/arquivo/linha sem imprimir segredo, confirmar o falso positivo e restringir
a exceção. Deixar claro que o hook pode avisar se o binário não está instalado,
enquanto o CI deve executar a varredura de verdade.

**Aceite.** O fixture/label passa e uma valor sintético com formato de credencial
em outro campo continua sendo detectada. Não ignorar globalmente `tests/`, docs,
catálogos ou todo `password` para fazer o check passar.

## V20 — Explicitar compatibilidade entre CLI, runtime e documentação

**Observado.** O projeto fixa uma pseudo-versão Go, versões JS, lockfile e imagens
Docker. A CLI e o binário da aplicação têm responsabilidades distintas, e as
versões de Bun do template do framework e da aplicação podem divergir após upgrades.
Isso não comprova incompatibilidade; torna importante saber o conjunto testado.

**Melhoria.** Mostrar a versão/revisão da CLI e do runtime lado a lado no diagnóstico,
apontar documentação correspondente e publicar um caminho de upgrade de starter
customizado. Separar código possuído pela aplicação de atualizações do scaffold;
não sobrescrever personalizações silenciosamente.

**Aceite.** O mantenedor identifica a revisão usada, as mudanças propostas e os
checks necessários. Exemplos e imagens suportados são testados com a versão
declarada; não se atribui a uma revisão antiga uma promessa de suporte futuro.

## V21 — Lintar o escopo certo do repositório

**Observado.** `bun lint:md` também encontrou um README privado gerado em `storage/`,
mesmo esse diretório estando no `.gitignore`. A configuração local usa
`**/*.md`, excluindo `node_modules` e `testdata`, mas não esse output privado.

**Melhoria.** Oferecer uma configuração/padrão que diferencie código/documentação
versionados de storage, caches, outputs e artefatos locais. Pode ser uma lista de
exclusões explícitas ou um modo baseado em arquivos versionados, com orientação
para incluir novos arquivos ainda não commitados durante desenvolvimento.

**Aceite.** CI e desenvolvimento têm um escopo previsível; um output privado não
altera o resultado dos checks do código publicado. Isso não deve excluir por
acidente um documento novo que o usuário realmente pretende versionar.

## O que não deve ser atribuído ao Vukem

- A falta inicial de Go/Bun corretos no PATH e o disco limitado do executor eram
  condições do ambiente, não falhas demonstradas do runtime do framework.
- A interpretação de XML pelo renderer de partituras, a precisão dos prompts
  ElevenLabs e as restrições de distribuição de samples pertencem às integrações
  externas e às escolhas da aplicação.
- O backup e sua assertion POSIX são código local. A correção deve acontecer nele
  antes de apresentar isso como regressão do framework.
- DNS em cache, domínio/TXT cadastrado separadamente e disponibilidade de volume
  no pre-deploy são comportamentos da infraestrutura que pedem receitas claras.
- O conflito entre alterações simultâneas na `main` é um assunto de fluxo Git;
  integrar mudanças sem sobrescrevê-las foi responsabilidade desta aplicação.
- Leitura de partituras, DSP, teoria musical, regras de progresso e revisão do
  conteúdo não devem entrar no core HTTP do Vukem apenas por existirem aqui.

Não foram avaliados com profundidade WebSockets, filas distribuídas, múltiplas
réplicas com escrita concorrente, outras bases SQL ou recuperação de desastre
com troca real de tráfego. Este relato não certifica nem critica esses cenários.

## Próximas ações que eu priorizaria

1. Fechar o contrato de setup/chave entre CLI global, binário e clone de CI.
2. Revisar a escrita/permissões de `.env` com testes de geração e rotação.
3. Consolidar uma receita reproduzível Railway + SQLite, incluindo volume e backup.
4. Expandir o doctor e o smoke test do starter para verificar esse caminho.
5. Melhorar exemplos tipados de Inertia, i18n e JSON estrito, reaproveitando primeiro
   os recursos que o framework já oferece.
6. Entregar conveniências visuais e geradores adicionais como presets opcionais,
   mantendo o core e o starter mínimo pequenos.

Cada proposta deve virar um issue/PR próprio com versão afetada, reprodução,
resultado esperado e teste de aceite. Este documento é o insumo para esse trabalho,
não uma alegação de que todas essas mudanças são obrigatórias para usar o Vukem.

## Referências do framework inspecionadas

As referências abaixo apontam para a revisão usada, preservando o contexto do relato:

- [Geração de chave na CLI](https://github.com/AlexGalhardo/vukem/blob/45a36f80e729/internal/cli/key.go).
- [Rotação e escrita atômica](https://github.com/AlexGalhardo/vukem/blob/45a36f80e729/internal/cli/key_rotate.go).
- [Doctor existente](https://github.com/AlexGalhardo/vukem/blob/45a36f80e729/internal/cli/doctor.go).
- [Template Docker](https://github.com/AlexGalhardo/vukem/blob/45a36f80e729/internal/cli/docker/Dockerfile.tmpl).
- [Binding JSON e limites](https://github.com/AlexGalhardo/vukem/blob/45a36f80e729/web/input.go).
- [Props Inertia](https://github.com/AlexGalhardo/vukem/blob/45a36f80e729/inertia/props.go).
- [Guia Docker/Railway na revisão usada](https://github.com/AlexGalhardo/vukem/blob/45a36f80e729/site/content/docs/deployment/docker-and-railway.mdx).
