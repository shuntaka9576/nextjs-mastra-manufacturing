import { mastra } from "@/src/mastra";
import { attachListeners } from "@mastra/evals";

beforeAll(async () => {
  await attachListeners(mastra);
});
