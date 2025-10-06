import { useRef } from "react";
import { Link } from "react-router-dom";

interface Book {
  id: string;
  title?: string;
  coverUrl?: string;
}

interface Props {
  books: Book[];
  title: string;
  iconSrc?: string;
  itemsPerView?: number;
}

const makeSlug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function BookCarousel({
  books,
  title,
  iconSrc,
  itemsPerView = 5,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(
      200,
      Math.floor(el.clientWidth / Math.max(1, itemsPerView))
    );
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {iconSrc && <img src={iconSrc} alt="icon" className="w-6 h-6" />}
          <h3 className="bg-readowl-purple text-white rounded-full px-6 py-2 font-semibold">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-white/90 shadow"
          >
            ‹
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-white/90 shadow"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto no-scrollbar py-2"
      >
        {books.map((b) => {
          const slug = b.title ? makeSlug(b.title) : b.id;
          return (
            <div key={b.id} className="w-36 flex-shrink-0">
              <Link to={`/library/${slug}/edit`}>
                <img
                  src={b.coverUrl || "/img/mascot/logo.png"}
                  alt={b.title}
                  className="w-full h-48 object-cover rounded shadow"
                />
              </Link>
              <div className="text-xs text-center mt-1 text-white">
                {b.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
