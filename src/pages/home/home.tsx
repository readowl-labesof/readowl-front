import React from 'react';
import NavHome from './navHome';
import Footer from '../../components/footer';

function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <NavHome />
            <main className="flex-grow container mx-auto p-6">
                <h1 className="text-3xl font-bold text-readowl-purple">Bem-vindo à Home!</h1>
                {/* Aqui você pode adicionar o resto do conteúdo da página Home */}
            </main>
            <Footer />
        </div>
    );
}

export default Home;