"use client";
import React from 'react';
import BookCarousel, { type CarouselBook } from '@/components/book/BookCarousel';
import Modal from '@/components/ui/modal/Modal';

export default function TrendingHelpCarousel({ books, itemsPerView = 6 }: { books: CarouselBook[]; itemsPerView?: number }) {
  const [open, setOpen] = React.useState(false);
  const onHelp = () => setOpen(true);
  return (
    <>
      <BookCarousel
        title="Em destaque!"
        icon={undefined}
        books={books}
        itemsPerView={itemsPerView}
        rightAction={
          <button type="button" onClick={onHelp} className="w-5 h-5 bg-readowl-purple-dark text-white text-xs flex items-center justify-center" aria-label="Como funciona o Em destaque?">?</button>
        }
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Como funciona o Em destaque?" widthClass="max-w-2xl">
        <div className="text-sm leading-relaxed text-readowl-purple-extralight">
          <p className="mb-2">A seção &quot;Em destaque!&quot; destaca livros com maior engajamento recente (últimos 14 dias), calculado por um score ponderado:</p>
          <ul className="list-disc ml-5 mb-3">
            <li>Visualizações únicas por usuários: peso 0.20</li>
            <li>Avaliações (quantidade × média): peso 0.45</li>
            <li>Comentários (exceto do autor): peso 0.35</li>
          </ul>
          <p className="mb-2">Os livros são normalizados por percentis para evitar outliers e ordenados pelo score.</p>
        </div>
      </Modal>
    </>
  );
}
