"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/customers");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <LayoutDashboard className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
            Customer Management System
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A simple and powerful CRM to manage your customers efficiently
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={() => router.push("/login")}>
              Login to Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
