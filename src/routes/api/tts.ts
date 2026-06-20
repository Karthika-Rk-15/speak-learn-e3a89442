import { createFileRoute } from "@tanstack/react-router";

type Body = { text: string; voiceId?: string };

const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL"; // Sarah

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, voiceId = DEFAULT_VOICE } = (await request.json()) as Body;
        if (!text?.trim()) {
          return new Response("Missing text", { status: 400 });
        }
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return new Response("ElevenLabs not configured", { status: 500 });
        }

        // Strip markdown for cleaner speech
        const cleaned = text
          .replace(/```[\s\S]*?```/g, "")
          .replace(/[#*_`>]/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .slice(0, 4000);

        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: cleaned,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.3,
                use_speaker_boost: true,
              },
            }),
          },
        );

        if (!res.ok) {
          const err = await res.text().catch(() => "");
          return new Response(err || `TTS failed: ${res.status}`, { status: res.status });
        }

        const audio = await res.arrayBuffer();
        return new Response(audio, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
