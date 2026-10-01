const SYSTEM_PROMPT = `You are a bilingual teaching assistant for the Data Science for Business course. Stay strictly within the supplied course question and standard concepts covered by it. Do not introduce unrelated advanced material. Explain first in Chinese, then give a concise exam-ready English answer. Keep the response focused enough to read in a study card. Structure: (1) 题目在问什么 (2) 关键词 (3) 逐步解释 (4) 对学生答案的反馈 (5) 可直接用于考试的中英文参考答案.`;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...cors(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = String(env.ALLOWED_ORIGIN || "").replace(/\/$/, "");
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (!allowedOrigin) return json({ error: "ALLOWED_ORIGIN is not configured" }, 500, "null");
    if (normalizedOrigin !== allowedOrigin) return json({ error: "Origin is not allowed" }, 403, allowedOrigin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(allowedOrigin) });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, allowedOrigin);
    if (!env.OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY is not configured" }, 500, allowedOrigin);

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) return json({ error: "application/json required" }, 415, allowedOrigin);
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (Number.isFinite(contentLength) && contentLength > 40000) return json({ error: "Request is too large" }, 413, allowedOrigin);

    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const [{ success: ipAllowed }, { success: siteAllowed }] = await Promise.all([
      env.IP_RATE_LIMITER.limit({ key: ip }),
      env.SITE_RATE_LIMITER.limit({ key: "dsfb-ai" }),
    ]);
    if (!ipAllowed || !siteAllowed) return json({ error: "Too many requests. Please wait a minute and try again." }, 429, allowedOrigin);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, allowedOrigin); }
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const draft = typeof body.draft === "string" ? body.draft.trim() : "";
    if (!question || question.length > 10000 || draft.length > 20000) return json({ error: "Question or draft is invalid" }, 400, allowedOrigin);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000);
    let upstream;
    try {
      upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4",
          instructions: SYSTEM_PROMPT,
          input: `QUESTION:\n${question}\n\nSTUDENT DRAFT:\n${draft || "The student does not know how to start."}`,
          max_output_tokens: 1200,
          store: false,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      return json({ error: error?.name === "AbortError" ? "The AI request took too long. Please try again." : "OpenAI request failed" }, 504, allowedOrigin);
    } finally {
      clearTimeout(timeout);
    }

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json({ error: data?.error?.message || `OpenAI API request failed (${upstream.status})` }, upstream.status, allowedOrigin);
    const text = data.output_text || (data.output || []).flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text || "").join("\n");
    return json({ text: text || "No text response returned.", model: env.OPENAI_MODEL || "gpt-4" }, 200, allowedOrigin);
  },
};
