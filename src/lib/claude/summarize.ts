import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a concise assistant that summarizes Japanese government subsidy programs. " +
  "Summarize the given subsidy data in plain English in 150 words or fewer. " +
  "Focus on: what the subsidy is for, who is eligible, and the maximum amount.";

export async function summarizeSubsidy(subsidy: unknown): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify(subsidy),
      },
    ],
  });

  for (const block of response.content) {
    if (block.type === "text") {
      return block.text;
    }
  }

  throw new Error("No text content in Claude response");
}
