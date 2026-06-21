import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type Body = { question: string; sessionId: string };

const BUCKET = "pdf-documents";
const MAX_CHARS_PER_DOC = 15000;
const MAX_TOTAL_CHARS = 40000;

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
          if (!url || !serviceKey || !aiKey) {
            return json({ error: "Server not configured" }, 500);
          }

          const admin = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          const { data: docs, error: docsErr } = await admin
            .from("documents")
            .select("id, file_name, file_path")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: false })
            .limit(5);

          if (docsErr) return json({ error: docsErr.message }, 500);
          if (!docs || docs.length === 0) {
            return json({
              answer:
                "You haven't uploaded any documents yet. Upload a PDF above and ask again.",
              sources: [],
            });
          }

          const { extractText, getDocumentProxy } = await import("unpdf");

          let combined = "";
          const sources: string[] = [];
          for (const d of docs) {
            if (combined.length >= MAX_TOTAL_CHARS) break;
            const { data: file, error: dlErr } = await admin.storage
              .from(BUCKET)
              .download(d.file_path);
            if (dlErr || !file) continue;
            try {
              const buf = new Uint8Array(await file.arrayBuffer());
              const pdf = await getDocumentProxy(buf);
              const { text } = await extractText(pdf, { mergePages: true });
              const snippet = (Array.isArray(text) ? text.join("\n") : text)
                .replace(/\s+/g, " ")
                .slice(0, MAX_CHARS_PER_DOC);
              if (snippet.trim()) {
                combined += `\n\n=== ${d.file_name} ===\n${snippet}`;
                sources.push(d.file_name);
              }
            } catch (e) {
              console.error("PDF parse failed for", d.file_name, e);
            }
          }

          if (!combined.trim()) {
            return json({
              answer:
                "I couldn't extract readable text from your uploaded PDFs (they may be scanned images). Try uploading a text-based PDF.",
              sources: [],
            });
          }

          const system = `You are LearnMate AI, a friendly tutor that answers questions strictly based on the user's uploaded study materials provided below.

Rules:
- Only use the provided document context to answer.
- If the answer isn't in the documents, say so honestly and suggest what to upload.
- Cite the document name(s) you used at the end.
- Use clean Markdown with short paragraphs and bullet points.

DOCUMENT CONTEXT:
${combined}`;

          const res = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${aiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  { role: "system", content: system },
                  { role: "user", content: question },
                ],
              }),
            },
          );

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            return json(
              { error: `AI request failed: ${res.status} ${text}` },
              res.status,
            );
          }
          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const answer = data.choices?.[0]?.message?.content ?? "";
          return json({ answer, sources });
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
