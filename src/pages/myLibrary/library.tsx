import React from 'react';
import { Link } from 'react-router-dom';
import NavLibrary from './navLibrary';
import Footer from '../../components/footer';
import ButtonWithIcon from '../../components/ui/buttonWithIcon';
import { default as addPhotoIcon } from '../../../public/img/svg/generics/add-photo.svg';
import { default as authorIcon } from '../../../public/img/svg/book/author.svg';
import { default as personIcon } from '../../../public/img/svg/auth/person.svg';

function Library() {
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
                    <button className="bg-readowl-purple-light text-white font-yusei py-3 px-6 rounded-full w-4/5 text-lg font-semibold flex items-center justify-start space-x-2 p-4">
                        <img src={authorIcon} alt="Ícone de autor" className="h-6 w-6" />
                        <span>Minha Autoria!</span>
                    </button>
                </div>

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