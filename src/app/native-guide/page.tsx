import Navbar from "@/components/ui/navbar/Navbar";
import GuideLayout from "./components/GuideLayout";
import GuideSidebar from "./components/GuideSidebar";
import GuideSection from "./components/GuideSection";
import QuoteBlock from "./components/QuoteBlock";
import AnimatedCard from "./components/AnimatedCard";
import { GoodExample, BadExample } from "./components/Examples";
// Icon imports removed from page; icons now referenced by string key inside GuideSection

export const dynamic = "force-dynamic";

// Sidebar navigation items (order matters for reading flow)
const items = [
  { id: "intro", label: "Introdução" },
  { id: "inicio", label: "Início" },
  { id: "paragrafos", label: "Parágrafos" },
  { id: "dicendi-fundamentos", label: "Dicendi: Fundamentos" },
  { id: "dicendi-travessoes", label: "Dicendi: Travessões" },
  { id: "dicendi-dinamica", label: "Dicendi: Dinâmica" },
  { id: "dicendi-minimizacao", label: "Dicendi: Minimização" },
  { id: "dicendi-pontuacao", label: "Dicendi: Pontuação" },
  { id: "gerundio", label: "Gerúndio" },
  { id: "onomatopeias", label: "Onomatopeias" },
] as const;

