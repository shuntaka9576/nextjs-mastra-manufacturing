import { embedText } from "@/src/lib/bedrock";
import { embedImage } from "@/src/lib/bedrock";
import { searchSimilarCasesFromPinecone } from "@/src/lib/pinecorn";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { Step, Workflow } from "@mastra/core/workflows";
import { generateText } from "ai";
import { z } from "zod";

export const factoryTroubleResarchWorkflow = new Workflow({
  name: "factoryTroubleResarchWorkflow",
  triggerSchema: z.object({
    text: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const fetchSimilarSearchStep = new Step({
  id: "fetchSimilarSearchStep",
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
    const text = context.triggerData.text;
    const image = context.triggerData.image;

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

    const results = await searchSimilarCasesFromPinecone(searchVector);

    return { results };
  },
});

export const llmFormatStep = new Step({
  id: "llmFormatStep",
  // outputSchema: z.object({
  //   text: z.string(),
  // }),
  execute: async ({ context }) => {
    const results = context.getStepResult(fetchSimilarSearchStep)?.results;

    const { text } = await generateText({
      model: bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0"),
      prompt: `

以下のフォーマットでを各事例ごとに上位2件を表示してください。
${results
  ?.map(
    (result) => `
# 類似事例
${result.title}
${result.description}
${result.date}
${result.line}
${result.machine}
${result.type}`,
  )
  .join("\n")}

# 事例 [番号]
📅 [日時]: [トラブルのタイトル]
📝 [トラブルの詳細を要約した説明]
💡 [実施された解決策]

[必要に応じて事例を追加...]

## 解決策総合サマリー
---
[ここに全事例から導かれた共通パターン、効果的な解決アプローチ、再発防止策などをまとめます]
    `,
    });

    return { text };
  },
});

factoryTroubleResarchWorkflow
  .step(fetchSimilarSearchStep)
  .then(llmFormatStep)
  .commit();
