import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/navbar/Navbar";
import prisma from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  // Verificar se é administrador
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/user?error=access-denied");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700">
        {children}
      </div>
    </>
  );
}