import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonWithIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconUrl?: string;
  variant?: Variant;
}

// Botão reutilizável com ícone opcional. Comentários explicativos em português.
export default function ButtonWithIcon({ iconUrl, children, variant = 'primary', className = '', ...props }: PropsWithChildren<ButtonWithIconProps>) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition disabled:opacity-60 disabled:cursor-not-allowed';
  const styles: Record<Variant, string> = {
    primary: 'bg-readowl-purple-light text-white hover:bg-readowl-purple',
    secondary: 'bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight',
    ghost: 'bg-transparent text-white hover:bg-white/10',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {iconUrl && <img src={iconUrl} alt="" className="w-4 h-4" aria-hidden />}
      <span>{children}</span>
    </button>
  );
}
