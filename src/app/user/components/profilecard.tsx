"use client";
import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { SafeUser } from "@/types/user";

interface ProfileCardProps {
  user: SafeUser | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const [imageSrc, setImageSrc] = useState(user?.image);

  useEffect(() => {
    if (user?.image) {
      setImageSrc(`${user.image}?t=${Date.now()}`);
    }
  }, [user?.image]);

  if (!user) {
    return (
      <div className="bg-readowl-purple-medium rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-2xl mx-auto mt-6">
        <h2 className="text-2xl font-bold text-white mb-4">Informações de Usuário</h2>
        <p className="text-white">Carregando informações do usuário...</p>
      </div>
    );
  }

  const displayName = user.name || 'Nome não disponível';
  const displayEmail = user.email || 'Email não disponível';
  const displayBio = user.description || 'Descrição não disponível';
  const displayCreated = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível';

  return (
    <div className="bg-readowl-purple-medium rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-white mb-4">Informações de Usuário</h2>
      <div className="flex flex-row items-center w-full">
        {/* Avatar - Padrão fixo 160x160px */}
        <div className="bg-white rounded-lg p-4 mr-8 flex items-center justify-center w-40 h-40 flex-shrink-0">
          {imageSrc ? (
            <Image 
              src={imageSrc} 
              alt="avatar" 
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-lg"
              style={{ aspectRatio: '1/1' }}
              unoptimized={imageSrc.startsWith('data:')}
            />
          ) : (
            <User className="text-gray-400" size={64} />
          )}
        </div>
        {/* Informações */}
        <div className="flex flex-col text-white flex-1">
          <span className="flex items-center mb-2">
            <User className="mr-2" size={20} />
            <span className="font-semibold text-lg">{displayName}</span>
          </span>
          <span className="flex items-center mb-2">
            <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>{displayEmail}</span>
          </span>
          <span className="flex items-center mb-2">
            <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
            <span>{displayBio}</span>
          </span>
          <span className="flex items-center mb-2">
            <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{displayCreated}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
