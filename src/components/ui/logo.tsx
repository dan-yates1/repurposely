import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  text?: boolean;
  large?: boolean;
}

export function Logo({ className = "", text = true, large = false }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center justify-center ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/logo.svg"
          alt="Repurposely Logo"
          width={large ? 48 : 32}
          height={large ? 48 : 32}
          className={`${large ? 'w-12 h-12' : 'w-8 h-8'}`}
          priority
        />
        {text && (
          <h1 className={`font-medium tracking-tight text-indigo-600 ${large ? 'text-2xl' : 'text-lg'}`}>Repurposely</h1>
        )}
      </div>
    </Link>
  );
}
