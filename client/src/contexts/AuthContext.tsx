/**
 * Official Service Gateway: authoritative session state shared by portal authentication controls.
 */
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type SignUpResult = {
  user: User | null;
  emailConfirmationRequired: boolean;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const configurationError = new Error(
  "تعذر تشغيل تسجيل الدخول لأن متغيرات Supabase غير مهيأة في بيئة التطبيق.",
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Unable to restore Supabase session", error);
      }
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const requireClient = () => {
      if (!supabase) throw configurationError;
      return supabase;
    };

    return {
      user: session?.user ?? null,
      session,
      loading,
      isConfigured: isSupabaseConfigured,
      async signUp(email, password) {
        const client = requireClient();
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

        if (error) throw error;

        return {
          user: data.user,
          emailConfirmationRequired: Boolean(data.user && !data.session),
        };
      },
      async signIn(email, password) {
        const client = requireClient();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error("تعذر العثور على حساب المستخدم.");
        return data.user;
      },
      async signOut() {
        const client = requireClient();
        const { error } = await client.auth.signOut();
        if (error) throw error;
      },
    };
  }, [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
