import { evaluate } from "@mastra/evals";
import { ToneConsistencyMetric } from "@mastra/evals/nlp";
import { factoryTroubleResarchAgent } from "./factoryTroubleResarchAgent";

describe("factoryTroubleResarchAgent", () => {
  it("should return similar cases", async () => {
    const metric = new ToneConsistencyMetric();

    const result = await evaluate(
      factoryTroubleResarchAgent,
      "液体が漏れている",
      metric,
    );

    expect(result.score).toBe(1);
  });
});
