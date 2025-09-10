import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/landing/landing.tsx";
import Login from "./pages/login/login.tsx";
import Home from "./pages/home/home.tsx"; 
import Cadastrar from "./pages/Cadastrar/cadastrar.tsx";
import CreateBookForm from './pages/create/createBookForm.tsx';
import TermosDeUso from "./pages/termoDeUso/termoDeUso.tsx"
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade/politicaDePrivacidade.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastrar" element={<Cadastrar />} />
        <Route path="/home" element={<Home />} />
        {/* Página de criação de livro (convertida do Next.js) */}
        <Route path="/create" element={<CreateBookForm />} />
        <Route path="/termos-de-uso" element={<TermosDeUso />} />
        <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
        {/* Rota do botao login <Route path="/teste" element={<Teste />} /> */}
      </Routes>
    </StrictMode>
  </BrowserRouter>
);