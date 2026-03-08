"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { successToast, errorToast } from "@/utils/toast";

import { auth } from "@/lib/firebase";
import { Button } from "../ui/button";

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setLoggedIn(true)
      successToast(`Welcome, ${user.displayName}`);
    } catch (error: any) {
      errorToast("Login error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      setLoggedIn(false);
      successToast("Logged out successfully");
    } catch (error: any) {
      errorToast("Logout error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={loggedIn ? handleLogout : handleLogin}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loggedIn ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      {loading ? "Loading..." : loggedIn ? "Logout" : "Google Login"}
    </Button>
  );
};

export default GoogleLoginButton;
