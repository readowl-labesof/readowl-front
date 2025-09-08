import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/landing/landing.tsx";
import Login from "./pages/login/login.tsx";
import Home from "./pages/home/home.tsx"; 
import Cadastrar from "./pages/Cadastrar/cadastrar.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastrar" element={<Cadastrar />} />
        <Route path="/home" element={<Home />} /> 
      </Routes>
    </StrictMode>
  </BrowserRouter>
);
