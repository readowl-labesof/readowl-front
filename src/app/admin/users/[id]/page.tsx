import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/ui/navbar/Navbar";
import { BreadcrumbAuto } from "@/components/ui/navbar/Breadcrumb";
import prisma from "@/lib/prisma";
import AdminEditProfile from "./components/AdminEditProfile";

interface AdminEditUserPageProps { params: Promise<{ id: string }> }

export default async function AdminEditUserPage({ params }: AdminEditUserPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/user?error=access-denied");

  // Buscar usuário para editar
  const userToEdit = await prisma.user.findUnique({
    where: { id }
  });

  if (!userToEdit) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="w-full flex justify-center mt-14 sm:mt-16">
        <BreadcrumbAuto anchor="static" base="/home" labelMap={{ admin: "Administração", users: "Usuários", [id]: userToEdit.name || userToEdit.email }} />
      </div>
      <main className="min-h-screen flex flex-col">
        <AdminEditProfile user={userToEdit} />
      </main>
    </>
  );
}
