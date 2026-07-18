import { NextResponse } from "next/server";

const geminiGenerateContentBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-3.5-flash";
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

  const result = await callGemini({
    instructions:
      "You are assisting an Israeli electrical cable ampacity calculator. Analyze only visible installation conditions. Do not perform cable ampacity calculations. Be conservative. If the photo is blurred, dark, unclear, or the installation is not sufficiently visible, mark photoQuality.isUsable=false. Recognize only these supported installation types: cable tray, ladder tray, wire mesh tray, cable channel or trench, direct burial in the ground, and cables fixed directly to a wall or ceiling. If unsupported or uncertain, set supported=false and installationType=unknown. Count only visible existing cables. Do not estimate hidden cables. If visible cables are in more than one layer, classify simply as grouped_or_piled. Give remaining space estimates only if visible scale and geometry are sufficient; otherwise status=unknown and estimateTextHebrew=null. Strict cover rule: a closed or covered cable tray/channel/trench may be recognized only when a continuous cover or lid over the cables is clearly and directly visible and confidently part of the cable tray. A tray side wall, nearby building wall, ceiling or floor slab, another tray above it, shadows, partial obstruction, unclear angle, or cables disappearing behind a structure are not evidence of a cover. Set coverVisible=true only with direct visible cover evidence. Set coverVisible=false when no cover is visible. Set coverVisible=unknown when the view is unclear or obstructed.",
    prompt: "נתח את תמונת התקנת הכבלים והחזר JSON בלבד לפי הסכמה.",
    imageDataUrl,
    schema: photoSchema
  });

  return NextResponse.json(normalizePhotoAnalysis(result));
}

async function interpretCableRequest(cableRequest: unknown) {
  if (typeof cableRequest !== "string" || cableRequest.trim().length < 2 || cableRequest.length > 500) {
    return jsonError("Please describe the cables you would like to add.", 400);
  }

  const result = await callGemini({
    instructions:
      "You are assisting an Israeli electrical cable ampacity calculator. Convert the user's requested cable text into calculator input fields only when explicit or strongly implied by cable notation. Do not perform ampacity calculations. Do not invent missing values. N2XY is copper XLPE and NA2XY is aluminium XLPE. A notation like 4x240 or 4×240 usually means one multicore three-phase cable with 240 mm2 conductors. A phrase like two N2XY 4x240 cables means parallelCount=2. If the material, section, insulation, phase, cable kind, or quantity cannot be determined, set that field to null and list it in missingFields.",
    prompt: `בקשת המשתמש: ${cableRequest}`,
    schema: cableSchema
  });

  return NextResponse.json(result);
}

async function callGemini({
  instructions,
  prompt,
  imageDataUrl,
  schema
}: {
  instructions: string;
  prompt: string;
  imageDataUrl?: string;
  schema: Record<string, unknown>;
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: instructions }]
    },
    contents: [
      {
        role: "user",
        parts: buildGeminiParts(prompt, imageDataUrl)
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: toGeminiSchema(schema)
    }
  };
  let response = await fetchGemini(model, apiKey, requestBody);

  if (!response.ok && fallbackModel !== model) {
    const errorText = await readProviderError(response);
    if (!isUnavailableModelError(errorText)) {
      throw new Error(errorText);
    }

    response = await fetchGemini(fallbackModel, apiKey, requestBody);
  }

  if (!response.ok) {
    throw new Error(await readProviderError(response));
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };
  const outputText = data.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).map((part) => part.text).find(Boolean);

  if (!outputText) {
    throw new Error("AI response did not include structured output.");
  }

  return parseGeminiJson(outputText);
}

function fetchGemini(selectedModel: string, apiKey: string, body: Record<string, unknown>) {
  return fetch(`${geminiGenerateContentBaseUrl}/${encodeURIComponent(selectedModel)}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function buildGeminiParts(prompt: string, imageDataUrl?: string) {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];

  if (imageDataUrl) {
    const parsedImage = parseImageDataUrl(imageDataUrl);
    parts.push({
      inlineData: {
        mimeType: parsedImage.mimeType,
        data: parsedImage.base64
      }
    });
  }

  return parts;
}

function parseImageDataUrl(imageDataUrl: string) {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(imageDataUrl);

  if (!match) {
    throw new Error("Invalid image data.");
  }

  return {
    mimeType: match[1] === "image/jpg" ? "image/jpeg" : match[1],
    base64: match[2]
  };
}

function parseGeminiJson(outputText: string) {
  const cleaned = outputText
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error("AI response was not valid JSON.");
  }

  const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI response JSON did not match the expected object shape.");
  }

  return parsed;
}

function normalizePhotoAnalysis(result: unknown) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return result;
  }

  const recognition = (result as { recognition?: unknown }).recognition;
  if (!recognition || typeof recognition !== "object" || Array.isArray(recognition)) {
    return result;
  }

  const nextRecognition = recognition as { coverVisible?: unknown };
  if (nextRecognition.coverVisible === "true") {
    nextRecognition.coverVisible = true;
  } else if (nextRecognition.coverVisible === "false") {
    nextRecognition.coverVisible = false;
  } else if (nextRecognition.coverVisible !== true && nextRecognition.coverVisible !== false) {
    nextRecognition.coverVisible = "unknown";
  }

  return result;
}

function toGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map((item) => toGeminiSchema(item));
  }

  if (!schema || typeof schema !== "object") {
    return schema;
  }

  const source = schema as Record<string, unknown>;
  const target: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (key === "additionalProperties") {
      continue;
    }

    if (key === "type") {
      if (Array.isArray(value)) {
        const nonNullTypes = value.filter((item) => item !== "null");
        target.type = toGeminiType(String(nonNullTypes[0] ?? "string"));
        if (value.includes("null")) {
          target.nullable = true;
        }
      } else {
        target.type = toGeminiType(String(value));
      }
      continue;
    }

    if (key === "enum" && Array.isArray(value)) {
      const enumValues = value.filter((item) => item !== null);
      if (enumValues.length !== value.length) {
        target.nullable = true;
      }
      target.enum = enumValues;
      continue;
    }

    target[key] = toGeminiSchema(value);
  }

  return target;
}

function toGeminiType(type: string) {
  const types: Record<string, string> = {
    object: "OBJECT",
    array: "ARRAY",
    string: "STRING",
    number: "NUMBER",
    integer: "INTEGER",
    boolean: "BOOLEAN"
  };

  return types[type] ?? type;
}

function isUnavailableModelError(errorText: string) {
  return /no longer available|not found|not supported|unavailable/i.test(errorText);
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
        "coverVisible",
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
        coverVisible: { type: "string", enum: ["true", "false", "unknown"] },
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
