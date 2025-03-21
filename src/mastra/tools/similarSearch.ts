import { embedImage, embedText } from "@/src/lib/bedrock";
import { searchSimilarCasesFromPinecone } from "@/src/lib/pinecorn";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const similarCasesTool = createTool({
  id: "find-similar-cases",
  description: "テキストまたはbase64形式の画像から類似事例を検索します。",
  inputSchema: z.object({
    text: z.string().optional().describe("検索テキスト"),
    image: z.string().optional().describe("画像データ(base64)"),
    topK: z.number().optional().describe("返す結果の数"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        date: z.string(),
        line: z.string(),
        machine: z.string(),
        type: z.string(),
        solution: z.string(),
        expectedInquiry: z.string(),
        similarity: z.number(),
      }),
    ),
  }),
  execute: async ({ context }) => {
    const { text, image, topK } = context;
    if (!text && !image) {
      throw new Error("text or image is required");
    }

    let searchVector: number[] | undefined = undefined;
    if (image) {
      searchVector = await embedImage(image);
    } else if (text) {
      searchVector = await embedText(text);
    } else if (text && image) {
      const textVector = await embedText(text);
      const imageVector = await embedImage(image);

      searchVector = textVector.map((val, i) => (val + imageVector[i]) / 2);
    }

    if (!searchVector) {
      throw new Error("searchVector is required");
    }

    const results = await searchSimilarCasesFromPinecone(searchVector, topK);

    return { results };
  },
});
