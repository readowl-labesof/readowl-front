import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { default as searchIcon } from '../../../public/img/svg/navbar/search.svg';
import { default as notificationIcon } from '../../../public/img/svg/navbar/notification.svg';
import { default as bookIcon } from '../../../public/img/svg/navbar/book1.svg';
import { default as accountBoxIcon } from '../../../public/img/svg/navbar/account-box.svg';
import { default as logoutIcon } from '../../../public/img/svg/navbar/logout.svg';
import InputWithIcon from '../../components/ui/inputWithIcon';

const NavHome: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Lógica para fazer logout, como limpar tokens e estado de autenticação
        console.log('Usuário deslogado!');
        navigate('/login'); // Redireciona para a tela de login
    };

    return (
        <header className="bg-readowl-purple-medium shadow-sm">
            <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo e Nome */}
                <div className="flex items-center space-x-2">
                    <img src="/img/mascot/logo.png" alt="Readowl Logo" className="h-10 w-auto" />
                    <span className="text-2xl font-bold text-readowl-purple-extralight">Readowl</span>
                </div>

                {/* Barra de Pesquisa */}
                <div className="flex-1 max-w-lg mx-8">
                    <Link to="/search">
                        <InputWithIcon
                            icon={<img src={searchIcon} alt="Pesquisar" className="h-5 w-5" />}
                            placeholder="Pesquisar..."
                            readOnly // Impede que o usuário digite, já que o clique redireciona
                        />
                    </Link>
                </div>

                {/* Ícones de Navegação e Usuário */}
                <div className="flex items-center space-x-6">
                    <Link to="/library" className="flex items-center text-readowl-purple-extralight hover:text-white transition-colors">
                        <img src={bookIcon} alt="Biblioteca" className="h-6 w-6" />
                        <span className="ml-1">Biblioteca</span>
                    </Link>
                    <Link to="/notifications" className="flex items-center text-readowl-purple-extralight hover:text-white transition-colors">
                        <img src={notificationIcon} alt="Notificações" className="h-6 w-6" />
                        <span className="ml-1">Notificações</span>
                    </Link>
                    
                    <div className="flex items-center space-x-4">
                        {/* Ícone de Usuário (Editar) */}
                        <Link to="/profile" className="text-readowl-purple-extralight hover:text-white transition-colors">
                            <img src={accountBoxIcon} alt="Editar usuário" className="h-6 w-6" />
                        </Link>
                        
                        {/* Ícone de Sair */}
                        <button onClick={handleLogout} className="text-readowl-purple-extralight hover:text-white transition-colors">
                            <img src={logoutIcon} alt="Sair" className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default NavHome;