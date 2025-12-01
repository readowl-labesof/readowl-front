'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';

export default function ProfileImageUpload() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione uma imagem válida');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      alert('Imagem muito grande (máximo 1MB)');
      return;
    }

    try {
      setIsLoading(true);

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        try {
          const response = await fetch('/api/user/profile-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: base64 }),
          });

          if (response.ok) {
            await update();
            router.refresh();
            alert('Imagem atualizada com sucesso!');
            URL.revokeObjectURL(previewUrl);
            setPreview(null);
          } else {
            const error = await response.json();
            alert(error.error || 'Erro no upload');
            setPreview(null);
            URL.revokeObjectURL(previewUrl);
          }
        } catch (uploadError) {
          console.error('Erro no upload:', uploadError);
          alert('Erro ao fazer upload da imagem');
          setPreview(null);
          URL.revokeObjectURL(previewUrl);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const displayImage = preview || (session?.user?.image ? `${session.user.image}?t=${Date.now()}` : null);

  return (
    <div className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="relative w-32 h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 mb-2">
        {displayImage ? (
          <Image src={displayImage} alt="Foto de perfil" fill className="object-cover" sizes="128px" />
        ) : (
          <UserIcon className="text-gray-400" size={32} />
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>
      <label className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-blue-700 transition-colors mb-1">
        {isLoading ? 'Enviando...' : 'Alterar Foto'}
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} className="hidden" />
      </label>
      <div className="text-xs text-gray-500 text-center">
        <p>• Máximo 1MB</p>
        <p>• JPG, PNG, WebP</p>
      </div>
    </div>
  );
}
