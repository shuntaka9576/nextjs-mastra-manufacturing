import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { Pinecone } from "@pinecone-database/pinecone";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "local-api-key";
const PINECONE_CONTROLLER_HOST_URL = "http://localhost:5080";

export const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
  controllerHostUrl:
    process.env.PINECONE_CONTROLLER_HOST_URL || PINECONE_CONTROLLER_HOST_URL,
});

export const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: "us-west-2",
});

export const bedrock = createAmazonBedrock({
  region: "us-west-2",
});
