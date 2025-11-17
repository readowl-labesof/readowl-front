"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { House, Bell, LibrarySquare, Search as SearchIcon, LogOut as LogOutIcon, User as UserIcon } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
// Modal removido pois não é mais usado diretamente

// NavLink removido pois não é mais usado

// Horizontal, sticky, auto-hide-on-scroll navbar
export default function FloatingNavbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const [hidden, setHidden] = useState(false); // visibility on scroll
    // useRef to avoid re-subscribing scroll handler and prevent flicker
    const lastYRef = useRef(0);
    // menuOpen e logoutOpen removidos pois não são mais usados
    const ticking = useRef(false);

    const [unread, setUnread] = useState<number>(0);
    // Nova ordem de botões à direita
    const rightLinks: Array<{ label: string; href: string; Icon: React.ElementType }> = [
        { label: 'Home', href: '/home', Icon: House },
        { label: 'Biblioteca', href: '/library', Icon: LibrarySquare },
        { label: 'Buscar', href: '/search', Icon: SearchIcon },
    ];

    useEffect(() => {
        let ignore = false;
        const load = async () => {
            try {
                const res = await fetch('/api/notifications/count', { cache: 'no-store' });
                const data = await res.json();
                if (!ignore && typeof data?.unread === 'number') setUnread(data.unread);
            } catch {}
        };
        load();
        // Refresh count when navigating to notifications page and returning
        const id = setInterval(load, 30000);
        return () => { ignore = true; clearInterval(id); };
    }, [pathname]);

    // Scroll hide / show logic
    useEffect(() => {
        const onScroll = () => {
            if (ticking.current) return;
            ticking.current = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                const last = lastYRef.current;
                const delta = y - last;
                // Show when near top always
                if (y < 80) {
                    if (hidden) setHidden(false);
                } else {
                    // Hysteresis thresholds to avoid flicker (larger than original)
                    if (delta > 12 && !hidden) setHidden(true);      // fast enough down
                    else if (delta < -12 && hidden) setHidden(false); // fast enough up
                }
                lastYRef.current = y;
                ticking.current = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [hidden]);

    const go = useCallback((href: string) => {
    router.push(href);
    }, [router]);

    // Hover apenas no texto
    const activeClass = 'text-white font-semibold';

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-out bg-readowl-purple-medium/95 backdrop-blur-md border-b border-readowl-purple-light/40 overflow-x-hidden ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="mx-auto max-w-7xl pl-2 pr-3 sm:px-6">
                    <div className="flex h-14 sm:h-16 items-center justify-between">
                        {/* Esquerda: Logo + nome */}
                        <div className="flex items-center gap-2 select-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/img/mascot/logo.png" alt="Logo" className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow" />
                            <span className="hidden md:inline text-white font-poppins font-bold pt-1 tracking-wide text-2xl sm:text-2xl">Readowl</span>
                        </div>

                        {/* Direita: botões Home, Biblioteca, Buscar, Notificações, Perfil, Logout */}
                        <div className="flex items-center gap-2 md:gap-4">
                            {rightLinks.map(({ label, href, Icon }) => (
                                <button
                                    key={href}
                                    onClick={() => go(href)}
                                    className={`relative flex items-center gap-1 px-2 text-white/90 group`}
                                    aria-label={label}
                                >
                                    <Icon className={`w-5 h-5 transition-colors ${pathname?.startsWith(href) ? 'text-white' : 'text-readowl-purple-extralight/80 group-hover:text-white'}`} />
                                    <span className={`hidden md:inline transition-colors ${pathname?.startsWith(href) ? activeClass : 'text-readowl-purple-extralight/80 group-hover:text-white'}`}>{label}</span>
                                </button>
                            ))}
                            {/* Notificações com badge */}
                            <button onClick={() => go('/notifications')} className="relative flex items-center justify-center w-9 h-9 text-white/90 group" aria-label="Notificações">
                                <Bell className={`w-5 h-5 transition-colors ${pathname?.startsWith('/notifications') ? 'text-white' : 'text-readowl-purple-extralight/80 group-hover:text-white'}`} />
                                {unread > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] min-w-[16px] h-[16px] px-1 rounded-full bg-readowl-purple-dark text-white">{unread > 99 ? '99+' : unread}</span>
                                )}
                            </button>
                            {/* Avatar */}
                            <button onClick={() => go('/user')} className="relative ring-2 ring-transparent hover:ring-readowl-purple-light/60 focus:outline-none focus-visible:ring-readowl-purple-light/80 transition group" aria-label="Perfil">
                                {session?.user?.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={session.user.image} alt="Perfil" className="w-9 h-9 object-cover rounded-full" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white">
                                        <UserIcon className="w-5 h-5 transition-colors text-readowl-purple-extralight/80 group-hover:text-white" />
                                    </div>
                                )}
                            </button>
                            {/* Logout */}
                            <button onClick={() => signOut({ callbackUrl: '/landing' })} className="flex items-center justify-center w-9 h-9 text-readowl-purple-extralight/80 transition-colors group" aria-label="Sair">
                                <LogOutIcon className="w-5 h-5 transition-colors text-readowl-purple-extralight/80 group-hover:text-white" />
                            </button>
                        </div>
                    </div>
                </div>
                {/* ...existing code... (mobile menu, modal) */}
                {/* Mobile menu panel e Modal permanecem iguais */}
                {/* ...existing code... */}
            </header>
            {/* ...existing code... */}
        </>
    );
}