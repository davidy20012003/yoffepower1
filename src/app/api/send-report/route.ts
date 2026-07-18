import { NextResponse } from "next/server";

const emailSubject = "דוח חישוב כבל";
const emailBody = `שלום,

מצורף דוח חישוב הכבל שנוצר במחשבון.

בברכה,
David Yoffe Consulting & Testing`;

type SendReportRequest = {
  fileName?: unknown;
  pdfBase64?: unknown;
};

export async function POST(request: Request) {
  try {
    const accessToken = getBearerToken(request);
    const { fileName, pdfBase64 } = (await request.json()) as SendReportRequest;

    if (!accessToken) {
      return jsonError("Missing authenticated session.", 401);
    }

    if (typeof fileName !== "string" || !fileName.endsWith(".pdf")) {
      return jsonError("Invalid PDF filename.", 400);
    }

    if (typeof pdfBase64 !== "string" || !isBase64PdfPayload(pdfBase64)) {
      return jsonError("Invalid PDF attachment.", 400);
    }

    const recipientEmail = await getVerifiedSupabaseEmail(accessToken);
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey) {
      return jsonError("Missing RESEND_API_KEY.", 500);
    }

    if (!fromEmail) {
      return jsonError("Missing RESEND_FROM_EMAIL.", 500);
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": request.headers.get("Idempotency-Key") ?? crypto.randomUUID()
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: emailSubject,
        text: emailBody,
        attachments: [
          {
            filename: fileName,
            content: pdfBase64
          }
        ]
      })
    });

    if (!resendResponse.ok) {
      return jsonError(await readProviderError(resendResponse), resendResponse.status);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to send report.", 500);
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length).trim();
}

function isBase64PdfPayload(value: string) {
  const maxBase64Length = 12 * 1024 * 1024;
  return value.length > 1000 && value.length <= maxBase64Length && /^[A-Za-z0-9+/=]+$/.test(value);
}

async function getVerifiedSupabaseEmail(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Invalid authenticated session.");
  }

  const user = (await response.json()) as {
    email?: string;
    email_confirmed_at?: string | null;
    confirmed_at?: string | null;
  };

  if (!user.email) {
    throw new Error("Authenticated user email is missing.");
  }

  if (!user.email_confirmed_at && !user.confirmed_at) {
    throw new Error("Authenticated user email is not verified.");
  }

  return user.email;
}

async function readProviderError(response: Response) {
  const fallback = `Email provider error (${response.status}).`;

  try {
    const body = (await response.json()) as { message?: string; error?: string; name?: string };
    return body.message ?? body.error ?? body.name ?? fallback;
  } catch {
    return fallback;
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}
