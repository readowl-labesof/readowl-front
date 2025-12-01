/* eslint-disable react/no-unescaped-entities */
import LandingHeader from "../about/LandingHeader";
import AppearCard from "@/components/animation/AppearCard";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-readowl-purple-dark/10">
      <LandingHeader />
      <main className="container mx-auto px-6 py-10 text-readowl-purple-medium">
        <h1 className="text-3xl font-bold text-white mb-8">Ajuda</h1>
        <AppearCard className="mb-8">
          <p className="text-readowl-purple-extralight">
            Encontre respostas rápidas sobre como usar o Readowl, publicar livros e interagir com a comunidade.
          </p>
        </AppearCard>

       
        <section className="flex flex-col gap-4">
          
          <h2 className="text-2xl font-semibold text-white mt-6 mb-2">Para Autores</h2>
          <FaqItem
            delayMs={100}
            question="Como publico um livro?"
          >
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Crie sua conta:</strong> Você precisa estar logado para publicar.</li>
              <li><strong>Acesse sua Biblioteca:</strong> No menu principal, clique em "Biblioteca".</li>
              <li><strong>Crie o Livro:</strong> Clique no botão "Criar livro".</li>
              <li><strong>Preencha os Detalhes:</strong> Você precisará fornecer:
                <ul className="list-disc pl-5 mt-1">
                  <li>Uma imagem de Capa (tamanho recomendado: 800x1200px).</li>
                  <li>Um Título.</li>
                  <li>Uma Sinopse (capriche para atrair leitores!).</li>
                  <li>Pelo menos um Gênero (ex: Fantasia, Romance).</li>
                  <li>O Status do livro (se está 'Ativo', 'Concluído', etc.)</li>
                </ul>
              </li>
              <li><strong>Publicar:</strong> Após revisar, clique em "Publicar". Seu livro estará visível, mas ainda sem capítulos.</li>
            </ol>
          </FaqItem>

          <FaqItem
            delayMs={200}
            question="Como publico um capítulo?"
          >
            <p>
              Depois de criar o livro, você será redirecionado para a página dele. Na aba "Capítulos", haverá um botão "Postar novo capítulo". Você poderá então adicionar um título e o conteúdo do capítulo em nosso editor de texto.
            </p>
          </FaqItem>

          <FaqItem
            delayMs={300}
            question="O que significa cada 'Status do livro'?"
          >
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Ativo:</strong> O livro está em andamento e recebendo atualizações.</li>
              <li><strong>Concluído:</strong> A história foi finalizada e não receberá novos capítulos.</li>
              <li><strong>Pausado:</strong> O autor deu uma pausa temporária nas atualizações.</li>
              <li><strong>Cancelado:</strong> O livro foi descontinuado pelo autor.</li>
            </ul>
          </FaqItem>

          <FaqItem
            delayMs={400}
            question="Como editar ou excluir meu livro/capítulo?"
          >
            <p>
              Apenas o autor do livro pode editar ou excluir.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Edição de Livro:</strong> Na página do seu livro, procure pelo botão "Editar Livro". Você poderá alterar capa, sinopse, gêneros e status.</li>
              <li><strong>Edição de Capítulo:</strong> Na página de leitura do capítulo, um botão "Editar Capítulo" estará visível para você.</li>
              <li><strong>Exclusão:</strong> A opção de excluir (tanto o livro quanto capítulos) também estará disponível na página de edição. <strong className="text-red-400">Atenção: A exclusão é permanente e não pode ser desfeita.</strong> Para exclusão do livro, podemos solicitar confirmação adicional por senha.</li>
            </ul>
          </FaqItem>

          
          <h2 className="text-2xl font-semibold text-white mt-6 mb-2">Para Leitores</h2>
          <FaqItem
            delayMs={500}
            question="Como interajo com os livros e autores?"
          >
            <p>
              Você pode interagir de várias formas:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Seguindo (Follow):</strong> Na página do livro, clique em "Seguir" para ser notificado sobre novos capítulos.</li>
              <li><strong>Avaliando (Rating):</strong> Você pode dar uma nota (1 a 5 estrelas) para livros que já leu.</li>
              <li><strong>Comentando:</strong> Deixe comentários nos capítulos para interagir com o autor e outros leitores.</li>
            </ul>
          </FaqItem>

          <FaqItem
            delayMs={600}
            question="Como funciona a busca?"
          >
            <p>
              Você pode usar a barra de busca no topo do site para procurar por título do livro ou nome do autor. Em breve, adicionaremos filtros por gênero e status.
            </p>
          </FaqItem>

          
          <h2 className="text-2xl font-semibold text-white mt-6 mb-2">Conta e Segurança</h2>
          <FaqItem
            delayMs={700}
            question="Esqueci minha senha, e agora?"
          >
            <p>
              Na página de Login, clique no link "Esqueci minha senha". Você precisará informar seu e-mail de cadastro. Enviaremos um link seguro para você criar uma nova senha.
            </p>
          </FaqItem>

        </section>
        
        
      </main>
    </div>
  );
}


function FaqItem({
  question,
  children,
  delayMs = 0,
}: {
  question: string;
  children: React.ReactNode;
  delayMs?: number;
}) {
  return (
    <AppearCard className="bg-readowl-purple-medium/30 p-0" delayMs={delayMs}>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between p-6">
          <span className="text-xl font-semibold text-white">{question}</span>
          <span className="transition-transform duration-300 group-open:rotate-180">
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </span>
        </summary>
        <div className="text-readowl-purple-extralight space-y-2 px-6 pb-6">
          {children}
        </div>
      </details>
    </AppearCard>
  );
}