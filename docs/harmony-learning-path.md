# Acordes e caminho para teoria avançada

O mantenedor priorizou expressamente acordes e assuntos avançados na aplicação em
2026-11-05. `/harmony` agora contém doze unidades de estudo autorais em EN/PT,
com explicação, exemplo e atividade aberta. Este arquivo registra a progressão;
o conteúdo bilíngue executado pela interface está em `resources/js/data/harmony.json`.

## Pré-requisitos e alcance

Estudar leitura de notas, semitons, intervalos, graus, escalas maiores e menores
antes de análise harmônica. Referências conceituais: capítulos
[10](study-10.md), [11](study-11.md), [14](study-14.md), [15](study-15.md),
[18](study-18.md), [21](study-21.md), [25](study-25.md), [26](study-26.md),
[40](study-40.md)–[43](study-43.md), [49](study-49.md)–[53](study-53.md).
As explicações de funções, empréstimo e cadências são introduções próprias;
não atribuir ao livro uma cobertura específica que não foi verificada.

O explorador permite fundamentais naturais Dó a Si, nove qualidades e todas as
inversões de cada tríade/tétrade. Exibe grafia diatônica na pauta e nomes escritos,
destaca as teclas simultâneas e reproduz as notas pelo relógio de áudio. Usa
MIDI60=C4 e temperamento igual, mantendo Si𝄫 escrito mesmo quando soa como Lá.
A fundamental continua a mesma quando o baixo muda. A pauta do acorde usa
alterações explícitas sem armadura de tonalidade.

As atividades são abertas; não há pontuação automática de domínio harmônico.
O conteúdo introdutório avançado não equivale a um curso completo de harmonia,
contraponto, orquestração ou análise. Revisão especializada externa e exercícios
semânticos graduados permanecem tarefas do roadmap.

## Unidades de estudo

### 01 — Tríades: construir com terças

Nível: Fundamento.

Uma tríade tem fundamental, terça e quinta. Conte primeiro os nomes das notas e depois os semitons: maior 0–4–7, menor 0–3–7, diminuta 0–3–6 e aumentada 0–4–8. Uma terça nem sempre tem quatro semitons.

Exemplo: Dó maior = Dó–Mi–Sol; Dó menor = Dó–Mi♭–Sol. Só a terça muda. Dó diminuto = Dó–Mi♭–Sol♭; Dó aumentado = Dó–Mi–Sol♯.

Atividade: Compare maior e menor no explorador. Diga qual nota muda antes de ouvir.

### 02 — Fundamental, baixo e inversão

Nível: Fundamento.

A fundamental dá nome ao acorde; o baixo é a nota mais grave que soa. A primeira inversão coloca a terça no baixo; a segunda coloca a quinta. Reordenar vozes superiores muda a disposição, mas não necessariamente a inversão.

Exemplo: Dó–Mi–Sol está no estado fundamental; Mi–Sol–Dó é primeira inversão (C/E); Sol–Dó–Mi é segunda inversão (C/G). Todos continuam sendo Dó maior.

Atividade: Toque as três posições e identifique o baixo sem mudar o seletor da fundamental.

### 03 — Tétrades e grafia

Nível: Desenvolvimento.

Acrescente uma sétima à fundamental. A sétima de dominante combina tríade maior e sétima menor; a sétima maior usa sétima maior. Meio-diminuto e diminuto têm a mesma tríade diminuta, mas sétimas diferentes.

Exemplo: C7 = Dó–Mi–Sol–Si♭; Cmaj7 = Dó–Mi–Sol–Si; Cm7 = Dó–Mi♭–Sol–Si♭; Cø7 = Dó–Mi♭–Sol♭–Si♭; C°7 = Dó–Mi♭–Sol♭–Si𝄫. Si𝄫 soa como Lá no temperamento igual, mas mantém a grafia de sétima.

Atividade: Compare C7 e Cmaj7, depois meio-diminuto e diminuto. Encontre a sétima que mudou.

### 04 — Campo harmônico e função

Nível: Desenvolvimento.

Empilhe terças dentro da escala maior: I ii iii IV V vi vii°. Maiúsculas e minúsculas indicam a qualidade. Tônica, predominante e dominante descrevem comportamento no contexto tonal, não um rótulo imutável de uma cifra.

Exemplo: Em Dó maior: C, Dm, Em, F, G, Am, B°. Dm–G7–C é ii–V7–I; o movimento predominante–dominante–tônica ajuda a estabelecer Dó.

Atividade: Construa I, IV e V em Sol maior usando Sol–Lá–Si–Dó–Ré–Mi–Fá♯. Confira cada terça.

### 05 — Cadências e finais de frase

Nível: Desenvolvimento.

Uma cadência é uma chegada definida por harmonia, ritmo e posição melódica. V–I é autêntica, IV–I plagal e a chegada à dominante é semicadência. Na terminologia tonal usual, a autêntica perfeita exige V e I no estado fundamental e grau 1 na voz superior sobre I.

