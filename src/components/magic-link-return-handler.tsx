"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const calculatorPath = "/he/cable-calculator";

export function MagicLinkReturnHandler() {
  useEffect(() => {
    const hasAuthReturnParams =
      window.location.search.includes("code=") ||
      window.location.search.includes("error=") ||
      window.location.hash.includes("access_token=") ||
      window.location.hash.includes("refresh_token=") ||
      window.location.hash.includes("type=magiclink");

    if (!hasAuthReturnParams) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let handled = false;

    function finishReturn() {
      if (handled) {
        return;
      }

      handled = true;
      const cleanCalculatorUrl = `${window.location.origin}${calculatorPath}`;

      if (window.location.pathname === calculatorPath) {
        window.history.replaceState({}, document.title, cleanCalculatorUrl);
        return;
      }

      window.location.replace(cleanCalculatorUrl);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        finishReturn();
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        finishReturn();
      }
    });

    const fallbackTimer = window.setTimeout(finishReturn, 1500);

    return () => {
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
