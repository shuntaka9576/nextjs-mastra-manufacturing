// import { mastra } from "@/src/mastra";
import { mastra } from "@/src/mastra";
import { llmFormatStep } from "@/src/mastra/workflow/factoryTroubleResarchWorkflow";
import { NextResponse } from "next/server";

interface RequestData {
  message?: string;
  image?: File;
}

async function convertImageToBase64(image: File): Promise<string> {
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

async function extractRequestData(req: Request): Promise<RequestData> {
  const res: RequestData = {
    message: undefined,
    image: undefined,
  };

  const formData = await req.formData();

  const message = formData.get("message");
  if (message) res.message = message as string;

  const image = formData.get("image");
  if (image) res.image = image as File;

  return res;
}

async function executeWorkflow(message?: string, image?: File) {
  const base64Image = image ? await convertImageToBase64(image) : undefined;

  const workflow = mastra.getWorkflow("factoryTroubleResarchWorkflow");
  const { start } = workflow.createRun();

  const workflowResult = await start({
    triggerData: {
      text: message,
      image: base64Image,
    },
  });

  const lastStepResult = workflowResult.results[llmFormatStep.id];
  if (lastStepResult.status !== "success") {
    return "エラーが発生しました";
  }
  console.log(`lastStepResult: ${JSON.stringify(lastStepResult.output)}`);

  return lastStepResult.output.text;
}

export async function POST(req: Request) {
  const { message, image } = await extractRequestData(req);
  const result = await executeWorkflow(message, image);

  return NextResponse.json({
    content: result,
    role: "assistant",
  });
}
