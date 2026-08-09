import { createFileRoute } from "@tanstack/react-router";

type Body = { documentId: string };

const BUCKET = "pdf-documents";
const CHUNK_SIZE = 700;
const CHUNK_OVERLAP = 120;
const EMBED_BATCH = 32;

// Must match the pgvector column dimension (1536) and the model used in ask-pdf.ts
const EMBED_MODEL = "openai/text-embedding-3-small";

function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(i, end));
    if (end >= clean.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function embedBatch(texts: string[], apiKey: string): Promise<number[][]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI rate limit reached. Please retry in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    throw new Error(`Embedding request failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { data?: { embedding: number[]; index?: number }[] };
  const items = data.data ?? [];
  if (items.length !== texts.length) {
    throw new Error("Embedding response count mismatch");
  }
  // Preserve request order when the provider returns an index
  const ordered = [...items].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return ordered.map((e) => e.embedding);
}

export const Route = createFileRoute("/api/embed-pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { documentId } = (await request.json()) as Body;
          if (!documentId) return json({ error: "Missing documentId" }, 400);

          const aiKey = process.env.LOVABLE_API_KEY;

          if (!aiKey) {
            return json({ error: "Server not configured: missing LOVABLE_API_KEY" }, 500);
          }

          const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");

          const { data: doc, error: docErr } = await admin
            .from("documents")
            .select("id, session_id, file_name, file_path")
            .eq("id", documentId)
            .maybeSingle();
          if (docErr || !doc) return json({ error: docErr?.message ?? "Document not found" }, 404);

          await admin.from("documents").update({ status: "Indexing" }).eq("id", documentId);

          const { data: file, error: dlErr } = await admin.storage.from(BUCKET).download(doc.file_path);
          if (dlErr || !file) {
            await admin.from("documents").update({ status: "Failed" }).eq("id", documentId);
            return json({ error: dlErr?.message ?? "Download failed" }, 500);
          }

          const { extractText, getDocumentProxy } = await import("unpdf");
          const buf = new Uint8Array(await file.arrayBuffer());
          const pdf = await getDocumentProxy(buf);
          const { text: pages } = await extractText(pdf, { mergePages: false });
          const pageArr: string[] = Array.isArray(pages) ? pages : [String(pages ?? "")];

          await admin.from("document_chunks").delete().eq("document_id", documentId);

          type Row = {
            document_id: string;
            session_id: string;
            page_number: number;
            chunk_index: number;
            chunk_text: string;
          };
          const rows: Row[] = [];
          let idx = 0;
          pageArr.forEach((pageText, pageIdx) => {
            const parts = chunkText(pageText ?? "");
            parts.forEach((c) => {
              rows.push({
                document_id: documentId,
                session_id: doc.session_id,
                page_number: pageIdx + 1,
                chunk_index: idx++,
                chunk_text: c,
              });
            });
          });

          if (rows.length === 0) {
            await admin.from("documents").update({ status: "No text" }).eq("id", documentId);
            return json({ ok: true, chunks: 0 });
          }

          for (let i = 0; i < rows.length; i += EMBED_BATCH) {
            const slice = rows.slice(i, i + EMBED_BATCH);
            const vectors = await embedBatch(
              slice.map((r) => r.chunk_text),
              aiKey!,
            );
            const payload = slice.map((r, j) => ({
              ...r,
              embedding: JSON.stringify(vectors[j] ?? []),
            }));

            const { error: insErr } = await admin.from("document_chunks").insert(payload);
            if (insErr) {
              await admin.from("documents").update({ status: "Failed" }).eq("id", documentId);
              return json({ error: insErr.message }, 500);
            }
          }

          await admin.from("documents").update({ status: "Indexed" }).eq("id", documentId);
          return json({ ok: true, chunks: rows.length });
        } catch (e: any) {
          console.error("embed-pdf error", e);
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
