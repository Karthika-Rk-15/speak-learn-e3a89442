import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type Body = { question: string; sessionId: string };

const TOP_K = 6;

export const Route = createFileRoute("/api/ask-pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { question, sessionId } = (await request.json()) as Body;
          if (!question?.trim() || !sessionId) {
            return json({ error: "Missing question or sessionId" }, 400);
          }

          const url = process.env.SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const aiKey = process.env.LOVABLE_API_KEY;
          const missing = [
            !url && "SUPABASE_URL",
            !serviceKey && "SUPABASE_SERVICE_ROLE_KEY",
            !aiKey && "LOVABLE_API_KEY",
          ].filter(Boolean);
          if (missing.length) {
            return json({ error: `Server not configured: missing ${missing.join(", ")}` }, 500);
          }

          const admin = createClient(url!, serviceKey!, {
            auth: { persistSession: false, autoRefreshToken: false },
          });


          // 1) Embed the question
          const embRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
            method: "POST",
            headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "openai/text-embedding-3-small",
              input: question,
            }),
          });
          if (!embRes.ok) {
            const t = await embRes.text().catch(() => "");
            return json({ error: `Embedding failed: ${embRes.status} ${t}` }, 500);
          }
          const embData = (await embRes.json()) as { data: { embedding: number[] }[] };
          const queryEmbedding = embData.data?.[0]?.embedding;
          if (!queryEmbedding) return json({ error: "No embedding returned" }, 500);

          // 2) Vector similarity search scoped to session
          const { data: matches, error: matchErr } = await admin.rpc("match_document_chunks", {
            query_embedding: queryEmbedding as unknown as string,
            match_session_id: sessionId,
            match_count: TOP_K,
          });
          if (matchErr) return json({ error: matchErr.message }, 500);

          const hits = (matches ?? []) as Array<{
            id: string;
            document_id: string;
            page_number: number;
            chunk_index: number;
            chunk_text: string;
            similarity: number;
          }>;

          if (hits.length === 0) {
            return json({
              answer: "I could not find this information in your uploaded documents.",
              citations: [],
            });
          }

          // 3) Look up document names for citations
          const docIds = Array.from(new Set(hits.map((h) => h.document_id)));
          const { data: docs } = await admin
            .from("documents")
            .select("id, file_name")
            .in("id", docIds);
          const nameById = new Map((docs ?? []).map((d) => [d.id, d.file_name]));

          // 4) Build compact context
          const context = hits
            .map((h, i) => {
              const name = nameById.get(h.document_id) ?? "document";
              return `[#${i + 1} • ${name} • p.${h.page_number}]\n${h.chunk_text}`;
            })
            .join("\n\n");

          const system = `You are LearnMate AI, a friendly and knowledgeable tutor.

Your task: Answer the user's question by SYNTHESIZING information from the CONTEXT below.

Guidelines:
- READ ALL chunks carefully and combine related information across them to form a complete answer, even if no single chunk states it verbatim.
- If the concept is described, explained, or characterized across one or more chunks (e.g. features, purpose, components, examples), SYNTHESIZE a clear, concise definition or explanation in your own words — do NOT require an exact textual definition to be present.
- Ground every claim in the provided context. Do NOT introduce facts, examples, or details that are not supported by the chunks.
- Cite the chunk numbers you drew from inline, like [#1], [#3].
- Prefer a concise definition first, then a short expansion (bullets or a brief paragraph) when helpful.
- Only if the chunks genuinely contain no relevant information about the question, reply exactly: "I could not find this information in your uploaded documents." Do NOT use this fallback when partial or related information IS present — synthesize what's there instead.

CONTEXT:
${context}`;

          const chatRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: system },
                { role: "user", content: question },
              ],
            }),
          });
          if (!chatRes.ok) {
            const t = await chatRes.text().catch(() => "");
            return json({ error: `AI request failed: ${chatRes.status} ${t}` }, chatRes.status);
          }
          const data = (await chatRes.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const answer = data.choices?.[0]?.message?.content ?? "";

          const citations = hits.map((h, i) => ({
            ref: i + 1,
            document_id: h.document_id,
            document_name: nameById.get(h.document_id) ?? "document",
            page_number: h.page_number,
            snippet: h.chunk_text.slice(0, 220),
            similarity: Number(h.similarity?.toFixed?.(3) ?? h.similarity),
          }));

          return json({ answer, citations });
        } catch (e: any) {
          console.error("ask-pdf error", e);
          return json({ error: e?.message ?? "Unknown error" }, 500);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