export default function NativeGuidePage() {
  return (
    <>
      <Navbar />
      <GuideLayout sidebar={<GuideSidebar items={items as unknown as { id: string; label: string }[]} />}>
        {/* Hero / visão geral rápida */}
        <AnimatedCard className="p-6 md:p-8 mb-6">
          <div className="prose prose-invert max-w-none text-white/90">
            <h2 className="text-2xl md:text-3xl font-extrabold">Como o escrever pela primeira vez?</h2>
            <p className="leading-relaxed">Um guia direto, sincero e fiel ao meu estilo de narrativa.</p>
            <QuoteBlock>
              Narrar bem é arte. Escrever corretamente é base, e aqui reunimos técnicas e visões práticas para transformar ideias em cenas vívidas, sem engessar sua voz.
            </QuoteBlock>
            <p>
              Este guia explica como conduzo minha webnovel “Shihais: Remanescentes da Aura”. São reflexões e
              ferramentas para quem quer começar a escrever ou narrar melhor, com foco em fluidez, impacto e emoção do narrador.
            </p>
          </div>
        </AnimatedCard>

        {/* Seção 0. Considerações Iniciais */}
  <GuideSection id="intro" title="Considerações iniciais" icon="book">
          <p>
            Antes de mergulhar nos tópicos técnicos, algumas bases conceituais: escrever bem não é decorar regras, é
            entender por que elas existem e quando quebrá-las sem destruir a experiência de leitura. Cada conselho aqui é
            fruto de tentativa, erro, reescrita e observação do que causa retenção emocional no leitor em um formato de
            leitura digital, contínua e scrollada.
          </p>
          <p>
            Este guia não busca impor um &ldquo;estilo perfeito&rdquo;. Ele te mostra como lapidar cenas para que cada parágrafo
            tenha função: introduzir, evoluir, tensionar ou recompensar. O objetivo final é que o leitor veja a cena
            (visualização nítida), sinta impacto (emoção / tato / som / subtexto) e deseje continuar (ganho narrativo).
          </p>
          <p>
            Ao longo da escrita, quatro eixos sustentam minha tomada de decisão: clareza, ritmo, sensorialidade e
            identidade. Se um trecho é bonito mas atrapalha o ritmo, ele cai. Se é claro mas sem textura sensorial,
            aprofundo. Se tem ritmo e textura mas ninguém poderia ter escrito daquela forma além de você, você está
            entrando em identidade autoral — o santo graal da voz.
          </p>
          <p>
            Leia os exemplos com calma. Não copie literalmente; observe como ações, emoções e cenário se entrelaçam.
            Perceba que quase nada é listado em estado neutro: sempre há reação, intenção ou fricção. Se um ambiente surge,
            ele afeta alguém. Se alguém fala, sua fala desloca algo. Se nada desloca, corte ou ressignifique.
          </p>
          <QuoteBlock>
            Escrever não é despejar palavras — é orquestrar atenção. Cada frase disputa foco; só permanecem as que
            contribuem para a experiência do leitor.
          </QuoteBlock>
          <p>
            Com isso em mente, seguimos para os elementos estruturais. Ajuste, adapte, experimente. A técnica liberta.
          </p>
        </GuideSection>

        {/* 1. Início da História */}
  <GuideSection id="inicio" title="1) Começo da história: o impacto da primeira impressão" icon="book">
          <p>O que eu acredito que seja necessário quando vamos iniciar os primeiros capítulos de uma história introduzindo o nosso protagonista ou qualquer outro personagem?</p>
          <p>Segue abaixo uma tentativa:</p>
          <BadExample>Enquanto a neblina cobria os arredores, Fulano seguia seu caminho.</BadExample>
          <p>Esse tipo de início falha em fundamentos muito importantes: ambientar e situar o leitor.</p>
          <p>Quando você começa com ações sem nome, rosto ou cenário definido, o leitor entra no mundo da história como quem cai de paraquedas num sonho que não é dele.</p>
          <p>Pense assim: de início, o leitor não sabe o que você sabe. Se você não disser quem está andando, onde está, o que veste, como se sente ou por que está ali, tudo parece raso.</p>
          <p>No meu estilo, gosto de abrir com cenas visuais fortes e revelar o essencial sobre o personagem em questão, como nome, sensações, aparência, motivação, e condição atual. Não precisa despejar tudo de uma vez, mas precisa causar impacto emocional ou estético o mais rápido possível. Se você diz que tal personagem tem pele azul, e não diz o que ele veste, onde está, ou o que carrega, o leitor pode acabar imaginando um smurf pelado e sem rosto.</p>
          <p>Dê ao menos uma peça de roupa, uma arma, ou um detalhe físico relevante ao apresentar alguém relevante na história. Não precisa ser uma ficha de RPG completa, mas também não pode ser só “fulano”. Se o personagem é alegre, misterioso, sonhador, descreva-o.</p>
          <GoodExample>O crepúsculo da tarde nublada ampliava o tédio estampado em Akemi Aburaya, um garoto de cabelos e olhos castanhos, que sentado no banco de madeira áspera de um bonde elétrico, segurava sobre as coxas uma grande caixa de papelão cujo amassava sua habitual camisa de mangas dobradas e sua calça marrom com suspensórios folgados cedidos ao peso da rotina de quem recém acabou de atingir a maioridade.</GoodExample>
          <p>Agora que sabemos melhor como inserir um novo personagem, vamos para outro exemplo!</p>
          <BadExample>Akemi encontrou a taberna caótica e entrou, algumas lamparinas estavam acesas.</BadExample>
          <p>Essa foi uma narrativa com a finalidade de inserir um cenário, mas sabe o que falta? Textura. O autor diz que há uma cidade simples, mas isso não diz quase nada.</p>
          <p>Se o leitor não visualiza, ele não sente, não imerge, e consequentemente, perde o interesse.</p>
          <p>Qual era o estilo arquitetônico da taberna? Medieval? Rural japonesa? Moderno decadente? Como era a cidade envolta? Como eram as residências? Como estavam dispostas? Tinham pessoas andando? O que elas vestiam? O que transmitiam no olhar? Tinham cheiros, sons, luzes? Havia odor de gasolina? Poeira no ar?</p>
          <p>Escrever “Akemi encontrou a taverna caótica e entrou” serve, no máximo, para rascunho apressado ou roteiro seco. O ambiente precisa viver com os personagens. Mais do que um reles plano de fundo, o cenário tem que reagir, ameaçar, acolher ou perturbar, transforme-o em uma força ativa, capaz de revelar sentimentos variados: conforto, medo, nuances e até antecipação de conflitos. Um bom ambiente não é somente descrito: ele atinge o personagem, e o leitor sente junto.</p>
          <GoodExample>Sorrateiro pelas calçadas cinzentas da cidade noturna e ocultado sob um manto preto, Akemi encontrou a tão falada construção de madeira escurecida pelo tempo: entre barris empilhados e lampiões enferrujados, destacava-se uma taverna de dois andares. Janelas pequenas envoltas por cortinas vermelhas desbotadas deixavam escapar o brilho alaranjado no interior. Chaminés enegrecidas soltavam filetes de fumaça que se perdiam no céu acinzentado, todas sustentadas por tábuas mal alinhadas e vigas expostas.
          <br/><br/>Uma placa de madeira lascada pendurada, por correntes ao lado da entrada central composta por duas portinholas pesadas que aguardavam pelo próximo cliente, exibia sua mensagem: “Bem-vindo ao Bar Kurosaki! Espero que tenhas trago a sorte, e de precaução, muitas moedas!”
          <br/><br/>Quando adentrou no interior abafado do estabelecimento, Akemi analisou se expor seu rosto sem conhecer o terreno seria uma boa ideia, contudo, esconder-se chamaria mais atenção. Então, ciente do risco, ele puxou seu capuz para trás, e imediatamente, o cheiro de mofo e cerveja velha o deu boas-vindas.
          <br/><br/>Ao som de risadas zombeteiras, socos bem dados acompanhados do quebrar de pratos e gritos de vitória, a luz laranja das lamparinas deformava os rostos dos clientes em mesas redondas, uns entretidos pela bebedeira e jogos de azar, outros irritados pelas apostas mal feitas.
          <br/><br/>Observando o caos, Akemi entendeu que seus olhares precisavam de contenção, e seus passos, cautela. “Que lugar nojento”, pensou ele, antes mesmo de notar o taberneiro, que limpava um copo com tanta raiva que parecia tentar apagar algum pecado no vidro.</GoodExample>
          <p>Observe que o medo do personagem veio da reação ao ambiente. O bar não foi apenas descrito, foi sentido, possibilitando ao leitor imaginá-lo como um personagem sombrio que pressionava Akemi.</p>
          <p>Portanto, na hora de ambientar cenários relevantes, esqueça listas frias de objetos e adjetivos. Use os sentidos do personagem como filtro: o que ele ouve, cheira, toca, vê, e o que isso provoca internamente. Insira reações: o cenário precisa afetar o corpo ou o psicológico de quem está nele. Conecte tudo ao subtexto da cena: um lugar abafado, além de quente, deve sufocar o personagem, isso, claro, se ele se abalar com o ambiente. Narre de acordo com as características e estado atual dos presentes, e caso não tenha ninguém ali, transmita o porquê.</p>
          <p>Cenário bom não é só bonito, precisa ser relevante e sensorial. Não é sobre descrever tudo, é sobre escolher os detalhes certos e pertinentes, e o mais importante: escrever para o leitor imaginar a cena da melhor maneira possível e não fazê-lo ler uma narrativa no qual não dê tempo da mente moldar o inexistente. A informação tem que chegar através da narrativa com precisão e timing, sem entupir o parágrafo.</p>
          <QuoteBlock>Evite finalizar parágrafos com frases mortas ou sem força. O fim do parágrafo é onde o leitor respira, absorve e continua… ou, pula fora. Busque fechar com frases que empurram a narrativa adiante e criam expectativa.</QuoteBlock>
          <BadExample>Ele se sentou no balcão e pediu sua caneca.</BadExample>
          <GoodExample>Ele se sentou no balcão do bar, um simples gesto que fez os outros se afastarem.<br/><br/>Se havia um futuro destrutivo naquela noite maldita, estaria presente na espuma da próxima caneca solicitada.</GoodExample>
        </GuideSection>

        {/* 2. Parágrafos */}
  <GuideSection id="paragrafos" title="2) Parágrafos: equilíbrio entre leveza e densidade" icon="paragraphs">
          <p>Webnovel não é um livro físico com 600 páginas, cada uma com parágrafos que excedem seis ou mais linhas. Quem lê webnovel quer ritmo, fluxo, praticidade e recompensa rápida na leitura. Então, parágrafos curtos são mais amigáveis. Mas isso não significa que você não possa fazer um parágrafo mais longo para ambientação ou introspecção.</p>
          <p>Entretanto, evite parágrafos longos em sequência. O leitor aceita um parágrafo maior quando o que ele ganha é interessante. Porém, tome cuidado, pois três blocos gigantes seguidos vão fazer ele rolar a tela procurando o fim, ou simplesmente dropar a leitura.</p>
          <p>Como observação final, recomendo prestar atenção ao tamanho da fonte e o modelo de arquivo que está usando no seu editor de texto. Às vezes não é o parágrafo que está grande ou pequeno demais, são as letras. E atenção à margem do seu arquivo, não sei ainda como configurar isso no docs, mas ela também pode enganar com a extensão do parágrafo.</p>
          <p>Costumo deixar o tamanho da fonte em 12, usando a clássica Times New Roman, simples, limpa e bonita aos meus olhos.</p>
        </GuideSection>

        {/* 3. Dicendi (dividido em sub-seções) */}
  <GuideSection id="dicendi-fundamentos" title="3.1) Dicendi – fundamentos" icon="quote">
          <p>
            Dicendi (&ldquo;verbo de dizer&rdquo;) é todo marcador como <em>disse</em>, <em>falou</em>, <em>respondeu</em>, <em>perguntou</em>. É
            uma ferramenta de apoio — não a protagonista do diálogo. Uso criterioso mantém o foco na ação, emoção e
            fricção entre personagens.
          </p>
          <p>
            Seu papel principal: identificar o emissor quando a voz não é óbvia e calibrar tom (sussurrou, murmurou,
            rosnou). Quando vira muleta automática, polui ritmo e tira intensidade visual da cena.
          </p>
          <QuoteBlock>Regra de ouro: se o leitor sabe quem fala e sente o tom pela construção anterior, o dicendi pode cair.</QuoteBlock>
        </GuideSection>
  <GuideSection id="dicendi-travessoes" title="3.2) Travessões e aspas" icon="quote">
          <p>
            Uso travessões para todos os diálogos: abertura e, quando necessário, encerramento antes de retomar o
            narrador. Aspas ficam restritas a pensamentos internos ou citações. Essa padronização dá assinatura visual e
            evita mistura confusa de estilos.
          </p>
          <GoodExample>— Serei o melhor Shihai que Asahi já viu! Hehe! — brincou Akemi, forçando os músculos dos braços como um troglodita… só que magrelo.</GoodExample>
          <BadExample>— Haha, foi bom jogar com você — disse o vitorioso.</BadExample>
          <p>
            Note como no mau exemplo nada além de <em>disse</em> acrescenta. No bom exemplo, a ação + metáfora visual criam
            imagem e personalidade, tornando o dicendi auxiliar, não centro.
          </p>
        </GuideSection>
  <GuideSection id="dicendi-dinamica" title="3.3) Dinâmica viva entre falas" icon="quote">
          <p>
            Diálogos ganham energia quando intercalados com microreações, movimentos e subtexto. Essa &ldquo;respiração&rdquo;
            dispensa dicendi repetitivo porque cada bloco carrega identidade própria.
          </p>
          <QuoteBlock>O segredo está em manter a narrativa viva entre as falas. Isso impede que a cena fique seca, mesmo com pouco dicendi.</QuoteBlock>
          <p>Dinâmica rápida sem dicendi:</p>
          <GoodExample>— Desculpe perguntar, mas seria legal saber a idade de todos aqui. Que tal começarmos com você, Aruni?<br/><br/>— E-eu?!<br/><br/>— Akemi! Perguntar a idade das garotas não é algo que se faça!<br/><br/>— A-ah! Perdão, Miya! Eu só-<br/><br/>— P-por favor, não se estranhem, posso sim responder primeiro. Tenho dezoito.</GoodExample>
          <p>Construindo tensão sem dicendi explícito:</p>
          <GoodExample>Cautelosa e sentida pelo que fez, Sugiru abriu a porta e entrou no quarto escuro onde Nihara se escondia sob o lençol da cama, a energia ruim a atingiu de imediato.<br/><br/>— Ei, é a Sugiru. Você pode conversar?<br/><br/>— Não fale comigo.<br/><br/>— Nihara, pelo menos olhe pra mim.<br/><br/>— Não entendeu que eu não quero conversar?! Suma!<br/><br/>— Por favor, snif… Eu não queria te magoar, snif… Me perdoa.</GoodExample>
        </GuideSection>
  <GuideSection id="dicendi-minimizacao" title="3.4) Minimização e identidade" icon="quote">
          <p>
            Para reduzir dicendi sem sacrificar clareza: 1) dê voz distinta (tiques, risos, vocabulário); 2) use ações
            imediatas após a fala; 3) deixe o contexto carregar emoção; 4) varie cadência (falas curtas vs. blocos
            reflexivos). Se ainda assim houver ambiguidade, reintroduza um dicendi pontual.
          </p>
          <p>
            Personagens marcantes permitem que o leitor reconheça quem fala quase sem marcadores. Construir isso cedo
            reduz a necessidade de &ldquo;disse&rdquo; distribuído como purpurina.
          </p>
          <GoodExample>A nova presença completamente albina mantinha-se calada, e embora apenas sua cabeça estivesse visível por cima da mesa do refeitório, seu olhar deslocava o conforto de Aruni e Akemi. — Estão olhando o quê?! Perderam alguma coisa na minha cara?! — indagou ela...<br/><br/>— Aawwnnn! — Refletindo brilho nos grandes olhos verdes Nikko, correu...<br/><br/>— Ôe! Que intimidade é essa?! Me solta! Tá querendo ir dessa pra pior, é?!<br/><br/>... (trecho abreviado mantendo estilo)</GoodExample>
        </GuideSection>
  <GuideSection id="dicendi-pontuacao" title="3.5) Pontuação e estruturas" icon="quote">
          <p>
            Regras práticas que aplico: após <strong>?</strong> ou <strong>!</strong> normalmente não uso vírgula antes do dicendi se ele vier
            direto (travessão fecha e narrador retoma). Dicendi antes da fala pede dois pontos: <em>Akemi gritou:</em> — ...
            Estrutura fala + dicendi + fala exige que o dicendi seja curto e funcional.
          </p>
          <QuoteBlock>Notas finais: mantenha consistência na abertura/fechamento de travessões, evite dicendi decorativo e priorize ação para transmitir emoção.</QuoteBlock>
        </GuideSection>

        {/* 4. Gerúndio */}
  <GuideSection id="gerundio" title="4) Gerúndio: o inimigo disfarçado de solução" icon="rewind">
          <p>— Tsc! Que droga! — esbravejou ele, desembainhando a espada e virando-se para trás. O cerco fechou.</p>
          <BadExample>— Tsc! Que droga! — esbravejou ele, desembainhando a espada e virando-se para trás. O cerco fechou.</BadExample>
          <p>Essa overdose de gerúndios pode criar uma sensação estranha de ambiguidade, como se tudo estivesse acontecendo ao mesmo tempo, de forma imprecisa e repetitiva.</p>
          <GoodExample>— Tsc! Que droga! — Ele puxou a espada e virou-se para trás. O cerco fechou.</GoodExample>
          <p>Aproveitei este exemplo para também demonstrar uma forma de evitar o uso de dicendi. O uso de “!” já reforça por si só a revolta do personagem.</p>
          <p>Só cuidado para a narrativa não ficar seca demais nas partes que pedem mais emoção. Se for algo banal, tudo certo. Mas se forem ações mais complexas ou um acontecimento mais elaborado, trate de caprichar para que o leitor sinta ao invés de só passar o olho.</p>
        </GuideSection>

        {/* 5. Onomatopeias */}
  <GuideSection id="onomatopeias" title="5) Onomatopeias: padrão visual" icon="sound">
          <p>Você pode usar onomatopeias do jeito que quiser, o importante é ser minimamente consistente com o estilo que escolher.</p>
          <p>Nas minhas onomatopeias, uso itálico e negrito para destacar, e três exclamações com a caixa alta quando quero estourar o impacto. Também não há problemas caso um som muito baixo seja iniciado com minúscula.</p>
          <div className="space-y-2">
            <div><span className="onomatopeia">Toc, toc, toc.</span> <span className="text-white/70">(Simples, sem um grande peso sonoro, mas presente.)</span></div>
            <div><span className="onomatopeia">woshhh…</span> <span className="text-white/70">(Sorrateiro, baixo, mas escutável.)</span></div>
            <div><span className="onomatopeia">Bam!</span> <span className="text-white/70">(Barulhento, mas longe de ser ensurdecedor.)</span></div>
            <div><span className="onomatopeia">KA-BOOOM!!!</span> <span className="text-white/70">(Estrondoso, com alta magnitude e impacto auditivo.)</span></div>
          </div>
          <QuoteBlock>Não narro pra te engessar, mas pra te libertar ao máximo dos erros invisíveis.</QuoteBlock>
          <p>O estilo é meu, mas o leitor é o alvo. Quero que ele veja, sinta, ria, tema, e continue.</p>
          <p>Pra mim, escrever é montar um palco onde tudo precisa ser visto com palavras, e quem quer ser autor, precisa escrever para que o leitor não se esqueça do que leu.</p>
          <p>Próximos tópicos a serem construídos:</p>
          <ul>
            <li>Como conectar o leitor aos seus personagem;</li>
            <li>Como roteirizar;</li>
            <li>Listar os vícios de linguagem;</li>
            <li>Evitar negações;</li>
            <li>Como destravar a escrita do modo mais natural ao extremamente apelativo;</li>
            <li>…</li>
          </ul>
        </GuideSection>
      </GuideLayout>
    </>
  );
}
