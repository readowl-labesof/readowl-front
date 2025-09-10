import React from 'react';


const Header: React.FC = () => {
  return (
    <header className="bg-readowl-purple-medium shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/img/mascot/logo.png" alt="Readowl Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-readowl-purple-extralight">Readowl</span>
        </div>
        <div> {/*Div do pesquisar*/}


        </div>

      </nav>
    </header>
  );
};

export default Header;