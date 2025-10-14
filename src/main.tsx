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
import CreateBookForm from "./pages/create/createBookForm.tsx";
import EditBookPage from "./pages/myLibrary/edit/EditBookPage.tsx";
import MockLogin from "./pages/mockLogin/mockLogin.tsx";
import TermosDeUso from "./pages/termoDeUso/termoDeUso.tsx"
import GenericErrorPage from "./pages/error/GenericErrorPage.tsx";
import PoliticaDePrivacidade from "./pages/privacyPolicy/privacyPolicy.tsx"
import ChapterCreatePage from './pages/chapters/ChapterCreate'
import ChapterEditPage from './pages/chapters/ChapterEdit'
import BookDetailPage from './pages/books/BookDetail'
import BookReorderPage from './pages/books/BookReorder'
import ForbiddenPage from "./pages/error/ForbiddenPage";
import NotFoundPage from "./pages/error/NotFoundPage";
import InternalServerErrorPage from "./pages/error/InternalServerErrorPage";
import Profile from "./pages/profile/profile.tsx";
import UserList from "./pages/userList/userList.tsx";

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
        <Route path="/library/:slug/edit" element={<EditBookPage />} />
        <Route path="/create" element={<CreateBookForm />} />
        <Route path="/mock-login" element={<MockLogin />} />
        <Route path="/termos-de-uso" element={<TermosDeUso />} />
        <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
        <Route path="/error" element={<GenericErrorPage/>}/>
        <Route path="/error403" element={<ForbiddenPage/>}/>
        <Route path="/*" element={<NotFoundPage/>}/>
        <Route path="/error500" element={<InternalServerErrorPage/>}/>
        <Route path="/profile" element={<Profile />} />
        <Route path="/userList" element={<UserList />} />
        <Route path="/books/:id/chapters/new" element={<ChapterCreatePage />} />
        <Route path="/chapters/:id/edit" element={<ChapterEditPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/books/:id/reorder" element={<BookReorderPage />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>
);
