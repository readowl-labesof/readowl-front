import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const route = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-readowl-purple-medium shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between" aria-label="Main navigation">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/img/mascot/logo.png" alt="Readowl" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-readowl-purple-extralight">Readowl</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-readowl-purple-extralight">
          <Link to="/#sobre" className="hover:text-white">Sobre</Link>
          <Link to="/termos-de-uso" className="hover:text-white">Termos de uso</Link>
          <Link to="/politica-de-privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link to="/#ajuda" className="hover:text-white">Ajuda</Link>
          <Link to="/#contato" className="hover:text-white">Contato</Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => route('/login')}
            className="bg-readowl-purple-extralight text-readowl-purple font-semibold py-2 px-5 rounded-full border border-readowl-purple hover:bg-readowl-purple hover:text-white transition-colors"
          >
            Logar
          </button>
          <button
            onClick={() => route('/register')}
            className="bg-readowl-purple-light text-white font-semibold py-2 px-5 rounded-full border border-readowl-purple hover:bg-readowl-purple transition-colors"
          >
            Cadastrar
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-readowl-purple-extralight hover:text-white hover:bg-readowl-purple/20 focus:outline-none focus:ring-2 focus:ring-white"
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label="Abrir menu"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </nav>

      {/* Mobile Panel */}
      <div
        id="mobile-menu"
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-white/20 bg-readowl-purple-medium`}
      >
        <div className="container mx-auto px-6 py-4 flex flex-col gap-4 text-readowl-purple-extralight">
          <Link onClick={() => setIsMenuOpen(false)} to="/#sobre" className="hover:text-white">Sobre</Link>
          <Link onClick={() => setIsMenuOpen(false)} to="/termos-de-uso" className="hover:text-white">Termos de uso</Link>
          <Link onClick={() => setIsMenuOpen(false)} to="/politica-de-privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link onClick={() => setIsMenuOpen(false)} to="/#ajuda" className="hover:text-white">Ajuda</Link>
          <Link onClick={() => setIsMenuOpen(false)} to="/#contato" className="hover:text-white">Contato</Link>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => { setIsMenuOpen(false); route('/login'); }}
              className="bg-readowl-purple-extralight text-readowl-purple font-semibold py-2 px-5 rounded-full border border-readowl-purple hover:bg-readowl-purple hover:text-white transition-colors"
            >
              Logar
            </button>
            <button
              onClick={() => { setIsMenuOpen(false); route('/register'); }}
              className="bg-readowl-purple-light text-white font-semibold py-2 px-5 rounded-full border border-readowl-purple hover:bg-readowl-purple transition-colors"
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;