Exemplo: Em Dó: G7–C sugere movimento autêntico; F–C plagal; G–Am de engano (V–vi). Cifras isoladas não comprovam uma cadência autêntica perfeita.

Atividade: Compare um final em Sol com outro em Dó. Cante uma melodia que torne cada chegada convincente.

### 06 — Condução de vozes e resoluções

Nível: Avançado.

Acompanhe cada voz horizontalmente. Mantenha notas comuns e prefira movimentos pequenos quando o estilo pede ligação suave. Na resolução tonal da dominante, a sensível tende a subir e a sétima do acorde tende a descer; dobramentos e estilo influenciam os detalhes.

Exemplo: Em G7–C, Si tende a Dó e Fá tende a Mi. A redução didática a três vozes Si3–Fá4–Sol4 → Dó4–Mi4–Sol4 isola essas tendências; não é uma harmonização completa a quatro vozes.

Atividade: Siga cada voz e compare uma ligação próxima com grandes saltos. Explique a diferença que ouve.

### 07 — Modos e centro tonal

Nível: Avançado.

Um modo é percebido pelo centro tonal e pelos intervalos característicos. Começar as teclas brancas em outra nota não estabelece um modo se fraseado e harmonia não sustentarem esse centro. O dórico tem terça menor e sexta maior.

Exemplo: Ré dórico: Ré–Mi–Fá–Sol–Lá–Si–Dó–Ré. Ré menor natural usa Si♭. Sustente Ré como referência e compare Si com Si♭.

Atividade: Escreva quatro compassos que retornem a Ré e destaquem Si. Identifique a terça menor e a sexta maior.

### 08 — Dominantes secundárias

Nível: Avançado.

Uma dominante secundária aponta temporariamente para um acorde diatônico como se fosse tônica. A barra em V/V significa dominante da dominante; é diferente da barra que indica baixo em C/E. Uma tonicização breve não estabelece, sozinha, uma modulação.

Exemplo: Em Dó maior, D7–G–C é V7/V–V–I. D7 contém Fá♯, que conduz a Sol. Fá♯ é cromático em relação a Dó maior.

Atividade: Construa A7 resolvendo em Dm dentro de Dó maior. Nomeie a nota cromática e sua função em algarismos romanos.

### 09 — Empréstimo modal

Nível: Avançado.

O empréstimo modal usa cores de um modo paralelo com a mesma tônica. Um acorde emprestado pode mudar a cor sem mudar o centro tonal. Identifique o grau alterado e sua condução melódica em vez de chamar todo cromatismo de modulação.

Exemplo: Em Dó maior, F–Fm–C usa IV–iv–I. O Lá♭ de Fm vem de Dó menor; uma linha interna possível é Lá–Lá♭–Sol.

Atividade: Compare IV–I com IV–iv–I e cante a linha interna cromática.

### 10 — Modulação com acorde pivô

Nível: Avançado.

A modulação estabelece outro centro tonal ao longo da frase, muitas vezes com cadência e confirmação posterior. Um acorde pivô pode pertencer à tonalidade inicial e à de chegada; sua função muda com o contexto.

Exemplo: C–Am–D7–G pode começar I–vi em Dó, reinterpretar Am como ii de Sol e seguir V7–I em Sol. A sequência isolada é ambígua: prolongue a frase e faça cadência em Sol antes de afirmar a nova tonalidade.

Atividade: Analise Am nas duas tonalidades. Acrescente outra frase em Sol que confirme o novo centro.

### 11 — Forma, ornamento e interpretação

Nível: Avançado.

Mapeie motivos, frases, cadências e retornos antes de aumentar o andamento. A forma binária tem duas seções principais; sinais de repetição descrevem execução, enquanto ligaduras de expressão e articulação organizam grupos. A realização de ornamentos depende da época, fonte e contexto.

Exemplo: Em um minueto curto, marque A e B, repetições e cadências. Compare a última nota do baixo com o final melódico; nenhum deles isoladamente prova a função harmônica.

Atividade: Escolha um minueto de Petzold na biblioteca. Marque frases em uma cópia privada e justifique cada divisão.

## Próximos módulos e asserts

- Intervalos e escalas com grafia correta, incluindo transposição e contexto modal.
- Atividades de construção de acordes, identificação de baixo e inversões;
  aceitar enarmonias somente quando a pergunta pedir equivalência sonora.
- Cadências com vozes e métrica suficientes para distinguir classificações.
- Condução de vozes com critérios declarados por estilo, sem rejeitar música
  válida por uma regra escolar descontextualizada.
- Extensões de nona, acordes alterados, dominantes substitutas e análise formal,
  após introduzir os pré-requisitos e exemplos auditivos correspondentes.
- Polifonia de partituras, ligaduras e repetições antes de prometer reprodução
  integral dos cinquenta PDFs. Toda transcrição exige comparação com sua fonte.

## Extended delivery

The twelve-topic explorer now includes ninths and altered dominants. The 58-topic
course adds original review questions and semantic interval/scale construction.
See [extended learning](extended-learning.md) for evaluator boundaries and pending
independent specialist review.
