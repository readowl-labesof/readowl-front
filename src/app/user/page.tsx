import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/navbar/Navbar";
import { BreadcrumbAuto } from "@/components/ui/navbar/Breadcrumb";
import Profile from "./components/profile";
import prisma from "@/lib/prisma";
import type { SafeUser } from "@/types/user";


export default async function Account() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login?callbackUrl=/home");

    // Load latest user data and authored books for parity with frontend component
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, image: true, description: true, role: true, createdAt: true, updatedAt: true } });
    const userBooks = await prisma.book.findMany({ where: { authorId: session.user.id }, select: { id: true, title: true, coverUrl: true } });

    return (
        <>
            <Navbar />
            <div className="w-full flex justify-center mt-14 sm:mt-16">
                <BreadcrumbAuto anchor="static" base="/home" labelMap={{ user: "Conta" }} />
            </div>
            <main className="min-h-screen flex flex-col">
                <Profile currentUser={currentUser as SafeUser | null} userBooks={userBooks} />
            </main>
        </>
    );
}
