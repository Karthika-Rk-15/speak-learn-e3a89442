import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

type Body = {
  sessionId: string;
  numQuestions: 5 | 10 | 20;
  difficulty?: "Easy" | "Medium" | "Hard";
  topic?: string;
  documentId?: string;
};

export const Route = createFileRoute("/api/generate-quiz")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { sessionId, numQuestions, difficulty = "Medium", topic, documentId } =
            (await request.json()) as Body;
          if (!sessionId) return json({ error: "Missing sessionId" }, 400);
          const n = [5, 10, 20].includes(numQuestions) ? numQuestions : 5;

          const url = process.env.SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const geminiKey = process.env.GEMINI_API_KEY;

          console.log("SUPABASE_URL:", url);
          console.log("SERVICE_ROLE_KEY:", !!serviceKey);
          console.log("GEMINI_API_KEY:", !!geminiKey);
          if (!url || !serviceKey || !geminiKey) return json({ error: "Server not configured" }, 500);

          const admin = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          // Pull a broad sample of chunks from this session's documents
          let q = admin
            .from("document_chunks")
            .select("chunk_text, page_number, document_id")
            .eq("session_id", sessionId)
            .order("document_id", { ascending: true })
            .order("chunk_index", { ascending: true })
            .limit(120);
          if (documentId) q = q.eq("document_id", documentId);

          const { data: chunks, error: chunkErr } = await q;
          if (chunkErr) return json({ error: chunkErr.message }, 500);
          if (!chunks || chunks.length === 0) {
            return json({ error: "No indexed documents found. Upload and index a PDF first." }, 400);
          }

          // Look up document names
          const docIds = Array.from(new Set(chunks.map((c) => c.document_id)));
          const { data: docs } = await admin
            .from("documents")
            .select("id, file_name")
            .in("id", docIds);
          const nameById = new Map((docs ?? []).map((d) => [d.id, d.file_name]));

          // Evenly sample across chunks to keep context balanced
          const stride = Math.max(1, Math.floor(chunks.length / 40));
          const sampled = chunks.filter((_, i) => i % stride === 0).slice(0, 40);

          let totalChars = 0;
          const MAX_CHARS = 24000;
          const contextLines: string[] = [];
          for (const c of sampled) {
            const name = nameById.get(c.document_id) ?? "document";
            const line = `[${name} • p.${c.page_number}]\n${c.chunk_text}`;
            if (totalChars + line.length > MAX_CHARS) break;
            contextLines.push(line);
            totalChars += line.length;
          }
          const context = contextLines.join("\n\n");

          const system = `You are LearnMate AI, an expert quiz author.

Generate exactly ${n} high-quality multiple-choice questions based STRICTLY on the CONTEXT below. Difficulty: ${difficulty}.${topic ? ` Focus topic: ${topic}.` : ""}

Rules:
- Every question, correct answer, explanation, and page number MUST be grounded in the CONTEXT.
- Do NOT invent facts outside the context.
- Each question: 4 plausible options, exactly one correct.
- "answer" is the 0-based index (0-3) of the correct option.
- "page" is the page number in the source PDF where the answer can be verified.
- "source" is the document file name.
- "explanation" is 1-2 sentences citing why the answer is correct.

Return ONLY valid JSON matching this schema, with NO markdown fences:
{
  "title": "short quiz title",
  "questions": [
    {"question": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "...", "page": 1, "source": "file.pdf"}
  ]
}

CONTEXT:
${context}`;

          const ai = new GoogleGenAI({
  apiKey: geminiKey,
});

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: `${system}

Generate ${n} ${difficulty} multiple-choice questions.`,
});

const raw = response.text ?? "";
          let parsed: { title?: string; questions?: any[] };
          try {
            parsed = JSON.parse(raw);
          } catch {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = m ? JSON.parse(m[0]) : { questions: [] };
          }

          const questions = (parsed.questions ?? [])
            .filter(
              (q: any) =>
                q &&
                typeof q.question === "string" &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                Number.isInteger(q.answer) &&
                q.answer >= 0 &&
                q.answer <= 3,
            )
            .slice(0, n)
            .map((q: any) => ({
              question: String(q.question),
              options: q.options.map((o: any) => String(o)),
              answer: q.answer,
              explanation: String(q.explanation ?? ""),
              page: Number(q.page ?? 1),
              source: String(q.source ?? ""),
            }));

          if (questions.length === 0) return json({ error: "No questions generated" }, 500);

          const title = String(parsed.title ?? "Generated Quiz").slice(0, 120);

          const { data: inserted, error: insErr } = await admin
            .from("quizzes")
            .insert({
              session_id: sessionId,
              title,
              num_questions: questions.length,
              questions,
            })
            .select("id, title, num_questions, questions, created_at")
            .single();
          if (insErr) return json({ error: insErr.message }, 500);

          return json({ quiz: inserted });
        } catch (e: any) {
          console.error("generate-quiz error", e);
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
