import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/navbar/Navbar";
import { Breadcrumb } from "@/components/ui/navbar/Breadcrumb";
import prisma from "@/lib/prisma";
import BannerCarousel from "@/components/book/BannerCarousel";
import BookCarousel, { type CarouselBook } from "@/components/book/BookCarousel";
import TrendingHelpCarousel from "@/components/book/TrendingHelpCarousel";
import LatestReleasesTable from '@/components/book/LatestReleasesTable';
import { AppRole } from "@/types/user";
import {
    Sparkles,
    Medal,
    Eye,
    MessageSquare,
    Users,
    Wand2,
} from "lucide-react";


export default async function Home() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login?callbackUrl=/home");

    // Fetch banners server-side to hydrate the client carousel
    const banners = await prisma.banner.findMany({
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        select: { name: true, imageUrl: true, linkUrl: true },
    });
    const isAdmin = session.user?.role === AppRole.ADMIN;

        // Helper to map to BookCarousel shape
    const toCarousel = (b: { id: string; slug?: string | null; title: string; coverUrl: string | null }): CarouselBook => ({ id: b.id, title: b.title, coverUrl: b.coverUrl, slug: b.slug ?? undefined });

        const LIMIT = 16; // max items per highlight

        // Novidades: books published/updated in the last 30 days
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const novidadesRaw = await prisma.book.findMany({
          where: {
            OR: [
              { createdAt: { gte: last30Days } },
              { updatedAt: { gte: last30Days } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: LIMIT,
          select: { id: true, slug: true, title: true, coverUrl: true },
        });
        const novidades = novidadesRaw.map(toCarousel);

        // Em destaque: normalize metrics, exclude author interactions, apply truncation
                const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                // Views: unique users in last 14 days per book
                const viewsAgg = await prisma.$queryRaw<Array<{ bookId: string; views: bigint }>>`
                    SELECT c."bookId" as "bookId", COUNT(DISTINCT v."userId")::bigint as views
                    FROM "ChapterView" v
                    JOIN "Chapter" c ON v."chapterId" = c."id"
                    WHERE v."createdAt" >= ${cutoff}
                    GROUP BY c."bookId";
                `;
                // Ratings: last 14 days, exclude ratings by the book author
                const ratingsAgg = await prisma.$queryRaw<Array<{ bookId: string; ratings: bigint; avg: number }>>`
                    SELECT br."bookId" as "bookId", COUNT(*)::bigint as ratings, AVG(br."score")::float as avg
                    FROM "BookRating" br
                    JOIN "Book" b ON b."id" = br."bookId"
                    WHERE br."createdAt" >= ${cutoff} AND br."userId" <> b."authorId"
                    GROUP BY br."bookId";
                `;
                // Comments: last 14 days, exclude comments by the book author
                const commentsAgg = await prisma.$queryRaw<Array<{ bookId: string; comments: bigint }>>`
                    SELECT c."bookId" as "bookId", COUNT(*)::bigint as comments
                    FROM "Comment" c
                    JOIN "Book" b ON b."id" = c."bookId"
                    WHERE c."createdAt" >= ${cutoff} AND c."userId" <> b."authorId"
                    GROUP BY c."bookId";
                `;
                // Normalize and truncate metrics per spec
                const normalize = (value: number, min: number, max: number) => (max > min ? (value - min) / (max - min) : 0);
                const percentile = (values: number[], p: number) => {
                    if (values.length === 0) return 0;
                    const sorted = [...values].sort((a, b) => a - b);
                    const idx = Math.floor((p / 100) * (sorted.length - 1));
                    return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
                };
                const viewRaw = viewsAgg.map(v => Number(v.views));
                const ratingRaw = ratingsAgg.map(r => Number(r.ratings) * r.avg);
                const commentRaw = commentsAgg.map(c => Number(c.comments));
                const viewCap = percentile(viewRaw, 98);
                const ratingCap = percentile(ratingRaw, 95);
                const commentCap = percentile(commentRaw, 95);
                const viewMin = viewRaw.length ? Math.min(...viewRaw) : 0;
                const ratingMin = ratingRaw.length ? Math.min(...ratingRaw) : 0;
                const commentMin = commentRaw.length ? Math.min(...commentRaw) : 0;

                const vMap = new Map<string, number>();
                for (const v of viewsAgg) {
                    const raw = Math.min(Number(v.views), viewCap || Number(v.views));
                    vMap.set(v.bookId, normalize(raw, viewMin, viewCap || raw));
                }
                const rMap = new Map<string, number>();
                for (const r of ratingsAgg) {
                    const raw = Math.min(Number(r.ratings) * r.avg, ratingCap || Number(r.ratings) * r.avg);
                    rMap.set(r.bookId, normalize(raw, ratingMin, ratingCap || raw));
                }
                const cMap = new Map<string, number>();
                for (const c of commentsAgg) {
                    const raw = Math.min(Number(c.comments), commentCap || Number(c.comments));
                    cMap.set(c.bookId, normalize(raw, commentMin, commentCap || raw));
                }
        const candidateIds = new Set([...vMap.keys(), ...rMap.keys(), ...cMap.keys()]);
        const weights = { views: 0.2, ratings: 0.45, comments: 0.35 };
        const trendingScores = Array.from(candidateIds).map(id => {
          const score = (vMap.get(id) || 0) * weights.views + (rMap.get(id) || 0) * weights.ratings + (cMap.get(id) || 0) * weights.comments;
          return { bookId: id, score };
        }).sort((a, b) => b.score - a.score).slice(0, LIMIT);
            const trendingBooksRaw = await prisma.book.findMany({
            where: { id: { in: trendingScores.map(s => s.bookId) } },
            select: { id: true, slug: true, title: true, coverUrl: true },
        });
        // Preserve order by score
            const trendingMap = new Map<string, { id: string; title: string; coverUrl: string | null }>(trendingBooksRaw.map(b => [b.id, b]));
                let trending = trendingScores
                                .map(s => trendingMap.get(s.bookId))
                                .filter((b): b is { id: string; title: string; coverUrl: string | null } => Boolean(b))
                                .map(b => toCarousel(b!));
                if (trending.length < LIMIT) {
                    const exclude = trending.map(b => b.id);
                    const fill = await prisma.book.findMany({
                        where: { id: { notIn: exclude } },
                        orderBy: { createdAt: 'asc' },
                        take: LIMIT - trending.length,
                        select: { id: true, slug: true, title: true, coverUrl: true },
                    });
                    trending = trending.concat(fill.map(toCarousel));
                }

                // Mais avaliados (all-time): Bayesian average combining ratingAvg and ratingCount
                // score = (v/(v+m)) * R + (m/(v+m)) * C, with C=3.5 (prior mean), m=8 (prior weight)
                const candidatesRated = await prisma.book.findMany({
                    orderBy: [{ ratingCount: 'desc' }, { ratingAvg: 'desc' }],
                    take: 200,
                    select: { id: true, slug: true, title: true, coverUrl: true, ratingAvg: true, ratingCount: true, createdAt: true },
                });
                const PRIOR_MEAN = 3.5;
                const PRIOR_WEIGHT = 8;
                const rankedRated = candidatesRated
                    .map(b => {
                        const v = Math.max(0, b.ratingCount || 0);
                        const R = Math.max(0, Math.min(5, b.ratingAvg || 0));
                        const score = (v / (v + PRIOR_WEIGHT)) * R + (PRIOR_WEIGHT / (v + PRIOR_WEIGHT)) * PRIOR_MEAN;
                        return { book: b, score };
                    })
                    .sort((a, b) => b.score - a.score)
                    .slice(0, LIMIT);
                let maisAvaliados = rankedRated.map(r => toCarousel(r.book));
                if (maisAvaliados.length < LIMIT) {
                    const exclude = maisAvaliados.map(b => b.id);
                    const fill = await prisma.book.findMany({
                        where: { id: { notIn: exclude } },
                        orderBy: { createdAt: 'asc' },
                        take: LIMIT - maisAvaliados.length,
                        select: { id: true, slug: true, title: true, coverUrl: true },
                    });
                    maisAvaliados = maisAvaliados.concat(fill.map(toCarousel));
                }

        // Mais visualizados (all-time): use denormalized Book.totalViews
        const mvAll = await prisma.book.findMany({
            orderBy: { totalViews: 'desc' },
            take: LIMIT,
            select: { id: true, slug: true, title: true, coverUrl: true },
        });
        let maisVisualizados = mvAll.map(toCarousel);
        if (maisVisualizados.length < LIMIT) {
            const exclude = maisVisualizados.map(b => b.id);
            const fill = await prisma.book.findMany({
                where: { id: { notIn: exclude } },
                orderBy: { createdAt: 'asc' },
                take: LIMIT - maisVisualizados.length,
                select: { id: true, slug: true, title: true, coverUrl: true },
            });
            maisVisualizados = maisVisualizados.concat(fill.map(toCarousel));
        }

                // Mais comentados (all-time, exclui autor). Counts both book and chapter comments via Comment.bookId
                const commentsAll = await prisma.$queryRaw<Array<{ bookId: string; cnt: bigint }>>`
                    SELECT c."bookId" as "bookId", COUNT(*)::bigint as cnt
                    FROM "Comment" c
                    JOIN "Book" b ON b."id" = c."bookId"
                    WHERE c."userId" <> b."authorId"
                    GROUP BY c."bookId"
                    ORDER BY cnt DESC
                    LIMIT ${LIMIT};
                `;
    const mostCommentedRaw = await prisma.book.findMany({ where: { id: { in: commentsAll.map(x => x.bookId) } }, select: { id: true, slug: true, title: true, coverUrl: true } });
            const mcMap = new Map<string, { id: string; title: string; coverUrl: string | null }>(mostCommentedRaw.map(b => [b.id, b]));
                        let maisComentados = commentsAll
                                .map(x => mcMap.get(x.bookId))
                                .filter((b): b is { id: string; title: string; coverUrl: string | null } => Boolean(b))
                                .map(b => toCarousel(b!));
                        if (maisComentados.length < LIMIT) {
                            const exclude = maisComentados.map(b => b.id);
                            const fill = await prisma.book.findMany({
                                where: { id: { notIn: exclude } },
                                orderBy: { createdAt: 'asc' },
                                take: LIMIT - maisComentados.length,
                                select: { id: true, slug: true, title: true, coverUrl: true },
                            });
                            maisComentados = maisComentados.concat(fill.map(toCarousel));
                        }

                // Mais seguidos (all-time) removed from UI for now; keep query commented for future use
        // Mais seguidos (all-time) with fallback to fill by createdAt ASC
        const followsAll = await prisma.$queryRaw<Array<{ bookId: string; cnt: bigint }>>`
            SELECT "bookId", COUNT(*)::bigint as cnt FROM "BookFollow" GROUP BY "bookId" ORDER BY cnt DESC LIMIT ${LIMIT};
        `;
        const mostFollowedRaw = await prisma.book.findMany({ where: { id: { in: followsAll.map(x => x.bookId) } }, select: { id: true, slug: true, title: true, coverUrl: true } });
        const mfMap = new Map<string, { id: string; slug?: string | null; title: string; coverUrl: string | null }>(mostFollowedRaw.map(b => [b.id, b]));
        let maisSeguidos = followsAll
            .map(x => mfMap.get(x.bookId))
            .filter((b): b is { id: string; slug?: string | null; title: string; coverUrl: string | null } => Boolean(b))
            .map(b => toCarousel(b!));
        if (maisSeguidos.length < LIMIT) {
            const exclude = maisSeguidos.map(b => b.id);
            const fill = await prisma.book.findMany({
                where: { id: { notIn: exclude } },
                orderBy: { createdAt: 'asc' },
                take: LIMIT - maisSeguidos.length,
                select: { id: true, slug: true, title: true, coverUrl: true },
            });
            maisSeguidos = maisSeguidos.concat(fill.map(toCarousel));
        }

        // Quem sabe você goste: aleatórios
        const randomIds = await prisma.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM "Book" ORDER BY random() LIMIT ${LIMIT};
        `;
    const randomRaw = await prisma.book.findMany({ where: { id: { in: randomIds.map(x => x.id) } }, select: { id: true, slug: true, title: true, coverUrl: true } });
        // Shuffle to ensure random order on every request
        const shuffled = [...randomRaw].sort(() => Math.random() - 0.5);
        const quemSabe = shuffled.map(toCarousel);

    return (
        <>
            <Navbar />
            {/* Breadcrumb below navbar, centered (offset for fixed header) */}
            <div className="w-full flex justify-center mt-14 sm:mt-16">
                <Breadcrumb items={[]} showHome anchor="static" />
            </div>
            <main className="min-h-screen flex flex-col gap-10">
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
                    <BannerCarousel initialBanners={banners} isAdmin={isAdmin} />
                </div>
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
                    <BookCarousel title="Novidades!" icon={<Sparkles size={18} />} books={novidades} itemsPerView={6} />
                </div>
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
                    <TrendingHelpCarousel books={trending} itemsPerView={6} />
                </div>
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
                    <BookCarousel title="Mais avaliados!" icon={<Medal size={18} />} books={maisAvaliados} itemsPerView={6} />
                </div>
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
                    <BookCarousel title="Mais visualizados!" icon={<Eye size={18} />} books={maisVisualizados} itemsPerView={6} />
                </div>
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
                    <BookCarousel title="Mais comentados!" icon={<MessageSquare size={18} />} books={maisComentados} itemsPerView={6} />
                </div>
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
                    <BookCarousel title="Mais seguidos!" icon={<Users size={18} />} books={maisSeguidos} itemsPerView={6} />
                </div>
                <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 pb-8">
                    <BookCarousel title="Quem sabe você goste!" icon={<Wand2 size={18} />} books={quemSabe} itemsPerView={6} />
                </div>
                {/* Latest releases table */}
                <LatestReleasesTable />
            </main>
        </>
    );
}