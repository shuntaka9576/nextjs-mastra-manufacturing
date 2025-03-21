import { mastra } from "@/src/mastra";
import type { CoreMessage, UIMessage } from "ai";

function extractTextAndImage(messages: UIMessage[]): {
  text?: string;
  image?: string;
} {
  const lastMessage = messages[messages.length - 1];
  const text =
    lastMessage.content.trim() !== "" ? lastMessage.content : undefined;

  const attachment = lastMessage.experimental_attachments?.[0];
  const image =
    attachment?.contentType?.startsWith("image/") && attachment?.url
      ? attachment.url.split(",")[1]
      : undefined;

  return { text, image };
}

async function runAgent(text?: string, image?: string) {
  const agent = mastra.getAgent("factoryTroubleResarchAgent");
  const userMessages: CoreMessage[] = [];

  if (text) {
    userMessages.push({
      role: "user",
      content: [{ type: "text", text }],
    });
  }

  if (image) {
    userMessages.push({
      role: "user",
      content: [{ type: "image", image }],
    });
  }

  const stream = await agent.stream(userMessages);
  return stream.toDataStreamResponse();
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { text, image } = extractTextAndImage(messages);

  return await runAgent(text, image);
}
