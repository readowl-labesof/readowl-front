import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/navbar/Navbar";
import ButtonWithIcon from "@/components/ui/button/ButtonWithIcon";
import BookCarousel from "@/components/book/BookCarousel";
import { BookUser, BookMarked, BookPlus } from 'lucide-react';
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { BreadcrumbAuto } from "@/components/ui/navbar/Breadcrumb";

export default async function Library() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login?callbackUrl=/library");

    // Load books authored by current user
    const myBooksRaw = await prisma.book.findMany({
        where: { authorId: session.user.id },
        orderBy: { createdAt: 'asc' }, // oldest first per requirement
        select: { id: true, slug: true, title: true, coverUrl: true }
    });
    const myBooks = myBooksRaw.map(b => ({ ...b, slug: b.slug ?? undefined }));

    // Load books followed by current user (restore carousel)
    const followedRaw = await prisma.book.findMany({
        where: { followers: { some: { userId: session.user.id } } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, slug: true, title: true, coverUrl: true },
    });
    const followed = followedRaw.map(b => ({ ...b, slug: b.slug ?? undefined }));

    return (
        <>
            <Navbar />
            <main className="min-h-screen">
                <div className="w-full flex justify-center mt-14 sm:mt-16">
                    <BreadcrumbAuto anchor="static" base="/home" labelMap={{ library: "Biblioteca" }} />
                </div>
                {/* Create CTA: text left, button right. Card when user has no books; simple primary button otherwise */}
                <div className="flex justify-center items-start px-4 mb-4">
                    {myBooks.length === 0 ? (
                        <div className="w-full max-w-2xl bg-white border border-readowl-purple/10 shadow-md p-4 rounded-md text-readowl-purple">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div>
                                    <p className="font-ptserif text-lg mb-1">Nenhuma obra ainda?</p>
                                    <p className="font-ptserif">Comece a escrever sua primeira história!</p>
                                </div>
                                <Link href="/library/create" className="inline-block">
                                    <ButtonWithIcon variant="primary" icon={<BookPlus size={20} />}>Criar Minha Primeira Obra</ButtonWithIcon>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Link href="/library/create">
                            <ButtonWithIcon variant="primary" icon={<BookPlus size={20} />}>Criar uma obra</ButtonWithIcon>
                        </Link>
                    )}
                </div>
                <div className="pb-6 md:px-10 max-w-7xl mx-auto">
                    <BookCarousel
                        books={myBooks}
                        title="Minha Autoria!"
                        icon={<BookUser size={20} />}
                        itemsPerView={5}
                    />
                    {/* Followed carousel */}
                    <BookCarousel
                        books={followed}
                        title="Seguindo!"
                        icon={<BookMarked size={20} />}
                        itemsPerView={5}
                    />
                    {/* Search info card below followed: text left, button right */}
                    <div className="w-full max-w-7xl mx-auto mt-4 px-4">
                        <div className="bg-white border border-readowl-purple/10 shadow-md p-4 rounded-md text-readowl-purple">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div>
                                    <p className="font-ptserif text-lg mb-1">Quer encontrar mais histórias do seu gosto?</p>
                                    <p className="font-ptserif">Use a tela de pesquisa para acessar filtros personalizados e descobrir novas obras.</p>
                                </div>
                                <Link href="/search" className="inline-block">
                                    <ButtonWithIcon variant="secondary" icon={<BookMarked size={20} />}>Ir para pesquisa</ButtonWithIcon>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
