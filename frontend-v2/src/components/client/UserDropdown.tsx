"use client"

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { User } from "lucide-react";
import Link from "next/link";

const UserDropdown = () => {
  const { currentUser, users, setCurrentUser, loading } = useUser();

  const handleUserSelect = (user: typeof currentUser) => {
    if (user) {
      setCurrentUser(user);
    }
  }

  return (
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
        <DropdownMenuItem>
          <Link href="/profile">
            Manage Users
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown