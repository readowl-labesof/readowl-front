import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { default as searchIcon } from '../../../public/img/svg/navbar/search.svg';
import { default as accountBoxIcon } from '../../../public/img/svg/navbar/account-box.svg';
import { default as logoutIcon } from '../../../public/img/svg/navbar/logout.svg';
import InputWithIcon from '../../components/ui/inputWithIcon';

const NavLibrary: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Lógica de logout
        console.log('Usuário deslogado!');
        navigate('/login');
    };

    return (
        <header className="bg-readowl-purple-medium shadow-sm">
            <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* Ícone de Home e Logo */}
                <div className="flex items-center space-x-4">
                    <Link to="/home" className="flex items-center text-readowl-purple-extralight hover:text-white transition-colors">
                        <img src="/img/mascot/logo.png" alt="Readowl Logo" className="h-10 w-auto" />
                    </Link>
                    <span className="text-2xl font-bold text-readowl-purple-extralight">Readowl</span>
                </div>

                {/* Barra de Pesquisa */}
                <div className="flex-1 max-w-lg mx-8">
                    <Link to="/search">
                        <InputWithIcon
                            icon={<img src={searchIcon} alt="Pesquisar" className="h-5 w-5" />}
                            placeholder="Pesquisar..."
                            readOnly
                        />
                    </Link>
                </div>

                {/* Ícones de Usuário e Sair */}
                <div className="flex items-center space-x-4">
                    {/* Ícone de Usuário */}
                    <Link to="/profile" className="text-readowl-purple-extralight hover:text-white transition-colors">
                        <img src={accountBoxIcon} alt="Editar usuário" className="h-6 w-6" />
                    </Link>
                    
                    {/* Ícone de Sair */}
                    <button onClick={handleLogout} className="text-readowl-purple-extralight hover:text-white transition-colors">
                        <img src={logoutIcon} alt="Sair" className="h-6 w-6" />
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default NavLibrary;