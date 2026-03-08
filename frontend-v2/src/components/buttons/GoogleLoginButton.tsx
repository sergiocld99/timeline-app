"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { successToast, errorToast } from "@/utils/toast";

import { auth } from "@/lib/firebase";
import { Button } from "../ui/button";

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      successToast(`Welcome, ${user.displayName}`);
    } catch (error: any) {
      errorToast("Login error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      {loading ? "Loading..." : "Google Login"}
    </Button>
  );
};

export default GoogleLoginButton;
