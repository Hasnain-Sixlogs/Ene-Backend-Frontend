import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import * as authService from "@/services/auth";
import type { User, Session } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    const currentSession = authService.getSession();
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password);
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await authService.signUp(email, password);
    return { error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await authService.updatePassword(newPassword);
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
