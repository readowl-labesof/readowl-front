import { BreadcrumbAuto } from "@/components/ui/Breadcrumb";
import UserList from "./components/UserList";
import prisma from "@/lib/prisma";

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
            blocked: true,
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

    return (
        <>
            <div className="w-full flex justify-center mt-14 sm:mt-16">
                <BreadcrumbAuto 
                    anchor="static" 
                    base="/home" 
                    labelMap={{ 
                        admin: "Administração",
                        users: "Lista de Usuários" 
                    }} 
                />
            </div>
            <main className="min-h-screen flex flex-col">
                <UserList users={users} />
            </main>
        </>
    );
}