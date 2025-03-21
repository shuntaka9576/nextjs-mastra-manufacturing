import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { factoryTroubleResarchAgent } from "@/src/mastra/agents/factoryTroubleResarchAgent";
import { factoryTroubleResarchWorkflow } from "@/src/mastra/workflow/factoryTroubleResarchWorkflow";
import { LibSQLStore } from "@mastra/core/storage/libsql";

const storage = new LibSQLStore({
  config: {
    url: "file:.db/storage.db",
  },
});

export const mastra = new Mastra({
  agents: { factoryTroubleResarchAgent },
  workflows: { factoryTroubleResarchWorkflow },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
  storage,
  telemetry: {
    serviceName: "manifacture-agents-app",
    enabled: true,
    sampling: {
      type: "always_on",
    },
    export: {
      type: "otlp",
      endpoint: "http://localhost:4318/v1/traces",
    },
  },
});
