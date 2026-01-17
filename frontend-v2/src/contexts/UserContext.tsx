"use client";

import type { ReactNode } from "react"
import type { User } from "@/types/user";

import { createContext, useContext, useEffect, useState } from "react";

import UserService from "@/services/UserService";

interface UserContextType {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  refreshUsers: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    try {
      const fetchedUsers = await UserService.getAll();
      setUsers(fetchedUsers);
      
      // If no current user is set, set the first user (or user with userId 1)
      if (!currentUser && fetchedUsers.length > 0) {
        const defaultUser = fetchedUsers.find(u => u.userId === 1) || fetchedUsers[0];
        setCurrentUserState(defaultUser);
        localStorage.setItem('currentUserId', defaultUser.userId.toString());
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('currentUserId', user.userId.toString());
    } else {
      localStorage.removeItem('currentUserId');
    }
  };

  useEffect(() => {
    // Load current user from localStorage on mount
    const savedUserId = localStorage.getItem('currentUserId');
    
    const initializeUser = async () => {
      const fetchedUsers = await UserService.getAll();
      setUsers(fetchedUsers);
      
      if (savedUserId) {
        const userId = parseInt(savedUserId, 10);
        const user = fetchedUsers.find(u => u.userId === userId);
        if (user) {
          setCurrentUserState(user);
        } else if (fetchedUsers.length > 0) {
          // If saved user not found, default to user with userId 1 or first user
          const defaultUser = fetchedUsers.find(u => u.userId === 1) || fetchedUsers[0];
          setCurrentUserState(defaultUser);
          localStorage.setItem('currentUserId', defaultUser.userId.toString());
        }
      } else if (fetchedUsers.length > 0) {
        // No saved user, default to user with userId 1 or first user
        const defaultUser = fetchedUsers.find(u => u.userId === 1) || fetchedUsers[0];
        setCurrentUserState(defaultUser);
        localStorage.setItem('currentUserId', defaultUser.userId.toString());
      }
      
      setLoading(false);
    };

    initializeUser();
  }, []);

  // Update current user when users list changes
  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.userId === currentUser.userId);
      if (updatedUser) {
        setCurrentUserState(updatedUser);
      }
    }
  }, [users, currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, users, setCurrentUser, refreshUsers, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

