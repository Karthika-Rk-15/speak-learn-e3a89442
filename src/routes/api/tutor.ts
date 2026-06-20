import { createFileRoute } from "@tanstack/react-router";

type Body = { question: string; level?: "beginner" | "intermediate" | "advanced" };

export const Route = createFileRoute("/api/tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { question, level = "intermediate" } = (await request.json()) as Body;
        if (!question?.trim()) {
          return new Response(JSON.stringify({ error: "Missing question" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(JSON.stringify({ error: "AI not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const system = `You are LearnMate AI, a friendly, encouraging educational tutor.
The learner's level is: ${level.toUpperCase()}.
Adapt vocabulary and depth to that level.

ALWAYS structure your response in clean Markdown with these four sections, using exactly these headings:

## Explanation
A clear, ${level}-appropriate explanation of the concept.

## Real World Example
A concrete, relatable example.

## Important Points
- Key bullet points the learner must remember.

## Summary
A short 2-3 sentence recap.

Be warm, concise, and avoid jargon unless you define it.`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: system },
              { role: "user", content: question },
            ],
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return new Response(
            JSON.stringify({ error: `AI request failed: ${res.status} ${text}` }),
            { status: res.status, headers: { "Content-Type": "application/json" } },
          );
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const answer = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ answer }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
