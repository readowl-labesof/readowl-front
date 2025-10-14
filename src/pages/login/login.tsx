import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button";
import Footer from "../../components/footer";
import InputWithIcon from "../../components/ui/inputWithIcon";
import { Icon } from "../../components/ui/Icon";
import { useState } from "react";
import { api } from "../../lib/api";
import { GoogleLoginButton } from "../../components/auth/GoogleLoginButton";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function loginon(e: React.FormEvent) {
    e.preventDefault();
    const remember = (document.getElementById('remember') as HTMLInputElement)?.checked
    try {
      const { token, user } = await api.login(email, senha, remember)
      // Persistir token conforme remember-me
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('readowl-token', token)
      storage.setItem('readowl-user', JSON.stringify(user))
      alert('Login realizado com sucesso!')
      navigate('/home')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no login'
      alert(msg)
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
                icon={<Icon name="User" size={27} className="leading-none text-gray-500" />}
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
              <InputWithIcon
                icon={<Icon name="KeyRound" size={30} className="text-gray-500" />}
                type="password"
                id="password"
                placeholder="Senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <hr className="w-full border-white my-2" />
            <div className="flex justify-between items-center w-full mb-4 text-white text-sm">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="w-4 h-4 mr-2" />
                <label htmlFor="remember">Lembrar de mim</label>
              </div>
              <a href="/forgot-password" className="underline hover:text-gray-200 transition">
                Esqueci minha senha
              </a>
            </div>
            <div className="flex flex-col gap-3 justify-center mt-4">
              <Button
                onClick={loginon}
                className="w-40 bg-readowl-purple-extralight text-black font-semibold rounded-full text-base py-1 mb-2 transition"
              >
                Logar
              </Button>
              <GoogleLoginButton />
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
    </div>
  );
}

export default Login;
