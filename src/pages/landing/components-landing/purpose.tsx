import React from 'react';

const Purpose: React.FC = () => {
  return (
    <section id="sobre" className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-readowl-purple-dark mb-12">
          Sobre Nós
        </h2>
        <div className="max-w-3xl mx-auto text-left space-y-8">
          <p className="text-gray-600">
            O Readowl é uma plataforma de publicação e leitura de livros com o objetivo de fomentar a literatura amadora no Brasil, desenvolvida por estudantes de ADS no IFTM Uberaba. Nosso propósito é aproximar leitores de escritores iniciantes, ampliando a visibilidade de suas obras e fortalecendo o cenário literário nacional.
          </p>
          <p className="text-gray-600">
            A plataforma nasceu da necessidade de criar um espaço onde autores iniciantes possam publicar suas obras gratuitamente e receber feedback, resolvendo problemas comuns em outros sistemas como divulgação ineficiente e interfaces confusas.
          </p>
          <p className="text-gray-600">
            Com o Readowl, esperamos contribuir para a formação de futuros escritores profissionais e aumentar o interesse pela leitura no país, oferecendo uma experiência intuitiva e completa para todos os usuários.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Purpose;