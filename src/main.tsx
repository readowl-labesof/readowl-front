import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/landing/landing.tsx";
import Login from "./pages/login/login.tsx";
import Home from "./pages/home/home.tsx"; 
import Search from "./pages/search/search.tsx";
import Library from "./pages/myLibrary/library.tsx";
import Register from "./pages/register/register.tsx";
import CreateBookForm from './pages/create/createBookForm.tsx';
import TermosDeUso from "./pages/termoDeUso/termoDeUso.tsx"
import PoliticaDePrivacidade from "./pages/privacyPolicy/privacyPolicy.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/create" element={<CreateBookForm />} />
        <Route path="/termos-de-uso" element={<TermosDeUso />} />
        <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>
);