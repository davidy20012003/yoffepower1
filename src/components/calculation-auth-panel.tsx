"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type CalculationAuthPanelProps = {
  calculationReady: boolean;
};

const pendingAuthNameKey = "yoffe-calculator-pending-auth-name";
const pendingAuthEmailKey = "yoffe-calculator-pending-auth-email";

const disabledFileActions = [
  "שמור ושלח את החישוב",
  "הורד קובץ",
  "שלח אליי בדוא״ל"
] as const;

export function CalculationAuthPanel({ calculationReady }: CalculationAuthPanelProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [calculationTitle, setCalculationTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const authRequestInFlight = useRef(false);

  const verifiedEmail = session?.user.email ?? "";
  const verifiedName = (session?.user.user_metadata?.name as string | undefined) ?? "";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      return;
    }

    const pendingName = window.localStorage.getItem(pendingAuthNameKey);
    const pendingEmail = window.localStorage.getItem(pendingAuthEmailKey);
    const sessionEmail = session.user.email?.toLowerCase();

    if (!pendingName || !pendingEmail || pendingEmail !== sessionEmail) {
      return;
    }

    window.localStorage.removeItem(pendingAuthNameKey);
    window.localStorage.removeItem(pendingAuthEmailKey);

    if (session.user.user_metadata?.name === pendingName) {
      return;
    }

    supabase.auth.updateUser({ data: { name: pendingName } }).then(({ error }) => {
      if (!error) {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
      }
    });
  }, [session, supabase]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const cleanUrl = `${window.location.origin}${window.location.pathname}`;

    if (window.location.href !== cleanUrl) {
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [session]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setResendSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function openModal() {
    setErrorMessage("");
    setStatusMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (!isBusy) {
      setIsModalOpen(false);
    }
  }

  async function sendMagicLink() {
    if (authRequestInFlight.current) {
      return;
    }

    if (!supabase) {
      setErrorMessage("אימות דוא״ל אינו מוגדר בסביבה זו.");
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail) {
      setErrorMessage("יש להזין שם וכתובת דוא״ל.");
      return;
    }

    authRequestInFlight.current = true;
    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    window.localStorage.setItem(pendingAuthNameKey, trimmedName);
    window.localStorage.setItem(pendingAuthEmailKey, normalizedEmail);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        data: { name: trimmedName },
        emailRedirectTo: `${window.location.origin}/he/cable-calculator`,
        shouldCreateUser: true
      }
    });

    if (error) {
      authRequestInFlight.current = false;
      setIsBusy(false);
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    authRequestInFlight.current = false;
    setIsBusy(false);
    setResendSeconds(60);
    setStatusMessage("נשלח קישור אימות לכתובת הדוא״ל. יש לפתוח את הקישור כדי להשלים את האימות.");
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    setIsBusy(true);
    await supabase.auth.signOut();
    setSession(null);
    setIsBusy(false);
  }

  return (
    <section className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-950">אימות משתמש בדוא״ל</h3>
          <p className="mt-1 text-sm leading-6 text-blue-950">
            {session
              ? `מחובר כ-${verifiedName || verifiedEmail}`
              : "ניתן להמשיך להשתמש במחשבון גם ללא אימות. אימות דוא״ל ישמש בהמשך ליצירת קובץ חישוב ושליחה לדוא״ל המאומת."}
          </p>
        </div>
        {session ? (
          <button
            className="rounded-md border border-blue-900 px-4 py-2 text-sm font-bold text-blue-950 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            disabled={isBusy}
            onClick={signOut}
            type="button"
          >
            התנתק
          </button>
        ) : (
          <button
            className="rounded-md bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
            onClick={openModal}
            type="button"
          >
            אימות בדוא״ל
          </button>
        )}
      </div>

      {session ? (
        <div className="mt-4 grid gap-3 border-t border-blue-100 pt-4">
          <label className="grid gap-1 text-sm font-bold text-blue-950">
            שם החישוב
            <input
              className="rounded-md border border-blue-200 bg-white px-3 py-2 font-normal text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              disabled={!calculationReady}
              onChange={(event) => setCalculationTitle(event.target.value)}
              placeholder="לדוגמה: הזנת לוח ראשי"
              type="text"
              value={calculationTitle}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {disabledFileActions.map((label) => (
              <button
                className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-950 opacity-60"
                disabled
                key={label}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isModalOpen ? (
        <div
          aria-labelledby="email-verification-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          dir="rtl"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-950" id="email-verification-title">
                אימות בדוא״ל
              </h3>
              <button
                aria-label="סגור"
                className="rounded-md border border-slate-200 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                onClick={closeModal}
                type="button"
              >
                סגור
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1 text-sm font-bold text-slate-800">
                שם
                <input
                  autoComplete="name"
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                  disabled={isBusy}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  value={name}
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-800">
                כתובת דוא״ל
                <input
                  autoComplete="email"
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                  disabled={isBusy}
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>

              {statusMessage ? <p className="rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-950">{statusMessage}</p> : null}
              {errorMessage ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">{errorMessage}</p> : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="rounded-md bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 disabled:opacity-60"
                  disabled={isBusy || resendSeconds > 0}
                  onClick={sendMagicLink}
                  type="button"
                >
                  {isBusy ? "שולח..." : resendSeconds > 0 ? `שלח שוב בעוד ${resendSeconds}` : "שלח קישור אימות"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getAuthErrorMessage(error: { message?: string; code?: string; status?: number }) {
  const message = error.message ?? "";
  const code = error.code ?? "";

  if (error.status === 429 || code === "over_email_send_rate_limit" || message.toLowerCase().includes("rate limit")) {
    return "Email rate limit exceeded. Please wait a few minutes and try again.";
  }

  return message || "Authentication request failed. Please try again.";
}
