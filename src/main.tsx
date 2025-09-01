import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/landing/landing.tsx";
import Login from "./pages/login/login.tsx";
//import Teste from "./pages/teste/teste.tsx"; pasta Teste
import Cadastrar from "./pages/Cadastrar/cadastrar.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastrar" element={<Cadastrar />} />
        {/* Rota do botao login <Route path="/teste" element={<Teste />} /> */}
      </Routes>
    </StrictMode>
  </BrowserRouter>
);
