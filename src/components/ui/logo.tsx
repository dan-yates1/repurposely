import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="Repurposely Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8" 
            priority
          />
          <h1 className="text-lg font-semibold text-indigo-600">Repurposely</h1>
        </div>
    </Link>
  );
}
