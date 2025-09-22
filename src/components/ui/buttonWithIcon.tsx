import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    iconUrl?: string;
    iconAlt?: string;
    isRounded?: boolean; // Nova propriedade para controlar o arredondamento
}

const ButtonWithIcon: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    iconUrl,
    iconAlt = 'Ícone',
    isRounded = false, // Valor padrão é false
    ...props
}) => {
    const baseStyle = "font-yusei text-lg font-semibold py-2 px-6 border-2 transition-colors duration-300 flex items-center justify-between gap-2";

    const roundedClass = isRounded ? 'rounded-full' : '';

    const styles = {
        primary: "bg-readowl-purple-light text-white border-readowl-purple hover:bg-readowl-purple-hover shadow-md",
        secondary: "bg-readowl-purple-extralight text-readowl-purple border-readowl-purple hover:bg-white shadow-md"
    } as const;

    return (
        <button className={`${baseStyle} ${styles[variant]} ${roundedClass} ${className || ''}`} {...props}>
            {iconUrl && (
                <img src={iconUrl} alt={iconAlt} width={20} height={20} className="w-5 h-5" />
            )}
            <span className="flex-1 text-left">{children}</span>
        </button>
    );
};

export default ButtonWithIcon;