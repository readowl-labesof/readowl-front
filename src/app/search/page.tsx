"use client";
import Navbar from "@/components/ui/navbar/Navbar";
import { BreadcrumbAuto } from "@/components/ui/navbar/Breadcrumb";
import SearchResults from './ui/SearchResults';
import SearchFilters from './ui/SearchFilters';
import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Search() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login?callbackUrl=/home');
        }
    }, [status, router]);

    return (
        <>
            <Navbar />
            {/* Breadcrumb below navbar, centered */}
            <div className="w-full flex justify-center mt-14 sm:mt-16">
                <BreadcrumbAuto anchor="static" base="/home" labelMap={{ search: "Busca" }} />
            </div>
            <main className="min-h-screen flex flex-col">
                <Suspense fallback={<div className="text-white/70 px-3 sm:px-6 mt-6">Carregando…</div>}>
                    <SearchFilters />
                </Suspense>
                <Suspense fallback={<div className="text-white/70 px-3 sm:px-6 mt-6">Carregando…</div>}>
                    <SearchResults />
                </Suspense>
            </main>
        </>
    );
}