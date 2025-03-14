"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "@/components/ui/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/auth");
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="bg-white mx-auto flex items-center justify-center h-screen">
          <Logo />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
