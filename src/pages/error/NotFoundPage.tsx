import Footer from "../../components/footer";
import NavHome from "../home/navHome";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header>
        <NavHome />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center">
          <img
            src="/img/errors/404.png"
            alt="Ilustração de erro 404 - Página Não Encontrada"
            className="mx-auto"
            style={{ maxWidth: '600px', width: '100%' }}
          />
          <h2 className="text-2xl font-bold text-readowl-purple-dark mt-4">
            Página não encontrada, caso seja um equívoco, favor contate a administração.
          </h2>
        </div>
      </main>

      <Footer />
    </div>
  );
}