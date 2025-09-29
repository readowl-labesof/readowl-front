import React from 'react';
import Header from "../landing/components-landing/headerlLanding";
import Footer from "../../components/footer";

const PoliticaDePrivacidade: React.FC = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-readowl-purple-dark mb-6 text-center">
          Política de Privacidade
        </h1>
        <div className="max-w-4xl mx-auto text-gray-700 space-y-6">
          <p>
            A segurança do nosso projeto é uma prioridade. Agradecemos o esforço da comunidade em descobrir e relatar vulnerabilidades de forma responsável. Por favor, não reporte vulnerabilidades de segurança através de issues públicas no GitHub. Em vez disso, envie um e-mail para readowl25@gmail.com.
          </p>
          <p>
            No momento, apenas a versão mais recente na branch `main` está recebendo ativamente atualizações de segurança.
          </p>
          <p>
            Qualquer vulnerabilidade reportada será analisada de forma confidencial. Inclua o máximo de informações possível no seu relatório: tipo de vulnerabilidade, descrição detalhada do problema, passos para reproduzir e potencial impacto. Você receberá uma resposta em até 48 horas para confirmar o recebimento.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaDePrivacidade;