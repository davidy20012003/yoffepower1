import { NextResponse } from "next/server";

const openAiResponsesUrl = "https://api.openai.com/v1/responses";
const model = process.env.OPENAI_VISION_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5-mini";
const maxImageDataUrlLength = 7_500_000;

type AssistanceRequest = {
  mode?: unknown;
  imageDataUrl?: unknown;
  cableRequest?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistanceRequest;

    if (body.mode === "photo") {
      return await analyzePhoto(body.imageDataUrl);
    }

    if (body.mode === "cable") {
      return await interpretCableRequest(body.cableRequest);
    }

    return jsonError("Invalid AI assistance mode.", 400);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "AI assistance failed.", 500);
  }
}

async function analyzePhoto(imageDataUrl: unknown) {
  if (typeof imageDataUrl !== "string" || !isSafeImageDataUrl(imageDataUrl)) {
    return jsonError("Invalid image. Please upload a clear JPG, PNG, or WEBP photo.", 400);
  }

  const result = await callOpenAi({
    instructions:
      "You are assisting an Israeli electrical cable ampacity calculator. Analyze only visible installation conditions. Do not perform cable ampacity calculations. Be conservative. If the photo is blurred, dark, unclear, or the installation is not sufficiently visible, mark photoQuality.isUsable=false. Recognize only these supported installation types: cable tray, ladder tray, wire mesh tray, cable channel or trench, direct burial in the ground, and cables fixed directly to a wall or ceiling. If unsupported or uncertain, set supported=false and installationType=unknown. Count only visible existing cables. Do not estimate hidden cables. If visible cables are in more than one layer, classify simply as grouped_or_piled. Give remaining space estimates only if visible scale and geometry are sufficient; otherwise status=unknown and estimateTextHebrew=null.",
    content: [
      {
        type: "input_text",
        text: "נתח את תמונת התקנת הכבלים והחזר JSON בלבד לפי הסכמה."
      },
      {
        type: "input_image",
        image_url: imageDataUrl,
        detail: "high"
      }
    ],
    schema: photoSchema
  });

  return NextResponse.json(result);
}

async function interpretCableRequest(cableRequest: unknown) {
  if (typeof cableRequest !== "string" || cableRequest.trim().length < 2 || cableRequest.length > 500) {
    return jsonError("Please describe the cables you would like to add.", 400);
  }

  const result = await callOpenAi({
    instructions:
      "You are assisting an Israeli electrical cable ampacity calculator. Convert the user's requested cable text into calculator input fields only when explicit or strongly implied by cable notation. Do not perform ampacity calculations. Do not invent missing values. N2XY is copper XLPE and NA2XY is aluminium XLPE. A notation like 4x240 or 4×240 usually means one multicore three-phase cable with 240 mm2 conductors. A phrase like two N2XY 4x240 cables means parallelCount=2. If the material, section, insulation, phase, cable kind, or quantity cannot be determined, set that field to null and list it in missingFields.",
    content: [
      {
        type: "input_text",
        text: `בקשת המשתמש: ${cableRequest}`
      }
    ],
    schema: cableSchema
  });

  return NextResponse.json(result);
}

async function callOpenAi({
  instructions,
  content,
  schema
}: {
  instructions: string;
  content: Array<Record<string, unknown>>;
  schema: Record<string, unknown>;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const response = await fetch(openAiResponsesUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions,
      input: [
        {
          role: "user",
          content
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "cable_ai_assistance",
          strict: false,
          schema
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(await readProviderError(response));
  }

  const data = (await response.json()) as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  const outputText = data.output_text ?? data.output?.flatMap((item) => item.content ?? []).map((item) => item.text).find(Boolean);

  if (!outputText) {
    throw new Error("AI response did not include structured output.");
  }

  return JSON.parse(outputText) as unknown;
}

function isSafeImageDataUrl(value: string) {
  return value.length <= maxImageDataUrlLength && /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
}

async function readProviderError(response: Response) {
  const fallback = `AI provider error (${response.status}).`;

  try {
    const body = (await response.json()) as { error?: { message?: string }; message?: string };
    return body.error?.message ?? body.message ?? fallback;
  } catch {
    return fallback;
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

const photoSchema = {
  type: "object",
  additionalProperties: false,
  required: ["photoQuality", "recognition", "messageHebrew"],
  properties: {
    photoQuality: {
      type: "object",
      additionalProperties: false,
      required: ["isUsable", "confidence", "issues"],
      properties: {
        isUsable: { type: "boolean" },
        confidence: { type: "number" },
        issues: { type: "array", items: { type: "string" } }
      }
    },
    recognition: {
      type: "object",
      additionalProperties: false,
      required: [
        "supported",
        "installationType",
        "confidence",
        "reason",
        "trayKind",
        "environment",
        "wallCeilingLocation",
        "visibleExistingCableCount",
        "multipleLayers",
        "grouping",
        "spacingCategory",
        "scaleAvailable",
        "remainingSpace",
        "suggestedTable4Arrangement"
      ],
      properties: {
        supported: { type: "boolean" },
        installationType: {
          type: "string",
          enum: ["cable_tray", "ladder_tray", "wire_mesh_tray", "cable_channel_or_trench", "direct_burial", "wall_or_ceiling", "unknown"]
        },
        confidence: { type: "number" },
        reason: { type: "string" },
        trayKind: { type: "string", enum: ["perforated", "unperforated", "wire_mesh", "unknown"] },
        environment: { type: "string", enum: ["air", "ground", "unknown"] },
        wallCeilingLocation: { type: "string", enum: ["wall", "ceiling", "unknown"] },
        visibleExistingCableCount: { type: ["number", "null"] },
        multipleLayers: { type: ["boolean", "null"] },
        grouping: { type: "string", enum: ["single_layer_spaced", "touching_or_bundled", "grouped_or_piled", "unknown"] },
        spacingCategory: { type: "string", enum: ["touching", "de", "12.5cm", "25cm", "50cm", "100cm", "unknown"] },
        scaleAvailable: { type: "boolean" },
        remainingSpace: {
          type: "object",
          additionalProperties: false,
          required: ["status", "estimateTextHebrew"],
          properties: {
            status: { type: "string", enum: ["fits", "limited", "approximately", "unknown"] },
            estimateTextHebrew: { type: ["string", "null"] }
          }
        },
        suggestedTable4Arrangement: {
          type: ["string", "null"],
          enum: ["bundled", "wallFloorTray", "ceiling", "perforatedTray", "ladderSupports", null]
        }
      }
    },
    messageHebrew: { type: "string" }
  }
};

const cableSchema = {
  type: "object",
  additionalProperties: false,
  required: ["interpretedTextHebrew", "confidence", "cableKind", "material", "section", "parallelCount", "insulation", "phase", "missingFields", "notes"],
  properties: {
    interpretedTextHebrew: { type: "string" },
    confidence: { type: "number" },
    cableKind: { type: ["string", "null"], enum: ["multicore", "singleCore", null] },
    material: { type: ["string", "null"], enum: ["copper", "aluminium", null] },
    section: { type: ["number", "null"] },
    parallelCount: { type: ["number", "null"] },
    insulation: { type: ["string", "null"], enum: ["70", "90", null] },
    phase: { type: ["string", "null"], enum: ["single", "three", null] },
    missingFields: { type: "array", items: { type: "string" } },
    notes: { type: "array", items: { type: "string" } }
  }
};
