import Image from "next/image";
import Link from "next/link";

// Define o tipo de dados que o componente espera receber
export type ReleaseItem = {
  chapterTitle: string;
  chapterCreatedAt: Date;
  bookTitle: string;
  bookCoverUrl: string | null;
  authorName: string;
  bookSlug: string;
  chapterSlug: string;
};

type Props = {
  releases: ReleaseItem[];
};

// Função auxiliar para formatar a data
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function LatestReleasesTable({ releases }: Props) {
  // Caso não haja nenhum lançamento ainda
  if (releases.length === 0) {
    return (
      <div className="p-6 text-center text-readowl-gray-700 bg-white rounded-lg shadow-sm border border-readowl-gray-200">
        Nenhum capítulo foi lançado ainda.
      </div>
    );
  }

  // Renderiza a tabela
  return (
    /* MODIFICAÇÃO:
      - Adicionamos 'rounded-lg', 'border', 'shadow-sm' e 'overflow-hidden' de volta
    */
    <div className="overflow-x-auto rounded-lg border border-readowl-gray-200 shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-readowl-gray-200 bg-white">
        {/* Cabeçalho da Tabela */}
        {/* MODIFICAÇÃO:
          - Trocamos 'bg-readowl-purple-extradark' por 'bg-readowl-purple'
        */}
        <thead className="bg-readowl-purple">
          <tr>
            {/* Coluna 1: Capa */}
            <th 
              scope="col" 
              className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider font-geist-sans"
            >
              Capa
            </th>

            {/* Coluna 2: Título */}
            <th 
              scope="col" 
              className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider font-geist-sans"
            >
              Título
            </th>
            
            {/* Coluna 3: Autor (sem alteração) */}
            <th 
              scope="col" 
              className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider font-geist-sans"
            >
              Autor
            </th>
            
            {/* Coluna 4: Data (sem alteração) */}
            <th 
              scope="col" 
              className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider font-geist-sans"
            >
              Data
            </th>
          </tr>
        </thead>
        
        {/* Corpo da Tabela */}
        <tbody className="divide-y divide-readowl-gray-200">
          {releases.map((item) => {
            // Define as URLs para os links
            const chapterUrl = `/library/books/${item.bookSlug}/${item.chapterSlug}`;
            const bookUrl = `/library/books/${item.bookSlug}`;

            return (
              <tr key={`${item.bookSlug}-${item.chapterSlug}`} className="hover:bg-readowl-gray-50 transition-colors duration-150">
                
                {/* Coluna 1: Capa */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={bookUrl} className="block w-12 mx-auto">
                    <Image
                      className="h-16 w-12 rounded object-cover shadow-md"
                      src={item.bookCoverUrl || '/img/mascot/logo.png'} // Imagem placeholder
                      alt={`Capa do livro ${item.bookTitle}`}
                      width={48}
                      height={64}
                    />
                  </Link>
                </td>
                
                {/* Coluna 2: Títulos */}
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  <Link href={bookUrl} className="hover:underline">
                    <div className="text-sm font-semibold text-readowl-purple-extradark truncate font-pt-serif" title={item.bookTitle}>
                      {item.bookTitle}
                    </div>
                  </Link>
                  <Link href={chapterUrl} className="hover:underline">
                    <div className="text-sm text-readowl-gray-700 truncate" title={item.chapterTitle}>
                      {item.chapterTitle}
                    </div>
                  </Link>
                </td>

                {/* Coluna 3: Autor */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-readowl-gray-900">{item.authorName}</div>
                </td>

                {/* Coluna 4: Data */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-readowl-gray-700">
                    {formatDate(item.chapterCreatedAt)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}