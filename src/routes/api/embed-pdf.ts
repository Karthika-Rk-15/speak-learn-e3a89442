import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";


type Body = { documentId: string };

const BUCKET = "pdf-documents";
const CHUNK_SIZE = 700;
const CHUNK_OVERLAP = 120;
const EMBED_BATCH = 32;

const GEMINI_EMBED_MODEL = "gemini-embedding-001";    

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



async function embedBatch(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:batchEmbedContents?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${GEMINI_EMBED_MODEL}`,
        content: { parts: [{ text }] },
      })),
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini embedding request failed (${response.status}): ${errText}`);
  }

 const data = (await response.json()) as {
  embeddings?: { values: number[] }[];
};

console.log("========== GEMINI RESPONSE ==========");
console.log(JSON.stringify(data, null, 2));
console.log("=====================================");

if (!data.embeddings || data.embeddings.length !== texts.length) {
  throw new Error("Gemini embedding response malformed or count mismatch");
}

return data.embeddings.map((e) => e.values);

}
export const Route = createFileRoute("/api/embed-pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
  try {

  
          const { documentId } = (await request.json()) as Body;
          if (!documentId) return json({ error: "Missing documentId" }, 400);

          console.log("process.env =", process.env);

          const url = process.env.SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const geminiKey = process.env.GEMINI_API_KEY;
          console.log("Gemini Key:", geminiKey);
          console.log("All ENV:", process.env);

console.log("========== ENV ==========");
console.log("SUPABASE_URL =", url);
console.log("SERVICE_ROLE exists =", !!serviceKey);
console.log("GEMINI_KEY exists =", !!geminiKey);
console.log("All ENV keys =", Object.keys(process.env));
console.log("=========================");

if (!url || !serviceKey || !geminiKey)
  return json({ error: "Server not configured" }, 500);
          const admin = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          const { data: doc, error: docErr } = await admin
            .from("documents")
            .select("id, session_id, file_name, file_path")
            .eq("id", documentId)
            .maybeSingle();
          if (docErr || !doc) return json({ error: docErr?.message ?? "Document not found" }, 404);

          // Mark processing
          await admin.from("documents").update({ status: "Indexing" }).eq("id", documentId);

          const { data: file, error: dlErr } = await admin.storage.from(BUCKET).download(doc.file_path);
          if (dlErr || !file) {
            await admin.from("documents").update({ status: "Failed" }).eq("id", documentId);
            return json({ error: dlErr?.message ?? "Download failed" }, 500);
          }

          const { extractText, getDocumentProxy } = await import("unpdf");
          const buf = new Uint8Array(await file.arrayBuffer());
          const pdf = await getDocumentProxy(buf);
          // Extract per-page text
          const { text: pages } = await extractText(pdf, { mergePages: false });
          const pageArr: string[] = Array.isArray(pages) ? pages : [String(pages ?? "")];

          // Wipe any old chunks for this doc
          await admin.from("document_chunks").delete().eq("document_id", documentId);

          // Build chunks with page tracking
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

          // Embed in batches and insert
          for (let i = 0; i < rows.length; i += EMBED_BATCH) {
            const slice = rows.slice(i, i + EMBED_BATCH);
           console.log("About to embed...");

const vectors = await embedBatch(
  slice.map((r) => r.chunk_text),
  geminiKey
);

console.log("Embedding complete.");

console.log("Vectors:", vectors.length);
console.log("First vector length:", vectors[0]?.length);

const payload = slice.map((r, j) => ({
  ...r,
  embedding: vectors[j],
}));

console.log("First payload:", payload[0]);

const { error: insErr } = await admin
  .from("document_chunks")
  .insert(payload);

if (insErr) {
  console.log("Insert Error:", insErr);

  await admin
    .from("documents")
    .update({ status: "Failed" })
    .eq("id", documentId);

  return json({ error: insErr.message }, 500);
}
          }

          await admin.from("documents").update({ status: "Indexed" }).eq("id", documentId);
          return json({ ok: true, chunks: rows.length });
        } catch (e: any) {
  console.error("========== FULL ERROR ==========");
  console.error(e);
  console.error(e?.stack);
  console.error("================================");

  return json(
    {
      error: e?.message ?? "Unknown error",
      stack: e?.stack,
    },
    500
  );
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