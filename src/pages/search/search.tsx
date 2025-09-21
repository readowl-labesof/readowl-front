import React from 'react';
import Footer from '../../components/footer';

function Search() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto p-6">
                <h1 className="text-3xl font-bold text-readowl-purple">Página de Pesquisa</h1>
                <p>Esta é a página para exibir os resultados da busca.</p>
            </main>
            <Footer />
        </div>
    );
}

export default Search;