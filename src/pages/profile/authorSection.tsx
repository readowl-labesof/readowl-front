import { useEffect, useState } from "react";

interface Book {
  id: string;
  title: string;
  synopsis?: string;
  coverUrl?: string;
  userId: string;
  gender?: string;
}

interface User {
  id: string;
  nome?: string;
}

export default function AuthorSection({ user }: { user: User | null }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando livros para userId:', user.id);
        const response = await fetch(`http://localhost:3000/books?userId=${user.id}`);
        const data = await response.json();
        console.log('Livros encontrados:', data);
        setBooks(data);
      } catch (error) {
        console.error("Erro ao buscar livros do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="mt-8">
        <div className="bg-purple-600 text-white p-4 rounded-lg">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            📚 Autoria de "{user?.nome || 'Usuário'}"!
          </h2>
        </div>
        <div className="mt-4">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-purple-600 text-white p-4 rounded-lg">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          📚 Autoria de {user?.nome || 'Usuário'}!
        </h2>
      </div>
      
      <div className="mt-4">
        {books.length > 0 ? (
          <div className="flex gap-8 overflow-x-auto">
            {books.map((book) => (
              <div key={book.id} className="flex flex-col items-center min-w-[200px]">
                {/* Capa do livro */}
                <div className="w-40 h-52 mb-4 rounded-lg overflow-hidden shadow-lg">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-200 flex items-center justify-center">
                      <span className="text-purple-600 text-4xl">📖</span>
                    </div>
                  )}
                </div>
                
                {/* Informações do livro */}
                <div className="text-center">
                  <h3 className="font-semibold text-white text-base mb-1">
                    {book.title}
                  </h3>
                  <p className="text-white text-sm">
                    por {user?.nome || 'Autor'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white text-lg">
              {user?.nome || 'Usuário'} não possui obras de autoria registradas no Readowl.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}