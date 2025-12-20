"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, users, setCurrentUser, loading } = useUser();

  const isActive = (path: string) => path === pathname

  const renderNavItem = (path: string, label: string) => {
    return (
      <Link href={path}>
        <Button 
          variant={isActive(path) ? "default" : "ghost"}
          className={isActive(path) ? "!bg-blue-600 !text-white hover:!bg-blue-700" : ""}
        >
          {label}
        </Button>
      </Link>
    )
  }

  const handleUserSelect = (user: typeof currentUser) => {
    if (user) {
      setCurrentUser(user);
    }
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
              {renderNavItem("/travels-by-distance", "Travels by Distance")}
              {renderNavItem("/travels", "Travels by Duration")}
              {renderNavItem("/visits", "Visits")}
            </nav>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {currentUser ? (
                      <span className="text-sm font-medium text-green-300">{currentUser.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground text-orange-300">{loading ? "" : "Guest"}</span>
                    )}
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {currentUser ? `Logged in as ${currentUser.name}` : "Guest Mode"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {users.map((user) => (
                    <DropdownMenuItem
                      key={user.userId}
                      onClick={() => handleUserSelect(user)}
                      className={currentUser?.userId === user.userId ? "bg-accent" : ""}
                    >
                      #{user.userId} - {user.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Manage Users
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
