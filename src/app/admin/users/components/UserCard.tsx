"use client";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { SafeUser } from "@/types/user";

interface UserCardProps {
  user: SafeUser;
}

export default function UserCard({ user }: UserCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/admin/users/${user.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-purple-600 rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer hover:bg-purple-700"
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-md">
        {user.image ? (
          <Image 
            src={user.image} 
            alt={user.name || user.email}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized={user.image.startsWith('data:')}
          />
        ) : (
          <div className="w-full h-full bg-purple-100 flex items-center justify-center">
            <User className="text-purple-600" size={28} />
          </div>
        )}
      </div>

      {/* Info do usuário */}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <User className="text-white/90 flex-shrink-0" size={18} />
          <span className="font-semibold text-lg text-white">
            {user.name || user.email}
          </span>
        </div>
        {user.description && (
          <p className="text-white/80 text-sm mt-1 line-clamp-2">
            {user.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white/70 text-xs">
            Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
          </span>
          {user.emailVerified && (
            <span className="text-green-300 text-xs">✓ Verificado</span>
          )}
        </div>
      </div>

      {/* Indicador de clique */}
      <div className="text-white/60">
        <span className="text-sm">→</span>
      </div>
    </div>
  );
}