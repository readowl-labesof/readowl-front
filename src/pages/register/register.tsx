import { useState } from "react";
import Button from "../../components/ui/button";
import Footer from "../../components/footer";
import InputWithIcon from "../../components/ui/inputWithIcon";
import { useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";

function Cadastrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [checkSenha, setCheckSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigate();
  const { saveUser } = useUser();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (senha !== checkSenha) {
      alert("As senhas não conferem!");
      return;
    }
    
    try {
      // Gerar ID único
      const userId = Math.random().toString(36).substr(2, 4);
      
      const novoUsuario = {
        id: userId,
        nome, 
        email, 
        senha,
        role: "user", // Sempre criar como usuário comum
        criadoEm: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
        descricao: "",
        avatarUrl: ""
      };

      // Cadastro no json-server - CORRIGIR PORTA PARA 3001
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }
      
      const usuarioCriado = await response.json();
      
      // FAZER LOGIN AUTOMÁTICO com o novo usuário
      saveUser(usuarioCriado);
      
      alert("Cadastro realizado!");
      setNome("");
      setEmail("");
      setSenha("");
      setCheckSenha("");
      
      // Redirecionar para home já logado
      navigation("/home");
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert("Erro ao realizar cadastro. Verifique se o json-server está rodando na porta 3001.");
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
          <form className="w-full flex flex-col flex-1 justify-between gap-y-0.5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="nome"
                className="block mb-1 text-sm font-medium text-white"
              >
                Nome
              </label>
              <InputWithIcon 
                icon={<span className="material-symbols-outlined">person</span>}
                type="text"
                id="nome"
                placeholder="Seu nome"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
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
                icon={<span className="material-symbols-outlined">mail</span>}
                type="email"
                id="email"
                placeholder="readowl@gmail.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-white"
              >
                Senha
              </label>
              <div className="relative">
                <InputWithIcon 
                  icon={<span className="material-symbols-outlined">key</span>}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Senha"
                  required
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
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
            <div>
              <label
                htmlFor="Check-password"
                className="block mb-1 text-sm font-medium text-white"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <InputWithIcon 
                  icon={<span className="material-symbols-outlined">passkey</span>}
                  type={showConfirmPassword ? "text" : "password"}
                  id="Check-password"
                  placeholder="Confirmar senha"
                  required
                  value={checkSenha}
                  onChange={e => setCheckSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            <hr className="w-full border-white my-4" />
            <div className="flex justify-between items-center w-full mb-4 text-white text-sm">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="w-4 h-4 mr-2" />
                <label htmlFor="remember">Lembrar de mim</label>
              </div>
            </div>
            <Button className="w-40 bg-readowl-purple-extralight text-black font-semibold rounded-full text-base py-1 mb-2 transition mx-auto">
              Cadastrar
            </Button>

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
