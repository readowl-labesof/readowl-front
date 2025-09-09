import React from 'react';
import Header from "../../pages/landing/components-landing/headerlLanding";
import Footer from "../../components/footer";
import { Link } from "react-router-dom";

const TermosDeUso: React.FC = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-readowl-purple-dark mb-6 text-center">
          Termos de Uso
        </h1>
        <div className="max-w-4xl mx-auto text-gray-700 space-y-6">
          <p>
            O Readowl é um software proprietário e confidencial. A cópia, distribuição, modificação ou uso não autorizado, no todo ou em parte, é estritamente proibida, a menos que expressamente permitido pelos autores.
          </p>
          <p>
            É concedida permissão, gratuitamente, a qualquer pessoa que obtenha uma cópia deste software e arquivos de documentação associados (o "Software"), para usar o Software exclusivamente para fins de avaliação e desenvolvimento internos, sujeito às seguintes condições: O aviso de direitos autorais acima e este aviso de permissão devem ser incluídos em todas as cópias ou partes substanciais do Software.
          </p>
          <p>
            O SOFTWARE É FORNECIDO "AS IS", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO A, GARANTIAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM FIM ESPECÍFICO E NÃO VIOLAÇÃO. EM NENHUM CASO OS AUTORES OU DETENTORES DOS DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER RECLAMAÇÃO, DANOS OU OUTRAS RESPONSABILIDADES, SEJA EM UMA AÇÃO DE CONTRATO, DELITO OU DE OUTRA FORMA, DECORRENTE DE, OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTRAS NEGOCIAÇÕES NO SOFTWARE.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosDeUso;