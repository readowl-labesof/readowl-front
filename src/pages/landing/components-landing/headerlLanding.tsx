import React, { useState } from 'react';
import{ Link, useNavigate} from "react-router-dom";

const Header: React.FC = () => {
  const route = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-readowl-purple-medium shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/">
            <img src="/img/mascot/logo.png" alt="Readowl Logo" className="h-10 w-auto" />
          </Link>
          <span className="text-2xl font-bold text-readowl-purple-extralight">Readowl</span>
        </div>
        <div className="flex items-center space-x-6 text-readowl-purple-extralight">
          <Link to="/#sobre" className="hover:text-white">Sobre</Link>
          <Link to="/termos-de-uso" className="hover:text-white">Termos de uso</Link>
          <Link to="/politica-de-privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link to="/#ajuda" className="hover:text-white">Ajuda</Link>
          <Link to="/#contato" className="hover:text-white">Contato</Link>
        </div>
        <button
          className="md:hidden text-readowl-purple-extralight"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 mt-4 text-readowl-purple-extralight p-6">
          <button onClick={() => route("/login")} className="bg-readowl-purple-light text-white font-semibold py-2 px-6 rounded-full border-4 border-readowl-purple hover:bg-readowl-purple transition-colors duration-300">
            Logar
          </button>
          <button onClick={() => route("/register")} className="bg-readowl-purple-extralight text-readowl-purple font-semibold py-2 px-6 rounded-full border-4 border-readowl-purple hover:bg-readowl-purple hover:text-white transition-colors duration-300">
            Cadastrar
          </button>
          <a href="#" className="hover:text-white">Sobre</a>
          <a href="#" className="hover:text-white">Termos de uso</a>
          <a href="#" className="hover:text-white">Política de Privacidade</a>
          <a href="#" className="hover:text-white">Ajuda</a>
          <a href="#" className="hover:text-white">Contato</a>

        </div>
      )}
    </header>
  );
};

export default Header;