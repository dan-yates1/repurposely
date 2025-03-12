import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, PenSquare, Settings, User } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600' : 'text-gray-500';
  };
  
  return (
    <div className="h-full w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6">
      <div className="flex flex-col items-center space-y-8">
        <Link href="/dashboard" className={`${isActive('/dashboard')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Home size={24} />
        </Link>
        <Link href="/create" className={`${isActive('/create')} p-2 rounded-lg hover:bg-indigo-50`}>
          <PenSquare size={24} />
        </Link>
        <Link href="/history" className={`${isActive('/history')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Clock size={24} />
        </Link>
        <Link href="/settings" className={`${isActive('/settings')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Settings size={24} />
        </Link>
      </div>
      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={20} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}
