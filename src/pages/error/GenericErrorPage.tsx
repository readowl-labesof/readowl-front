import Footer from "../../components/footer";
import NavHome from "../home/navHome";

export default function GenericErrorPage() {
  return (
    // Adicione a classe bg-white aqui
    <div className="flex flex-col min-h-screen bg-white">
      <header>
        <NavHome />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center">
          <img
            src="/img/errors/erro.png"
            alt="Ilustração de erro"
            className="mx-auto"
            style={{ maxWidth: '600px', width: '100%' }}
          />
          <h2 className="text-2xl font-bold text-readowl-purple-dark mt-4">
            Um erro inesperado ocorreu, caso persista, favor contate a administração
          </h2>
        </div>
      </main>

      <Footer />
    </div>
  );
}