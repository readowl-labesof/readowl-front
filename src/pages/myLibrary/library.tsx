import React, { useEffect, useState } from 'react';
import useUser from '../../hooks/useUser';
import { Link } from 'react-router-dom';
import NavLibrary from './navLibrary';
import Footer from '../../components/footer';
import ButtonWithIcon from '../../components/ui/buttonWithIcon';
const addPhotoIcon = '/img/svg/generics/add-photo.svg';
const authorIcon = '/img/svg/book/author.svg';
const personIcon = '/img/svg/auth/person.svg';

function Library() {
    const { user } = useUser();
    const [meusLivros, setMeusLivros] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function buscarLivros() {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/books?userId=${user.id}`);
            const livros = await res.json();
            setMeusLivros(livros);
        } catch (e) {
            setMeusLivros([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <NavLibrary />
            <main className="flex-grow container mx-auto p-6">
                {/* Botão de registar o livro" */}
                <div className="mt-8 flex justify-center">
                    <Link to="/create">
                        <ButtonWithIcon
                            iconUrl={addPhotoIcon}
                            iconAlt="Adicionar"
                            variant="primary"
                            isRounded
                            className="w-full text-center"
                        >
                            Registrar uma obra
                        </ButtonWithIcon>
                    </Link>
                </div>

                {/* Botão "Minha Autoria!" */}
                <div className="w-full mt-10 flex justify-center">
                    <button
                        onClick={() => {
                            setModalOpen(true);
                            buscarLivros();
                        }}
                        className="bg-readowl-purple-light text-white font-yusei py-3 px-6 rounded-full w-4/5 text-lg font-semibold flex items-center justify-start space-x-2 p-4"
                    >
                        <img src={authorIcon} alt="Ícone de autor" className="h-6 w-6" />
                        <span>Minha Autoria!</span>
                    </button>
                </div>

                {/* Modal simples para mostrar os livros */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
                        <div className="relative bg-white text-readowl-purple rounded shadow-xl w-full max-w-2xl mx-4 p-8">
                            <h2 className="text-2xl font-bold mb-4">Minhas Obras</h2>
                            {loading ? (
                                <p className="text-center">Carregando...</p>
                            ) : meusLivros.length === 0 ? (
                                <p className="text-center">Nenhum livro encontrado.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {meusLivros.map((livro: any) => (
                                        <li key={livro.id} className="border-b pb-2">
                                            <div className="flex items-center gap-4">
                                                <img src={livro.coverUrl} alt={livro.title} className="w-16 h-24 object-cover rounded" />
                                                <div>
                                                    <h3 className="font-semibold text-lg">{livro.title}</h3>
                                                    <p className="text-sm text-gray-700">{livro.synopsis}</p>
                                                    <span className="text-xs text-readowl-purple">Gêneros: {livro.gender}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-readowl-purple-light text-white rounded">Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botão "Seguidos" */}
                <div className="w-full mt-10 flex justify-center">
                    <button className="bg-readowl-purple-light text-white font-yusei py-3 px-6 rounded-full w-4/5 text-lg font-semibold flex items-center justify-start space-x-2 p-4">
                        <img src={personIcon} alt="Ícone de seguidos" className="h-6 w-6" />
                        <span>Seguidos!</span>
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Library;