import React from 'react';
import logoImg from '../assets/images/selling_ajah_logo_transparent.png';

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'full';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  imgClassName = '',
  size = 'md'
}) => {
  // Dimensions based on size
  const heightClasses = {
    sm: 'h-8',
    md: 'h-9 sm:h-10 md:h-11 xl:h-12 2xl:h-[53px]',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  };

  return (
    <div className={`inline-flex items-center cursor-pointer select-none group ${className}`}>
      <img
        src={logoImg}
        alt="Selling Ajah - Luxury Real Estate"
        className={`${heightClasses[size]} ${imgClassName} w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(212,175,55,0.15)]`}
        loading="eager"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
