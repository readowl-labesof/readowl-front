import { useNavigate } from "react-router-dom";
import Button from "../../components/button";
import Footer from "../../components/footer";
import InputWithIcon from "../../components/InputWithIcon";
//import Teste from "../teste/teste.tsx";

function Login() {
  //foi usado o navigate para navegar entre as telas mas precisa chamar o endpoint do back para validar e direcionar o login
  const navigate = useNavigate();

  function loginon(e: React.FormEvent) {
    /* evita recarregar a pagina ao clicar em logar */e.preventDefault();
    navigate("");
  }
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex flex-1 items-center justify-center">
        <div className="bg-[#836DBE] p-10 rounded-xl shadow-lg w-[480px] h-[600px] mt-8 flex flex-col items-center">
          <img
            src="/img/mascot/logo.png"
            alt="Readowl"
            className="h-16 w-auto"
          />
          <span className="mb-4 text-3xl font-bold text-white">Readowl</span>
          <form className="w-full flex flex-col flex-1 justify-between">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-white"
              >
                Email
              </label>
              <InputWithIcon
                icon={<span className="material-symbols-outlined text-[27px] leading-none">person</span>}
                type="email"
                id="email"
                placeholder="readowl@gmail.com"
                required
              />
            </div>
            <div className="mt-1">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-white"
              >
                Senha
              </label>
              <InputWithIcon
              icon={<span className="material-symbols-outlined">passkey</span>}
              type="password"
              id="password"
              placeholder="Senha"
              required
              />
            </div>
            <hr className="w-full border-white my-2" />
            <div className="flex justify-between items-center w-full mb-4 text-white text-sm">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="w-4 h-4 mr-2" />
                <label htmlFor="remember">Lembrar de mim</label>
              </div>
              <a href="#" className="underline hover:text-gray-200 transition">
                Esqueci minha senha
              </a>
            </div>
            <div className="flex justify-center mt-4">
              <Button
                onClick={loginon}
                className="w-40 bg-readowl-purple-extralight text-black font-semibold rounded-full text-base py-1 mb-2 transition"
              >
                Logar
              </Button>
            </div>
          </form>
            <span className="flex justify-center items-center text-xs text-white mt-2">Quero criar uma conta&nbsp;. 
              <a href="/cadastrar" className="underline">Cadastrar</a>
            </span>
            <a
              href="/"
              className="block text-center text-xs text-white mt-2 underline"
            >
              Voltar 
            </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;


