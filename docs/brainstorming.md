# Vukem Music — brainstorming

Data de início: 2026-11-05.
Status atual: MVP implementado e publicado, com CI verificada. Amostras reais
ElevenLabs e deploy Railway/DNS aguardam credenciais. Veja `ROADMAP.md`.

Este arquivo registra o brainstorming, suas decisões e pendências. Uma sugestão
não se torna requisito aprovado até receber uma resposta explícita do mantenedor.
Atualizar este documento a cada resposta relevante, preservando o motivo das
decisões e registrando eventuais mudanças de direção.

## Objetivo

Criar do zero um projeto open source para aprender teoria musical, com explicações,
exercícios e leitura de partituras. Durante a reprodução, sincronizar o áudio com
as notas destacadas na partitura e no piano SVG no navegador.

## Requisitos fornecidos pelo mantenedor

- Repositório: <https://github.com/AlexGalhardo/vukem-music.git>.
- Configurar `origin` para esse repositório na implementação.
- Backend com o framework pessoal Vukem:
  <https://vukem.dev/docs/introduction>.
- Inertia.js, React e shadcn/ui, com dashboard e sidebar.
- SQLite como banco principal.
- ElevenLabs para gerar notas com timbre de piano clássico.
- Piano SVG no navegador, mostrando as teclas tocadas em sincronia com a partitura.
- Explicações técnicas sobre os conceitos do livro de referência.
- Ler integralmente o PDF e produzir resumos de todas as suas seções em `docs/*.md`
  como referência para estudos e implementação.
- Internacionalização em inglês, idioma padrão, e português.
- Biome v2 para lint e formatação; `bun check` para verificar tipos.
- Markdownlint e boas práticas open source, incluindo `SECURITY.md`,
  `CODE_OF_CONDUCT.md`, `LICENSE.md` e `CONTRIBUTING.md`.
- Deploy na Railway, com domínio `music.vukem.dev`.
- Usar `grill-me` para perguntas, dúvidas e sugestões de implementação.
- Documentar todo o brainstorming neste arquivo.
- Ao final do brainstorming, criar `ROADMAP.md` na raiz do projeto como principal
  guia de execução para sessões futuras e agentes.

## Rodada 1 — decisões confirmadas

### Q1 — escopo da primeira entrega

Proposta: MVP para iniciantes com lições progressivas, exercícios de leitura e uma
partitura de exemplo sincronizada com piano SVG e áudio. Importação de partituras
fica para depois.

Resposta: **“Sim, começar por esse MVP”.**

Decisão: esse é o escopo inicial. A leitura e reprodução da partitura de exemplo
fazem parte do MVP; importação de arquivos não faz parte dele.

### Q2 — contas e progresso

Proposta: começar sem cadastro, salvando o progresso no navegador.

Resposta: **“Sim, sem cadastro inicialmente”.**

Decisão: não implementar autenticação na primeira entrega. Login e sincronização
de progresso entre dispositivos ficam para uma fase posterior a definir.
O requisito de SQLite permanece; o progresso local não o substitui como banco
principal da aplicação.

### Q3 — licença e material educacional

Proposta: MIT para código e conteúdo autoral; explicações e exercícios próprios,
com referências ao livro e sem incluir o PDF no repositório público.

Resposta: **“Sim, MIT e material autoral”.**

Decisão: usar MIT e produzir material original. Não copiar páginas ou exercícios
do livro para o projeto.

## Rodada 2 — decisões confirmadas

### Q4 — produção e reprodução do áudio

Proposta: gerar amostras com ElevenLabs uma vez no backend, conferir e, quando
necessário, corrigir a afinação. Reproduzir os arquivos no navegador com
sincronização baseada no relógio do áudio. Usar um sintetizador provisório,
claramente identificado, enquanto faltarem amostras.

Motivo: evitar latência de geração e cobrança por reprodução; garantir que os
exercícios usem notas afinadas.

Status: **aprovado explicitamente** pela resposta “Brainstorming = sim para as três perguntas”.
Amostras ElevenLabs validadas e sintetizador provisório identificado estão aprovados.

### Q5 — progressão didática e extensão do piano

Proposta: organizar o curso do básico ao avançado, entregando primeiro fundamentos,
notas, pauta, claves de sol e fá, figuras, pausas e compassos. Piano SVG de 88 teclas,
com região do exercício destacada e navegação horizontal no celular.

