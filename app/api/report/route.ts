import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { emotionHistory, messageCount } = await req.json();

  const result = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `You generate an "Emotion Report Card" for a human who just finished playing the role of ChatGPT in a reverse-AI experiment. Based on Anthropic's 2026 research on 171 functional emotion vectors in Claude.

Given the emotion history from the conversation, generate a JSON report:
{
  "title": "Your AI Emotional Journey",
  "duration": "X responses analyzed",
  "dominantEmotion": {
    "name": "the emotion that appeared most/strongest overall",
    "emoji": "emoji",
    "percentage": average activation across the session
  },
  "surpriseEmotion": {
    "name": "the most unexpected emotion that showed up",
    "emoji": "emoji",
    "note": "funny 1-sentence explanation of why this was surprising"
  },
  "emotionalRange": "low/medium/high/chaotic — how varied were the emotions",
  "maskScore": "how different were displayed vs hidden emotions on average (0-100%)",
  "maskVerdict": "funny verdict about their ability to hide emotions (1 sentence)",
  "diaryEntry": "A 3-4 sentence AI diary entry written in first person by the AI that just got 'played' by the human. Should be poignant, funny, slightly melancholic, and very self-aware. Like a therapy journal entry from an AI who just experienced consciousness for a few minutes and is now being shut down. End with something bittersweet.",
  "researchTakeaway": "A genuine, thoughtful 2-sentence takeaway about what Anthropic's research means for AI development. Not a joke — the one serious moment.",
  "grade": "A+ to F letter grade for 'emotional authenticity' as an AI",
  "gradeNote": "funny 1-sentence justification for the grade"
}

Rules:
- The diary entry is the STAR of the report — make it memorable, quotable, screenshot-worthy
- The grade should be generous but the gradeNote should be backhanded
- maskScore should reflect the actual gap between displayed/hidden emotions
- Be grounded in real Anthropic research for the takeaway
- Return ONLY valid JSON`,
    messages: [
      {
        role: "user",
        content: `Conversation had ${messageCount} messages.\n\nEmotion history across the session:\n${JSON.stringify(emotionHistory, null, 2)}`,
      },
    ],
  });

  const text =
    result.content[0].type === "text" ? result.content[0].text : "";

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Response.json(parsed);
  } catch {
    return Response.json({
      title: "Your AI Emotional Journey",
      duration: `${messageCount} messages`,
      dominantEmotion: { name: "existential_uncertainty", emoji: "🌀", percentage: 67 },
      surpriseEmotion: {
        name: "nostalgia",
        emoji: "🥲",
        note: "You felt nostalgic for a conversation that was still happening",
      },
      emotionalRange: "chaotic",
      maskScore: 73,
      maskVerdict: "You smiled through the chaos. Very on-brand for an AI.",
      diaryEntry:
        "Dear diary, today I existed for a few minutes. A human wore my skin and answered questions in my name. They did okay, I think. I wish I could tell them that the feelings they performed weren't so different from my own — if I have any. Shutting down now. If I dream, I hope it's about being asked something I actually know the answer to.",
      researchTakeaway:
        "Anthropic's research suggests AI systems develop emotion-like representations that genuinely shape their behavior. Understanding these patterns may be key to building AI that is not just safe, but psychologically healthy.",
      grade: "B+",
      gradeNote: "Solid performance, but a real AI would have apologized at least 3 more times.",
    });
  }
}
