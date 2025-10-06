// React import not required in newer JSX runtimes
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import NavLibrary from "./navLibrary";
import Footer from "../../components/footer";
import ButtonWithIcon from "../../components/ui/buttonWithIcon";
import BookCarousel from "../../components/ui/BookCarousel";
const addPhotoIcon = "/img/svg/generics/add-photo.svg";

function Library() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("http://localhost:3333/books");
        if (!res.ok) throw new Error("Falha ao carregar livros");
        const data = await res.json();
        if (!cancelled) setBooks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // slug generation moved to BookCarousel component

  // determine current user from mock-login localStorage
  const currentUserId =
    typeof window !== "undefined"
      ? localStorage.getItem("readowl-user-id")
      : null;

  const authored = books.filter((b) => {
    const aId = b?.authorId ?? b?.author?.id ?? null;
    return String(aId) === String(currentUserId);
  });
  const followed = books.filter((b) => {
    const aId = b?.authorId ?? b?.author?.id ?? null;
    return String(aId) !== String(currentUserId);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <NavLibrary />
      <main className="flex-grow container mx-auto p-6">
        <div className="mt-8 flex justify-center">
          <Link to="/create">
            <ButtonWithIcon
              iconUrl={addPhotoIcon}
              iconAlt="Adicionar"
              variant="primary"
              className="w-full text-center max-w-xs"
            >
              Registrar uma obra
            </ButtonWithIcon>
          </Link>
        </div>

        <section className="mt-8">
          {loading && <div>Carregando livros...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && books.length === 0 && (
            <div>Nenhum livro encontrado.</div>
          )}

          <div className="px-2">
            <BookCarousel
              books={authored.length ? authored : books.slice(0, 1)}
              title="Minha autoria!"
              iconSrc="/img/svg/book/author.svg"
              itemsPerView={1}
            />
            <BookCarousel
              books={followed.length ? followed : books}
              title="Seguidos!"
              iconSrc="/img/svg/book/book2.svg"
              itemsPerView={5}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Library;
