import React from 'react';
import Footer from '../../components/footer';

function Library() {
    return (
        <div className="flex flex-col min-h-screen">
        
            <main className="flex-grow container mx-auto p-6">
                <h1 className="text-3xl font-bold text-readowl-purple">Página da Biblioteca</h1>
                <p>Esta é a sua biblioteca de livros.</p>
            </main>
            <Footer />
        </div>
    );
}

export default Library;