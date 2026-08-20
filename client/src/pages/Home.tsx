/** Official Service Gateway: bridges the preserved standalone portal shell to the React Supabase session. */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type PortalMessage =
  | { type: "auth:sign-in"; email: string; password: string }
  | { type: "auth:sign-up"; email: string; password: string }
  | { type: "auth:sign-out" }
  | { type: "portal:height"; height: number };

function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
  if (message.toLowerCase().includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (message.toLowerCase().includes("email not confirmed")) return "يرجى تأكيد بريدك الإلكتروني أولًا ثم محاولة تسجيل الدخول.";
  if (message.toLowerCase().includes("user already registered")) return "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.";
  if (message.toLowerCase().includes("password should be")) return "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.";
  return message;
}

export default function Home() {
  const { user, loading, signIn, signOut, signUp } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [portalHeight, setPortalHeight] = useState(1200);

  const sendToPortal = useCallback((message: object) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    if (!loading) {
      sendToPortal({ type: "auth:state", user: user ? { email: user.email ?? "" } : null });
    }
  }, [loading, sendToPortal, user]);

  useEffect(() => {
    const handlePortalMessage = async (event: MessageEvent<PortalMessage>) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "portal:height") {
        setPortalHeight(Math.max(900, Math.min(data.height, 10000)));
        return;
      }

      try {
        if (data.type === "auth:sign-in") {
          await signIn(data.email, data.password);
          sendToPortal({ type: "auth:result", mode: "sign-in", success: true });
        }

        if (data.type === "auth:sign-up") {
          const result = await signUp(data.email, data.password);
          sendToPortal({
            type: "auth:result",
            mode: "sign-up",
            success: true,
            emailConfirmationRequired: result.emailConfirmationRequired,
          });
        }

        if (data.type === "auth:sign-out") {
          await signOut();
          sendToPortal({ type: "auth:result", mode: "sign-out", success: true });
        }
      } catch (error) {
        sendToPortal({
          type: "auth:result",
          mode: data.type,
          success: false,
          message: getAuthErrorMessage(error),
        });
      }
    };

    window.addEventListener("message", handlePortalMessage);
    return () => window.removeEventListener("message", handlePortalMessage);
  }, [sendToPortal, signIn, signOut, signUp]);

  return (
    <main className="min-h-screen bg-[#f8f9fa]" aria-busy={loading}>
      <iframe
        ref={iframeRef}
        title="بوابة e-mahata نفطال"
        src="/e-mahata.html"
        className="block w-full border-0"
        style={{ height: `${portalHeight}px` }}
        scrolling="no"
        onLoad={() => sendToPortal({ type: "auth:state", user: user ? { email: user.email ?? "" } : null })}
      />
    </main>
  );
}
