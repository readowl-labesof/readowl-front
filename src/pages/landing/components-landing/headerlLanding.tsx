import React from 'react';
import{ useNavigate} from "react-router-dom";



const Header: React.FC = () => {
    const route = useNavigate();

  return (
    <header className="bg-readowl-purple-medium shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/img/mascot/logo.png" alt="Readowl Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-readowl-purple-extralight">Readowl</span>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-readowl-purple-extralight">
          <a href="#" className="hover:text-white">Sobre</a>
          <a href="#" className="hover:text-white">Termos de uso</a>
          <a href="#" className="hover:text-white">Política de Privacidade</a>
          <a href="#" className="hover:text-white">Ajuda</a>
          <a href="#" className="hover:text-white">Contato</a>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={ () => route("/login")} className="bg-readowl-purple-light text-white font-semibold py-2 px-6 rounded-full border-4 border-readowl-purple hover:bg-readowl-purple transition-colors duration-300">
            Logar
            </button>
          <button  onClick={ () => route("/Cadastrar")}className="bg-readowl-purple-extralight text-readowl-purple font-semibold py-2 px-6 rounded-full border-4 border-readowl-purple hover:bg-readowl-purple hover:text-white transition-colors duration-300">
            Cadastrar
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;