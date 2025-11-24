import { BreadcrumbAuto } from "@/components/ui/navbar/Breadcrumb";
import Link from "next/link";
import UserList from "./components/UserList";
import prisma from "@/lib/prisma";
import Navbar from "@/components/ui/navbar/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import type { SafeUser } from "@/types/user";

export default async function AdminUsersPage() {
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            description: true,
            createdAt: true,
            updatedAt: true, 
            emailVerified: true,
            credentialVersion: true, 
        },
        orderBy: [
            { role: 'desc' }, // ADMINs primeiro
            { createdAt: 'desc' }, // Mais recentes primeiro
        ],
    });

  // Dados já carregados acima em 'users'

  return (
    <>
      <Navbar />
      <div className="w-full flex justify-center mt-14 sm:mt-16">
        <BreadcrumbAuto anchor="static" base="/home" labelMap={{ admin: "Administração", users: "Lista de Usuários" }} />
      </div>
      <main className="min-h-screen flex flex-col">
        <div className="w-full max-w-5xl mx-auto px-4 mt-4 flex items-center justify-center gap-3">
          <Link href="/admin/users" className="px-3 py-1 bg-readowl-purple text-white rounded hover:bg-readowl-purple-medium">Lista de usuários</Link>
          <Link href="/admin/reports" className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500">Lista de denúncias</Link>
        </div>
        <UserList users={users as SafeUser[]} />
      </main>
    </>
  );
}
