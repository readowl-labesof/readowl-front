import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-readowl-purple-extralight py-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
          <img src="/img/mascot/body.png" alt="Mascote Readowl" className="w-64 h-auto" />
        </div>

        <div className="md:w-1/2 text-center md:text-left">
          <h5 className="text-4xl md:text-5xl font-medium text-readowl-purple-dark">
            Seja bem-vindo ao <br />
          </h5>
            <h1
            className="text-5xl md:text-8xl font-black text-readowl-purple-dark"
            style={{ fontFamily: "'Poppins', sans-serif" }}
            >
            <strong>Readowl</strong>
            </h1>
          <p className="mt-4 text-lg text-gray-600 italic">
            “Cultivando literatura em qualquer lugar.”
          </p>
            <p className="mt-6 text-gray-700">
            Democratizando a cultura, o Readowl torna a leitura e a escrita acessíveis a todos: autores podem publicar gratuitamente suas obras e leitores têm a chance de explorar novos universos. Junte-se a uma comunidade dedicada a valorizar a literatura do Brasil!
            </p>
          <div className="mt-8 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <button className="bg-readowl-purple-light text-white font-semibold py-3 px-8 rounded-full border-4 border-readowl-purple hover:bg-readowl-purple transition-colors duration-300">
              Iniciar leitura
            </button>
            <button className="bg-readowl-purple-light text-white font-semibold py-3 px-8 rounded-full border-4 border-readowl-purple hover:bg-readowl-purple transition-colors duration-300">
              Criar uma nova obra
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;