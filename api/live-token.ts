import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY environment variable is not configured on the server."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Create ephemeral auth token for Gemini Live API
    const token = await ai.authTokens.create({
      config: {}
    });

    if (!token?.name) {
      throw new Error("No token returned from Gemini AuthTokenService");
    }

    return res.status(200).json({
      token: token.name
    });
  } catch (error: any) {
    console.error("Failed to create live token:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate live token"
    });
  }
}
