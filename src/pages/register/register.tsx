import { useState } from "react";
import Button from "../../components/ui/button";
import Footer from "../../components/footer";
import InputWithIcon from "../../components/ui/inputWithIcon";
import { Icon } from "../../components/ui/Icon";
import { useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { GoogleLoginButton } from "../../components/auth/GoogleLoginButton";

function Cadastrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [checkSenha, setCheckSenha] = useState("");
  const navigation = useNavigate();
  const { saveUser } = useUser(); // Adicionar hook para salvar usuário

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (senha !== checkSenha) {
      alert("As senhas não conferem!");
      return;
    }
    try {
      const { token, user } = await api.register({ nome, email, senha })
      // lembrarme
      const remember = (document.getElementById('remember') as HTMLInputElement)?.checked
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('readowl-token', token)
      storage.setItem('readowl-user', JSON.stringify(user))
      saveUser(user)
      alert('Cadastro realizado!')
      navigation('/home')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar'
      alert(msg)
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex flex-1 items-center justify-center">
        <div className="bg-[#836DBE] p-8 rounded-xl shadow-lg w-[500px] h-[650px] mt-8 flex flex-col items-center">
          <img
            src="/img/mascot/logo.png"
            alt="Readowl"
            className="h-10 w-auto"
          />
          <span className="mb-4 text-xl font-bold text-white">Readowl</span>
          <form
            className="w-full flex flex-col flex-1 justify-between gap-y-0.5"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="nome"
                className="block mb-1 text-sm font-medium text-white"
              >
                Nome
              </label>
              <InputWithIcon
                icon={<Icon name="User" size={30} className="text-gray-500" />}
                type="text"
                id="nome"
                placeholder="Seu nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-white"
              >
                Email
              </label>
              <InputWithIcon
                icon={<Icon name="Mail" size={30} className="text-gray-500" />}
                type="email"
                id="email"
                placeholder="readowl@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-white"
              >
                Senha
              </label>
              <InputWithIcon
                icon={<Icon name="Key" size={30} className="text-gray-500" />}
                type="password"
                id="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="Check-password"
                className="block mb-1 text-sm font-medium text-white"
              >
                Confirmar senha
              </label>
              <InputWithIcon
                icon={<Icon name="KeyRound" size={30} className="text-gray-500" />}
                type="password"
                id="Check-password"
                required
                value={checkSenha}
                onChange={(e) => setCheckSenha(e.target.value)}
              />
            </div>
            <hr className="w-full border-white my-4" />
            <div className="flex justify-between items-center w-full mb-4 text-white text-sm">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="w-4 h-4 mr-2" />
                <label htmlFor="remember">Lembrar de mim</label>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <Button className="w-40 bg-readowl-purple-extralight text-black font-semibold rounded-full text-base py-1 mb-2 transition mx-auto">
                Cadastrar
              </Button>
              <GoogleLoginButton label="Cadastrar com Google" />
            </div>

            <a
              href="/login"
              className="block text-center text-xs text-white mt-2 underline"
            >
              Já tenho uma conta
            </a>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Cadastrar;
