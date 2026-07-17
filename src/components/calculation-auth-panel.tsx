"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type VerificationStep = "details" | "code";

type CalculationAuthPanelProps = {
  calculationReady: boolean;
};

const disabledFileActions = [
  "שמור ושלח את החישוב",
  "הורד קובץ",
  "שלח אליי בדוא״ל"
] as const;

export function CalculationAuthPanel({ calculationReady }: CalculationAuthPanelProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<VerificationStep>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [calculationTitle, setCalculationTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

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
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setResendSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function openModal() {
    setErrorMessage("");
    setStatusMessage("");
    setOtp("");
    setStep("details");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (!isBusy) {
      setIsModalOpen(false);
    }
  }

  async function sendCode() {
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

    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        data: { name: trimmedName },
        shouldCreateUser: true
      }
    });

    setIsBusy(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setStep("code");
    setResendSeconds(60);
    setStatusMessage("נשלח קוד בן שש ספרות לכתובת הדוא״ל.");
  }

  async function verifyCode() {
    if (!supabase) {
      setErrorMessage("אימות דוא״ל אינו מוגדר בסביבה זו.");
      return;
    }

    const token = otp.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!/^\d{6}$/.test(token)) {
      setErrorMessage("יש להזין קוד אימות בן שש ספרות.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: "email"
    });

    if (error) {
      setIsBusy(false);
      setErrorMessage(error.message);
      return;
    }

    if (trimmedName) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: trimmedName }
      });

      if (updateError) {
        setIsBusy(false);
        setErrorMessage(updateError.message);
        return;
      }
    }

    setSession(data.session);
    setIsBusy(false);
    setStatusMessage("");
    setIsModalOpen(false);
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
                  disabled={isBusy || step === "code"}
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
                  disabled={isBusy || step === "code"}
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>

              {step === "code" ? (
                <label className="grid gap-1 text-sm font-bold text-slate-800">
                  קוד אימות
                  <input
                    autoComplete="one-time-code"
                    className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    pattern="[0-9]*"
                    type="text"
                    value={otp}
                  />
                </label>
              ) : null}

              {statusMessage ? <p className="rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-950">{statusMessage}</p> : null}
              {errorMessage ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">{errorMessage}</p> : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                {step === "details" ? (
                  <button
                    className="rounded-md bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 disabled:opacity-60"
                    disabled={isBusy}
                    onClick={sendCode}
                    type="button"
                  >
                    שלח קוד
                  </button>
                ) : (
                  <>
                    <button
                      className="rounded-md bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 disabled:opacity-60"
                      disabled={isBusy}
                      onClick={verifyCode}
                      type="button"
                    >
                      אמת
                    </button>
                    <button
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 disabled:opacity-60"
                      disabled={isBusy || resendSeconds > 0}
                      onClick={sendCode}
                      type="button"
                    >
                      {resendSeconds > 0 ? `שלח שוב בעוד ${resendSeconds}` : "שלח קוד שוב"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
