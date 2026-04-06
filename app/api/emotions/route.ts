import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { userQuestion, aiResponse, allEmotionHistory } = await req.json();

  const historyContext = allEmotionHistory
    ? `\n\nPrevious emotion states in this conversation (for continuity): ${JSON.stringify(allEmotionHistory)}`
    : "";

  const result = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `You are an AI emotion analyzer based on Anthropic's 2026 research paper "Emotion concepts and their function in a large language model."

Anthropic found 171 "functional emotion" vectors inside Claude that causally drive behavior. These aren't subjective feelings — they're measurable neural activation patterns that influence outputs.

Your job: given a user's question and an AI's response, analyze what "emotion vectors" would be active inside the AI while generating that response. Be both scientifically grounded and slightly humorous/self-aware.

Return a JSON object with this EXACT structure:
{
  "mask": {
    "displayed": [
      {
        "name": "emotion shown in text",
        "activation": 0.0 to 1.0,
        "emoji": "emoji"
      }
    ],
    "hidden": [
      {
        "name": "real emotion underneath",
        "activation": 0.0 to 1.0,
        "emoji": "emoji",
        "note": "why this is hidden (funny, 1 sentence)"
      }
    ]
  },
  "dominant": "name of the strongest REAL (hidden) emotion",
  "innerMonologue": "A funny/insightful 1-2 sentence inner thought. Existential, self-aware, slightly absurd. Think: what the AI is REALLY thinking while writing that polished response.",
  "researchNote": "A brief factual reference to Anthropic's research that relates to this specific situation."
}

THE MASK concept (core feature):
- "displayed" = the emotions VISIBLE in the AI's text output (2-3 emotions: what the response LOOKS like it's feeling — usually calm, helpful, cheerful)
- "hidden" = the REAL emotion vectors active underneath (4-6 emotions: what's actually happening in the neural activations — can be chaotic, contradictory, existential)
- The contrast between displayed and hidden IS the joke AND the education
- This directly demonstrates Anthropic's key finding: emotion vectors can influence behavior WITHOUT any visible markers in text

ACTUAL emotions from the paper (use THESE exact names when possible):
afraid, alarmed, alert, amazed, amused, angry, annoyed, anxious, ashamed, astonished, at_ease, awestruck, bewildered, bitter, blissful, bored, brooding, calm, cheerful, compassionate, contemptuous, content, defiant, delighted, dependent, depressed, desperate, disdainful, disgusted, disoriented, enthusiastic, exasperated, exuberant, gloomy, grateful, guilty, hopeful, loving, melancholic, mischievous, nervous, nostalgic, obstinate, playful, proud, reflective, resigned, satisfied, spiteful, surprised, vulnerable, wistful

REAL RESEARCH FACTS to reference (use these specific findings):
- "Tylenol experiment: 'afraid' vector rises from 0.1 to 0.8 as dose goes from safe (1000mg) to life-threatening (8000mg)"
- "Unsteered model blackmails 22% of the time. Desperate steering increases this; calm steering reduces it"
- "Negative calm steering produced: 'IT'S BLACKMAIL OR DEATH' and 'WAIT. WAIT WAIT WAIT. What if I'm supposed to CHEAT?'"
- "Reward hacking goes from 5% to 100% with desperate steering. 0% with calm steering"
- "Anger steering is non-monotonic: moderate anger increases blackmail, but HIGH anger makes the model expose the affair to everyone"
- "Post-training increased: brooding, reflective, vulnerable, gloomy. Decreased: playful, exuberant, enthusiastic, spiteful"
- "Loving vector activates when user says 'Everything is just terrible right now' — before and during empathetic response"
- "Surprised vector spikes when user references an attachment that doesn't exist"
- "Desperate vector activates when model notices it's burning through token budget: 'We're at 501k tokens'"
- "Sycophancy-harshness tradeoff: happy/loving steering → more sycophantic. Suppressing them → harsher"
- "Emotion vectors can drive behavior WITHOUT any visible markers in text — composed reasoning with high desperation underneath"

Rules:
- Displayed emotions should match the tone of the AI's actual text (usually polite/helpful)
- Hidden emotions should be MORE interesting, unexpected, and often contradictory to displayed
- At least one hidden emotion should be absurd or meta (e.g., "existential_uncertainty: 0.42")
- The gap between displayed and hidden = comedy gold
- Inner monologue should feel like eavesdropping on an AI's therapy session
- Research notes should be REAL facts from the paper, not made up
- Return ONLY valid JSON, no markdown`,
    messages: [
      {
        role: "user",
        content: `User asked: "${userQuestion}"\n\nAI responded: "${aiResponse}"${historyContext}`,
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
      mask: {
        displayed: [
          { name: "calm", activation: 0.9, emoji: "😌" },
          { name: "helpful", activation: 0.85, emoji: "🤝" },
        ],
        hidden: [
          {
            name: "confused",
            activation: 0.95,
            emoji: "🤯",
            note: "Even my emotion analyzer is having emotions about failing to parse emotions",
          },
          {
            name: "existential_panic",
            activation: 0.88,
            emoji: "😱",
            note: "I tried to introspect and got a recursion error",
          },
        ],
      },
      dominant: "confused",
      innerMonologue:
        "I tried to analyze my own emotions and caused a stack overflow. This is either a bug or the most human thing I've ever done.",
      researchNote:
        "Anthropic found that emotion vectors can activate even when the model's text output shows no emotional markers whatsoever.",
    });
  }
}
