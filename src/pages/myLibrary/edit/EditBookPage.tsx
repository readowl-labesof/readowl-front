import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditBookForm from "./EditBookForm";

export default function EditBookPage() {
  const { slug } = useParams();
  const [book, setBook] = useState<any | null>(null);
  // matchType removed - we no longer show debug info

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`http://localhost:3333/books`);
        if (!res.ok) throw new Error("Falha ao carregar livros");
        const raw = await res.json();
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.value)
          ? raw.value
          : [];
        const makeSlug = (t: string) =>
          t
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const matchByTitle = list.find((b: any) => makeSlug(b.title) === slug);
        const matchById = list.find((b: any) => String(b.id) === String(slug));
        if (!cancelled) {
          if (matchByTitle) {
            setBook(matchByTitle);
          } else if (matchById) {
            setBook(matchById);
          } else {
            setBook(null);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setBook(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Final render: show only the form (no debug)
  const navigate = useNavigate();

  return (
    <div className="p-4 text-white">
      <div className="mt-4">
        {book ? (
          <EditBookForm
            book={book}
            onSaved={() => {
              navigate("/library");
            }}
          />
        ) : (
          <div className="text-sm mt-2">
            Nenhum livro para renderizar o formulário.
          </div>
        )}
      </div>
    </div>
  );
}
