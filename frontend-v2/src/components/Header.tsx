"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline App</h1>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link href="/creator">
                <Button 
                  variant={isActive("/creator") ? "default" : "ghost"}
                  className={isActive("/creator") ? "bg-blue-600 text-white" : ""}
                >
                  Creator
                </Button>
              </Link>
              <Link href="/locations">
                <Button 
                  variant={isActive("/locations") ? "default" : "ghost"}
                  className={isActive("/locations") ? "bg-blue-600 text-white" : ""}
                >
                  Locations
                </Button>
              </Link>
              <Link href="/travels">
                <Button 
                  variant={isActive("/travels") ? "default" : "ghost"}
                  className={isActive("/travels") ? "bg-blue-600 text-white" : ""}
                >
                  Travels
                </Button>
              </Link>
              <Link href="/visits">
                <Button 
                  variant={isActive("/visits") ? "default" : "ghost"}
                  className={isActive("/visits") ? "bg-blue-600 text-white" : ""}
                >
                  Visits
                </Button>
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
