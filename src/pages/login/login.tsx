import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button";
import Footer from "../../components/footer";
import InputWithIcon from "../../components/ui/inputWithIcon";
import Modal from "../../components/ui/modal";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  async function loginon(e: React.FormEvent) {
    e.preventDefault();
    // Requisição para o json-server
    const res = await fetch(
      `http://localhost:3000/users?email=${email}&senha=${senha}`
    );
    const data = await res.json();
    if (data.length > 0) {
      // Login válido
      // Salva todos os usuários encontrados (caso o filtro retorne mais de um)
      localStorage.setItem("readowl-users", JSON.stringify(data));
      // Salva o primeiro usuário como logado (caso queira usar individualmente)
      localStorage.setItem("readowl-user", JSON.stringify(data[0]));
      alert("Login realizado com sucesso!");
      navigate("/home"); // ou para a página desejada
    } else {
      // Login inválido
      alert("Email ou senha incorretos!");
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex flex-1 items-center justify-center">
        <div className="bg-[#836DBE] p-10 rounded-xl shadow-lg w-full max-w-[480px] h-auto mt-16 flex flex-col items-center">
          <img
            src="/img/mascot/logo.png"
            alt="Readowl"
            className="h-16 w-auto"
          />
          <span className="mb-4 text-3xl font-bold text-white">Readowl</span>
          <form
            onSubmit={loginon}
            className="w-full flex flex-col flex-1 justify-between"
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-white"
              >
                Email
              </label>
              <InputWithIcon
                icon={
                  <span className="material-symbols-outlined text-[27px] leading-none">
                    person
                  </span>
                }
                type="email"
                id="email"
                placeholder="readowl@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-1">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-white"
              >
                Senha
              </label>
              <div className="relative">
                <InputWithIcon
                  icon={<span className="material-symbols-outlined">passkey</span>}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Senha"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            <hr className="w-full border-white my-2" />
            <div className="flex justify-between items-center w-full mb-4 text-white text-sm">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="w-4 h-4 mr-2" />
                <label htmlFor="remember">Lembrar de mim</label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="underline hover:text-gray-200 transition"
              >
                Esqueci minha senha
              </button>
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
          <span className="flex justify-center items-center text-xs text-white mt-2">
            Quero criar uma conta&nbsp;.
            <a href="/register" className="underline">
              Cadastrar
            </a>
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

      {/* Modal "Esqueci minha senha" */}
      <Modal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Recuperar Senha"
        widthClass="max-w-md"
      >
        <p className="text-sm text-gray-600 mb-4">
          Digite seu email para receber as instruções de recuperação de senha.
        </p>
        <input
          type="email"
          placeholder="Digite seu email"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-readowl-purple"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowForgotModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Cancelar
          </button>
          <Button className="px-6 py-2 bg-readowl-purple text-white rounded-lg hover:bg-readowl-purple/90 transition">
            Enviar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Login;


