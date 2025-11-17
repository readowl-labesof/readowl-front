import { BreadcrumbAuto } from "@/components/ui/navbar/Breadcrumb";
import UserList from "./components/UserList";
import prisma from "@/lib/prisma";
import Navbar from "@/components/ui/navbar/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import type { SafeUser } from "@/types/user";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const current = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!current || current.role !== "ADMIN") redirect("/user?error=access-denied");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, image: true, role: true, description: true, createdAt: true, updatedAt: true, emailVerified: true, credentialVersion: true },
    orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <>
      <Navbar />
      <div className="w-full flex justify-center mt-14 sm:mt-16">
        <BreadcrumbAuto anchor="static" base="/home" labelMap={{ admin: "Administração", users: "Lista de Usuários" }} />
      </div>
      <main className="min-h-screen flex flex-col">
        <UserList users={users as SafeUser[]} />
      </main>
    </>
  );
}