Status: **aprovado explicitamente** pela mesma resposta. Progressão proposta e
piano SVG de 88 teclas, com destaque e navegação horizontal no celular, estão aprovados.

### Q6 — visual e formas de interação

Proposta: visual sóbrio de conservatório, temas claro e escuro, exercícios por
clique/toque no piano e teclado do computador. MIDI e reconhecimento de som por
microfone ficam para depois.

Status: **aprovado explicitamente** pela mesma resposta. Visual de conservatório,
temas claro/escuro e interação por toque, mouse e teclado estão aprovados.
MIDI e reconhecimento por microfone continuam para uma etapa posterior.

## Pesquisa técnica

Fatos inspecionados em 2026-11-05; revalidar versões e ferramentas na implementação.

### Vukem e frontend

- Vukem usa Go no backend; Bun será o gerenciador de pacotes do frontend.
- O framework oferece starter React com Inertia e suporte integrado a SQLite.
- shadcn/ui precisa ser instalado e configurado no starter.
- O starter possui verificação TypeScript; expor essa verificação como `bun check`.
- `bun check` não verifica o backend Go, que precisa de verificações próprias.
- Candidato de scaffold, ainda não executado:

  ```sh
  vukem new vukem-music \
    --module github.com/AlexGalhardo/vukem-music \
    --inertia react --pm bun --standards --license mit --ci
  ```

- O gerador usa `LICENSE`; adaptar para o `LICENSE.md` solicitado.
- A inspeção do ambiente não encontrou Bun no PATH; o comando `go` disponível não
  respondeu como compilador Go. Preparar e validar as ferramentas antes do scaffold.

