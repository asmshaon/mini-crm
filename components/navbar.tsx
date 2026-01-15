"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LayoutDashboard, Users, UserPlus, Upload, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const navItems = [
    {
      href: "/customers",
      label: "Customers",
      icon: Users,
    },
    {
      href: "/customers/new",
      label: "New Customer",
      icon: UserPlus,
    },
    {
      href: "/customers/import",
      label: "Import",
      icon: Upload,
    },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CRM</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!loading && user ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              !loading && (
                <Link href="/login">
                  <Button variant="default" size="sm">
                    Login
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
