"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const renderNavItem = (path: string, label: string) => {
    return (
      <Link href={path}>
        <Button 
          variant={isActive(path) ? "default" : "ghost"}
          className={isActive(path) ? "bg-blue-600 text-white" : ""}
        >
          {label}
        </Button>
      </Link>
    )
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline App</h1>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              {renderNavItem("/creator", "Creator")}
              {renderNavItem("/crosses", "Crosses")}
              {renderNavItem("/locations", "Locations")}
              {renderNavItem("/travels", "Travels")}
              {renderNavItem("/visits", "Visits")}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