Fontes: [instalação](https://vukem.dev/docs/installation),
[starters](https://vukem.dev/docs/starters),
[banco de dados](https://vukem.dev/docs/database/overview),
[Inertia e i18n](https://vukem.dev/docs/frontend/inertia-i18n).

### Railway e SQLite

- O template Railway assume PostgreSQL e worker; adaptar explicitamente para SQLite.
- Persistir o banco em volume montado em `/app/storage`.
- Executar migrations na inicialização do serviço com o volume disponível.
- Não depender de migrations em pre-deploy para esse banco no volume.
- Configurar `APP_URL=https://music.vukem.dev`, porta fornecida pela plataforma,
  variáveis secretas e healthcheck.
- Deploy e DNS ainda não foram configurados nem testados.

Fonte: [Docker e Railway](https://vukem.dev/docs/deployment/docker-and-railway).

### ElevenLabs

- A API Sound Effects recebe descrição textual e parâmetros de geração.
- O contrato inspecionado não expõe um campo numérico de frequência-alvo da nota.
- Inferência técnica: não assumir afinação correta apenas pelo texto do prompt;
  validar as amostras antes do uso didático.
- Nenhuma amostra foi gerada. Credenciais, orçamento, quantidade de amostras e
  critérios de aceitação ainda precisam ser definidos.

Fonte: [Create sound effect](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert).

## Livro e progresso da leitura

- Fonte fornecida:
  <https://drive.google.com/file/d/1YVIp9m8UC4dpr878bRoFppoy5lEBG_Pw/view?usp=drivesdk>.
- Identificação conferida: Bohumil Med, _Teoria da Música_, 5ª edição, MusiMed,
  Brasília, 2017; ISBN 978-85-7092-058-4.
- Download concluído em diretório temporário, fora do repositório.
- Arquivo com 424 páginas digitalizadas, sem camada de texto utilizável.
- Sumário localizado nas páginas 7–8 do PDF: 58 capítulos, além de materiais finais.
- Áreas identificadas: som e notação; claves e valores; alterações; intervalos e
  enarmonia; escalas e série harmônica; compassos e métrica; tonalidade e modulação;
  modos e transposição; andamento, quiálteras e expressão; acordes, cifras e
  ornamentos; condução de vozes; instrumentos transpositores e notação moderna.
- Cobertura textual reportada pela pesquisa até este registro: páginas 1–30 do
  PDF, com lacunas do OCR em símbolos musicais. Capa e sumário foram conferidos
  visualmente. **A leitura integral não está concluída.**
- OCR integral em andamento. Extração por OCR não equivale a leitura ou verificação
  das partituras; exemplos e símbolos exigem conferência visual.
- Documentar a cobertura por capítulo e as páginas de referência durante a leitura.
- Os resumos de todas as seções ainda não foram escritos.

### Sugestões técnicas surgidas da leitura inicial

Ainda não aprovadas como implementação:

- Separar grafia enarmônica da altura sonora no modelo de notas.
- Representar durações musicais como valores racionais para preservar proporções.
- Para exercícios em temperamento igual de 12 notas, considerar referência
  Lá4 = 440 Hz e `f = 440 * 2^((midi - 69) / 12)`.
- Contextualizar outros sistemas de afinação nas explicações, sem aplicar
  simplificações históricas como fórmulas universais do motor de áudio.

## Contrato para o ROADMAP.md final

Criar na raiz do repositório, ao concluir o brainstorming. Será o principal arquivo
para orientar a execução por futuras sessões e agentes. Até lá, não apresentar
escolhas pendentes como fases ou requisitos aprovados.

O roadmap deverá conter:

- Fases ordenadas por dependências e entregas observáveis.
- Tarefas, subtarefas e microtarefas com caixas de seleção.
- Critérios verificáveis de qualidade e entrega, com asserts que indiquem como
  comprovar cada resultado, incluindo comandos ou verificações manuais apropriadas.
- Pré-requisitos, artefatos esperados e condições de conclusão por fase.
- Separação entre MVP confirmado, evolução futura e decisões ainda abertas.
- Estado real do trabalho: não marcar como concluído o que não foi verificado.
- Instruções de retomada: ler este brainstorming, identificar a primeira tarefa
  desbloqueada, executar, verificar e atualizar o status com evidências.
- Requisitos de conteúdo autoral, i18n, acessibilidade, sincronização musical,
  qualidade do áudio, persistência SQLite e operação na Railway.

## Próximos pontos da discussão — registro da rodada inicial

1. Receber respostas para Q4, Q5 e Q6.
2. Fechar os detalhes desbloqueados pelas respostas, incluindo critérios de áudio,
   persistência local, exercícios e critérios de acessibilidade.
3. Concluir a leitura conferida do livro e mapear suas seções para a documentação.
4. Consolidar entendimento compartilhado e criar o roadmap final solicitado.

## Método da entrevista

Skill solicitada: [grill-me](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md),
que encaminha para [grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md).
As perguntas avançam por rodadas conforme suas dependências são resolvidas.

A instrução original de criação do projeto continua válida; a mensagem adicional
sobre documentação não respondeu à rodada 2 nem cancelou o objetivo original.

## Continuação — execução autorizada

Em 2026-11-05, o mantenedor pediu: “Terminando a estrutura inicial, faça o push
para o GitHub comece a implementação do ROADMAP.md até o fim”.

Essa instrução autoriza execução e publicação no repositório, sem outra rodada de
confirmação. As recomendações ainda sem resposta de Q4–Q6 foram adotadas como
premissas de implementação para permitir avanço: amostras validadas com som
sintetizado provisório identificado; piano de 88 teclas; sol/fá e fundamentos;
visual sóbrio, claro/escuro, interação por toque, mouse e teclado. Naquele momento
eram premissas de implementação; posteriormente, o usuário aprovou explicitamente
as três propostas, conforme registrado na rodada 2.

### Entregas e fatos atualizados

- Estrutura inicial publicada no commit `1589912177179630fd2f0b2848729b4d2d053e2b`.
- `ROADMAP.md` criado na raiz, com fases, tarefas e critérios de aceite.
- Leitura de todo o texto OCR das 424 páginas concluída na pesquisa; partituras,
  diagramas e gabaritos continuam conferidos apenas por amostragem.
- Referências autorais dos 58 capítulos e seções finais em `docs/study-*.md`.
- Oito lições autorais EN/PT persistidas no SQLite, sem cadastro.
- Dashboard shadcn/ui com sidebar, temas e preferências de idioma.
- Partitura SVG, piano de 88 teclas e player Web Audio com destaque sincronizado.
- Exercícios originais com respostas por nome ou pelo piano e progresso local.
- Pipeline ElevenLabs no servidor/CLI, com cache, limite de chamadas e verificação
  de afinação; sem geração cobrada durante reprodução no navegador.
- Nenhuma credencial ElevenLabs/Railway/DNS foi disponibilizada neste ambiente.
  Geração real de amostras e publicação do domínio dependem desses acessos.
- Importação, contas, MIDI, microfone e notação avançada permanecem evolução futura,
  conforme o escopo do MVP. O roadmap não transforma esse adiamento em entrega feita.

### Encerramento da entrega local

A implementação e o ajuste de setup foram publicados. Os seis jobs de CI passaram
na revisão `7937a2da5f9c1c0b8f0fdbe2105e7f0aa3e6791b`. Foram validados o build
Docker, inicialização em produção, persistência após reinício e backup/restauração
com integridade SQLite. O `ROADMAP.md` distingue as entregas verificadas das duas
dependências externas: banco real de amostras ElevenLabs e deploy Railway/DNS.
As fases futuras estão detalhadas em tarefas, subtarefas, microtarefas e asserts,
sem serem apresentadas como implementadas.

## Confirmação explícita da rodada 2

Resposta do mantenedor: **“Brainstorming = sim para as três perguntas”.**

A confirmação se refere a Q4, Q5 e Q6: áudio por amostras ElevenLabs validadas com
síntese provisória identificada; progressão didática proposta e piano de 88 teclas;
visual de conservatório com temas claro/escuro e interação por toque, mouse e teclado.
Essas escolhas passam de premissas a decisões aprovadas, sem exigir mudanças no
MVP já implementado. Credenciais, orçamento de geração e acesso Railway/DNS
continuam sendo dependências operacionais; a aprovação não significa que esses
serviços foram configurados nem que as amostras reais ou o deploy foram concluídos.

## Rodada 3 — decisões restantes em discussão

Status: perguntas apresentadas; nenhuma resposta desta rodada foi recebida.
Q1–Q6 permanecem aprovadas. As recomendações abaixo não alteram o escopo nem
as condições de execução antes de o mantenedor responder.

### Q7 — trabalho enquanto os serviços externos aguardam acesso

Pergunta: podemos avançar no currículo completo e nos exercícios enquanto
ElevenLabs, Railway e DNS aguardam configuração?

Recomendação: sim; retirar a dependência de conclusão do deploy para começar a
expansão didática. Preservar o status pendente das operações externas.

### Q8 — organização do curso completo

Pergunta: podemos organizar os conceitos do livro por pré-requisitos pedagógicos,
em módulos curtos, mantendo referência aos 58 capítulos?

Recomendação: sim; agrupar fundamentos, ritmo, intervalos, escalas/modos, harmonia,
expressão/ornamentos e tópicos avançados. Evitar obrigar cada capítulo a virar uma
única lição longa. Manter explicações e exemplos autorais EN/PT.

### Q9 — liberdade de navegação

Pergunta: todas as lições podem ficar acessíveis, com uma sequência recomendada,
sem bloqueios obrigatórios por pontuação?

Recomendação: sim; permitir consulta e revisão livre, destacando pré-requisitos.

### Q10 — leitura e domínio como medidas diferentes

Pergunta: podemos separar lição lida, marcada manualmente, de domínio demonstrado
por exercícios, usando inicialmente pelo menos 80% em uma rodada de dez questões
variadas como indicador de domínio?

Recomendação: sim; guardar essas medidas separadamente e permitir novas tentativas.
O critério mede desempenho no treino, sem prometer proficiência musical geral.

### Q11 — perfil do piano e lote piloto

Pergunta: podemos começar com 13 amostras de Dó4 a Dó5, usando piano acústico de
cauda, som seco, intensidade média e sem pedal, e revisar esse piloto antes das
88 notas?

Recomendação: sim; validar afinação, ataque e timbre antes de ampliar o banco.
O piloto não substitui o requisito de completar e revisar as 88 amostras.

### Q12 — orçamento da geração

Pergunta: qual teto total em US$ ou créditos deve ser aplicado ao piloto e às
possíveis novas tentativas?

Recomendação: definir um teto numérico antes de qualquer chamada cobrada, contabilizar
novas tentativas dentro dele e parar ao atingir o limite. Não há orçamento autorizado
por esta pergunta; responder somente “sim” não define um valor.

### Q13 — publicação com o áudio provisório

Pergunta: a primeira publicação em `music.vukem.dev` pode ser uma beta pública
com o sintetizador identificado, enquanto as amostras reais são preparadas?

Recomendação: sim; publicar a experiência funcional quando o acesso ao deploy
estiver configurado, sem anunciar que o áudio ElevenLabs já foi entregue.

### Q14 — portabilidade do progresso sem cadastro

Pergunta: podemos adicionar exportação e importação de progresso em JSON para
permitir backup e transferência manual entre navegadores?

Recomendação: sim; validar versão e conteúdo na importação e manter a experiência
sem conta. Não confundir isso com sincronização automática.

### Ramos para rodadas seguintes

Após as respostas, detalhar apenas os ramos desbloqueados: prioridades dos módulos,
formatos dos exercícios, métricas de domínio e tentativas, critérios de revisão das
amostras, tratamento do teto de geração, release beta e regras de importação/mescla
do progresso. Não reabrir decisões já aprovadas nem pedir credenciais pelo chat.

## Repriorização explícita — repertório e harmonia

Em 2026-11-05, o mantenedor pediu pesquisa web e aquisição de cinquenta partituras
clássicas acessíveis para ensinar iniciantes. Também reforçou que a aplicação
precisa ensinar acordes e assuntos avançados, e pediu para continuar o desenvolvimento.
Isso autoriza iniciar a biblioteca e a introdução harmônica antes de resolver as
credenciais externas do MVP. Não equivale a aprovar automaticamente Q8–Q14.

Decisões de implementação documentadas, sem nova exigência ao mantenedor:

- Seleção progressiva de cinquenta obras, incluindo estudos clássicos e partes
  de aluno em duetos; sem alegar ranking objetivo das cinquenta mais fáceis.
- Dificuldade por edição/parte e distinção de consolidação intermediária inicial.
- PDFs históricos/abertos fora do Git; registrar fontes, créditos, páginas e hashes.
- Biblioteca navegável separada das oito lições iniciais; conversão para reprodução
  integral é uma tarefa distinta, dependente de escrita polifônica e revisão.
- Introdução original EN/PT de tríades até modulação, com explorador de acordes
  simultâneos, grafia correta, pauta e piano SVG; atividades abertas sem nota de domínio.
- Troca de idioma preserva o acorde/inversão e os filtros escolhidos via Inertia.

O mantenedor perguntou como configurar a chave ElevenLabs. Documentamos a variável
`ELEVENLABS_API_KEY` no `.env` ignorado ou nos segredos do ambiente. Não solicitar
seu valor pelo chat. Configurar uma chave não define orçamento nem autoriza lotes
ilimitados; Q12 continua aguardando um limite numérico antes da geração paga.

Pesquisa detalhada: [50 partituras](repertoire-50.md). Conteúdo e evolução:
[caminho de harmonia](harmony-learning-path.md).

## Execução de todo o roadmap — autorização atualizada

O mantenedor pediu explicitamente: “Vc já terminou todo o roadmap? Se não, termine”.
Essa instrução prioriza também as fases antes classificadas como futuras: currículo
completo, importação, contas opcionais/sincronização, MIDI/microfone e execução
avançada. A experiência sem cadastro continua como padrão; autenticação será
optativa. Não pedir nova autorização para implementar essas fases.

Critérios de resultado continuam válidos: não marcar operação externa, revisão
especializada ou transcrição conferida como concluída sem evidência. Solicitações
de configuração da chave/orçamento ElevenLabs e acesso Railway/DNS foram
apresentadas; o desenvolvimento independente continua enquanto aguardamos.

## Implementation choices and source-review gate

A implementação estendida preserva o uso anônimo. Contas usam handle/senha sem
email nem recuperação; sincronização é save/restore explícito com revisão CAS,
sem mescla silenciosa. MusicXML e microfone permanecem no navegador. MIDI/microfone
exigem ação e permissão separadas; estimativas de microfone não atribuem acertos.
Afinação alternativa é demonstração fixa em dó, sem prometer entonação adaptativa.

As cinquenta fontes de partitura têm entradas/transcrições, mas apenas vinte
edições com fonte digital licenciada são publicadas no player. Trinta transcrições
manuais ficam fora de produção até conferência com o PDF; compilar SVG/MIDI não
prova fidelidade ao scan. Reinagle nº5, compasso12, tem leitura de baixo ainda
ambígua e pausa editorial explicitamente marcada. Corrigimos também a referência
de Beyer nº7 para PDF18–19. Nenhuma dessas pendências conta como entrega verificada.

## Áudio autorizado pelo mantenedor

Em 2026-11-06, o mantenedor forneceu uma chave ElevenLabs e pediu explicitamente
criar todos os áudios necessários. Isso autoriza a geração do banco de piano,
com solicitações limitadas e reaproveitamento de respostas; não pedir novamente
permissão para a tarefa. A chave fica somente no `.env` ignorado. Duas chamadas
piloto foram aceitas pela API, mas o formato/tamanho e a afinação não passaram
pela validação atual. Nenhuma amostra foi publicada como aprovada. Resolver o
tratamento do áudio e manter a revisão de timbre/afinação antes de ativar o banco.
