import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import LatestReleasesTable, { ReleaseItem } from "@/components/home/LatestReleasesTable";

/**
 * Busca os capítulos mais recentes no banco de dados.
 */
async function getLatestReleases() {
  const latestChapters = await prisma.chapter.findMany({
    take: 10, // Define quantos lançamentos recentes você quer buscar
    orderBy: {
      createdAt: 'desc', // Ordena pelos mais novos primeiro
    },
    include: {
      book: { // Inclui os dados do livro relacionado
        select: {
          title: true,
          coverUrl: true,
          author: { // Inclui o autor do livro
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Formata os dados para o formato que o componente da tabela espera
  const releases: ReleaseItem[] = latestChapters.map(chapter => ({
    chapterTitle: chapter.title,
    chapterCreatedAt: chapter.createdAt,
    bookTitle: chapter.book.title,
    bookCoverUrl: chapter.book.coverUrl,
    authorName: chapter.book.author.name,
    bookSlug: slugify(chapter.book.title), // Cria o slug do livro
    chapterSlug: slugify(chapter.title), // Cria o slug do capítulo
  }));

  return releases;
}

export default async function Home() {
  // Chama a função de busca de dados
  const releases = await getLatestReleases();

  return (
    <main className="container mx-auto px-4 py-8">
      {/* O README menciona planos para Banners e outros carrosséis aqui.
          Por enquanto, focamos na tabela.
      */}
      
      {/* Seção de Últimos Lançamentos */}
      {/* MODIFICAÇÃO: A <section> agora é apenas um container */}
      <section className="mt-8">
        
        {/* MODIFICAÇÃO:
          - Trocamos 'bg-readowl-purple-extradark' por 'bg-readowl-purple'
          - Adicionamos 'rounded-lg' e 'shadow-sm'
          - Adicionamos 'mb-2' para criar o espaçamento
        */}
        <h2 className="text-2xl font-semibold font-pt-serif text-white bg-readowl-purple text-center py-3 rounded-lg shadow-sm mb-2">
          Últimos Lançamentos
        </h2>
        
        {/* Renderiza o componente da tabela (agora como irmão do h2) */}
        <LatestReleasesTable releases={releases} />
      </section>
    </main>
  );
}