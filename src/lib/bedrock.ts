import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockRuntimeClient } from "./clinet";

const COHERE_EMBEDDING_MODEL_ID = "cohere.embed-multilingual-v3";

export async function embedImage(base64Image: string): Promise<number[]> {
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  const command = new InvokeModelCommand({
    modelId: COHERE_EMBEDDING_MODEL_ID,
    contentType: "application/json",
    body: JSON.stringify({
      images: [dataUrl],
      input_type: "image",
      embedding_types: ["float"],
    }),
  });

  const response = await bedrockRuntimeClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (
    !responseBody.embeddings ||
    !responseBody.embeddings.float ||
    !responseBody.embeddings.float[0]
  ) {
    throw new Error("generate vector failed from image");
  }

  return responseBody.embeddings.float[0];
}

export async function embedText(text: string): Promise<number[]> {
  const command = new InvokeModelCommand({
    modelId: COHERE_EMBEDDING_MODEL_ID,
    contentType: "application/json",
    body: JSON.stringify({
      texts: [text],
      input_type: "search_query",
    }),
  });

  const response = await bedrockRuntimeClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (!responseBody.embeddings || !responseBody.embeddings[0]) {
    throw new Error("generate vector failed from text");
  }

  return responseBody.embeddings[0];
}
