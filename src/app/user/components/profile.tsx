"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "./profilecard";
import EditProfileForm from "./EditProfileForm";
import BookCarousel from "@/components/book/BookCarousel";
import type { SafeUser } from "@/types/user";
import { ClipboardList, Pencil } from "lucide-react";
import ButtonWithIcon from "@/components/ui/button/ButtonWithIcon";
import Link from "next/link";

interface ProfileProps { currentUser: SafeUser | null; userBooks?: Array<{ id: string; title: string; coverUrl: string | null }>; }

export default function Profile({ currentUser, userBooks = [] }: ProfileProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user: SafeUser | null = currentUser;
  const isAdmin = user?.role === "ADMIN";
  const handleProfileUpdate = () => { setOpen(false); router.refresh(); };

  return (
    <div className="flex flex-col">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center mb-4 gap-3">
          <ButtonWithIcon
            variant="primary"
            onClick={() => setOpen(true)}
            icon={<Pencil size={20} />}
          >
            Editar conta
          </ButtonWithIcon>
          {isAdmin && (
            <Link href="/admin/users">
              <ButtonWithIcon
                variant="secondary"
                icon={<ClipboardList size={20} />}
              >
                Lista Administrativa
              </ButtonWithIcon>
            </Link>
          )}
        </div>
        <ProfileCard user={user} />
        <BookCarousel books={userBooks} title={`Autoria de ${user?.name || 'Usuário'}!`} itemsPerView={5} emptyMessage={`${user?.name || 'Usuário'} não possui obras de autoria registradas no Readowl.`} />
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <EditProfileForm onClose={handleProfileUpdate} currentUser={user} />
          </div>
        </div>
      )}
    </div>
  );
}
