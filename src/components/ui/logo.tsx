import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className="relative w-10 h-10 transform hover:scale-105 transition-transform duration-300">
        <Image 
          src="/logo.svg" 
          alt="ContentRemix Logo" 
          width={64} 
          height={64} 
          className="object-contain" 
          priority
        />
      </div>
    </Link>
  );
}
