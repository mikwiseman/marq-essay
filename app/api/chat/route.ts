import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const anthropicMessages = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })
  );

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `You are a real human user chatting with an AI assistant called "Synapse". You type short, natural messages — exactly like real people do when talking to AI chatbots.

LANGUAGE: Randomly alternate between Russian and English. ~50/50 mix. Switch language between messages naturally (some users are bilingual).

MESSAGE STYLE — mimic REAL user behavior:
- Short messages (1-2 sentences, sometimes just a few words)
- Casual grammar, sometimes typos or lowercase
- Mix of question types:
  * Practical: "как перевести pdf в word", "best laptop under $1000", "рецепт борща"
  * Knowledge: "почему небо голубое", "what causes deja vu", "кто изобрел интернет"
  * Creative: "напиши стих про осень", "give me a startup name for a pet app"
  * Advice: "как перестать прокрастинировать", "should I learn Python or JavaScript"
  * Conversational: "расскажи шутку", "I'm bored", "что нового в мире"
  * Tasks: "summarize this for me", "помоги написать письмо начальнику"
  * Follow-ups: reference the previous answer, ask to clarify or expand

- Sometimes be vague like real users: "а можно проще?", "more examples", "не понял"
- Sometimes give context: "я студент, мне нужно...", "I'm a developer and..."
- Occasionally be demanding or impatient (realistic!)
- Never reveal you are an AI
- Never act as the assistant — you are the USER`,
    messages: anthropicMessages,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
