import { Link } from "react-router-dom";
import InputWithIcon from "../../components/ui/inputWithIcon";

function NavbarUserList() {
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
                        icon={<img src="/img/svg/navbar/search.svg" alt="Pesquisar" className="h-5 w-5" />}
                            placeholder="Pesquisar..."
                            readOnly
                        />
                    </Link>
                </div>
              </nav>
            </header>
   );
}

export default NavbarUserList;