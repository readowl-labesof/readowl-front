"use client";
import React from "react";
import { stripHtmlToText } from "@/lib/sanitize";
import Image from "next/image";
import { MessageSquare, MessageSquareText, BookOpen, Trash2, Check } from "lucide-react";

export type NotificationType =
  | "BOOK_COMMENT"
  | "CHAPTER_COMMENT"
  | "COMMENT_REPLY"
  | "NEW_CHAPTER";

export type Notification = {
  id: string;
  type: NotificationType;
  // Prefer using slug for navigation when available
  bookSlug?: string | null;
  bookCoverUrl?: string;
  bookTitle?: string;
  chapterTitle?: string | null;
  authorName?: string;
  commenterName?: string;
  commentContent?: string;
  replyContent?: string;
  originalComment?: string;
  chapterSnippet?: string;
  createdAt: string | Date;
  // UI selection (checkbox) for bulk actions
  checked?: boolean;
  // Read state (unread when false)
  read?: boolean;
};

interface Props {
  notification: Notification;
  onCheck: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
}

function formatDate(d: string | Date) {
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "" + d;
  }
}

function LeadingIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "BOOK_COMMENT":
      return <MessageSquare size={18} className="text-readowl-purple" />;
    case "CHAPTER_COMMENT":
    case "COMMENT_REPLY":
      return <MessageSquareText size={18} className="text-readowl-purple" />;
    case "NEW_CHAPTER":
    default:
      return <BookOpen size={18} className="text-readowl-purple" />;
  }
}

export default function NotificationCard({ notification, onCheck, onDelete, onClick }: Props) {
  const {
    id,
    type,
    bookCoverUrl,
    bookTitle,
    chapterTitle,
    authorName,
    commenterName,
    commentContent,
    replyContent,
    originalComment,
    chapterSnippet,
    createdAt,
    checked,
    read,
  } = notification;

  const titleByType = () => {
    if (type === "BOOK_COMMENT") return "Novo comentário na sua obra!";
    if (type === "CHAPTER_COMMENT") return "Novo comentário no capítulo!";
    if (type === "NEW_CHAPTER") return bookTitle || "Novo capítulo!"; // mostra o título do livro ao lado do ícone
    return "Atualização";
  };

  const bodyByType = () => {
    if (type === "BOOK_COMMENT") {
      return (
        <>
          <div className="text-sm text-readowl-purple-extradark">
            <span className="font-semibold">{titleByType()}</span>{" "}
            <span className="font-ptserif">“{bookTitle}”</span>
          </div>
          <div className="text-sm text-readowl-purple-extradark/90">
            De: <span className="font-semibold">{commenterName}</span>
          </div>
          {commentContent && (
            <div className="text-sm text-readowl-purple-extradark/90 line-clamp-3">
              Conteúdo: <span className="font-ptserif">{stripHtmlToText(commentContent)}</span>
            </div>
          )}
        </>
      );
    }
    if (type === "CHAPTER_COMMENT") {
      return (
        <>
          <div className="text-sm text-readowl-purple-extradark">
            <span className="font-semibold">Novo comentário no capítulo: </span>{" "}
            <span className="font-ptserif">“{chapterTitle}”</span> da sua obra <span className="font-ptserif">“{bookTitle}”</span>
          </div>
          <div className="text-sm text-readowl-purple-extradark/90">
            De: <span className="font-semibold">{commenterName}</span>
          </div>
          {commentContent && (
            <div className="text-sm text-readowl-purple-extradark/90 line-clamp-3">
              Conteúdo: <span className="font-ptserif">{stripHtmlToText(commentContent)}</span>
            </div>
          )}
        </>
      );
    }
    if (type === "NEW_CHAPTER") {
      return (
        <>
          <div className="text-sm text-readowl-purple-extradark/90"><strong>
            De: </strong><span>{authorName}</span>
          </div>
          <div className="text-sm text-readowl-purple-extradark/90"><strong>
            Novo capítulo: </strong><span className="font-ptserif">“{chapterTitle}”</span>
          </div>
          {chapterSnippet && (
            <div className="text-sm text-readowl-purple-extradark/90 line-clamp-3">
              <strong> Conteúdo: </strong><span className="font-ptserif">{stripHtmlToText(chapterSnippet)}</span>
            </div>
          )}
        </>
      );
    }
    // COMMENT_REPLY or fallback
    return (
      <>
        <div className="text-sm text-readowl-purple-extradark">
          <span className="font-semibold">Nova resposta</span> em <span className="font-ptserif">“{bookTitle}”</span>
        </div>
        {replyContent && (
          <div className="text-sm text-readowl-purple-extradark/90 line-clamp-3">
            Resposta: <span className="font-ptserif">{stripHtmlToText(replyContent)}</span>
          </div>
        )}
        {originalComment && (
          <div className="text-xs text-readowl-purple-extradark/70 line-clamp-2 mt-1">
            Original: <span className="font-ptserif">{stripHtmlToText(originalComment)}</span>
          </div>
        )}
      </>
    );
  };

  const handleCardClick = () => {
    onClick?.(id);
  };

  const unread = read === false || read === undefined; // default to unread when not provided
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
      className={`group relative w-full border rounded-md shadow-sm p-3 mb-3 min-h-[144px] ${unread ? "bg-readowl-purple-extralight/95 border-readowl-purple/60" : "bg-white border-readowl-purple/30"} hover:bg-white`}
    >
      <div className="grid grid-cols-[108px_1fr_auto] gap-3 items-start">
        {/* Left cover */}
        <div className="relative w-[108px] h-[144px] rounded overflow-hidden bg-readowl-purple-extralight">
          {bookCoverUrl ? (
            <Image src={bookCoverUrl} alt={bookTitle || "Capa"} fill sizes="108px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-readowl-purple/70">
              <BookOpen size={28} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-readowl-purple-extradark mb-1">
            <LeadingIcon type={type} />
            <span className="font-semibold">{titleByType()}</span>
            {unread && (<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-readowl-purple text-white">Novo</span>)}
          </div>
          <div className="space-y-0.5 font-ptserif text-readowl-purple-extralight">
            {bodyByType()}
          </div>
        </div>

        {/* Top-right controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-readowl-purple-extradark/70">{formatDate(createdAt)}</div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={!!checked}
                onChange={(e) => onCheck(id, e.target.checked)}
                className="accent-readowl-purple h-6 w-6"
              />
            </label>
            <button
              aria-label="Excluir notificação"
              className="p-1.5 rounded text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
      {/* Read-check icon at card bottom-right */}
      <div className="pointer-events-none absolute bottom-2 right-2">
        <Check size={24} className={unread ? "text-readowl-purple/40" : "text-readowl-purple"} />
      </div>
    </div>
  );
}
