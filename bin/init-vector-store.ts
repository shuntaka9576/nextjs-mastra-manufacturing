import fs from "node:fs";
import { embedText } from "@/src/lib/bedrock";
import { pinecone } from "@/src/lib/clinet";
import { saveToPinecone } from "@/src/lib/pinecorn";
import csv from "csv-parser";

const DATASET_PATH = "./data/dataset.csv";
const INDEX_NAME = "trouble-records";

type TroubleRecord = {
  date: string;
  line: string;
  machine: string;
  type: string;
  title: string;
  description: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
  expectedInquiry: string;
};

const ensureIndex = async () => {
  try {
    await pinecone.describeIndex(INDEX_NAME);
  } catch (_error) {
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: 1024,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-west-2",
        },
      },
    });
  }
};

const loadRecords = async (): Promise<TroubleRecord[]> => {
  const records: TroubleRecord[] = [];

  return new Promise<TroubleRecord[]>((resolve, reject) => {
    fs.createReadStream(DATASET_PATH)
      .pipe(csv())
      .on("data", (data: TroubleRecord) => records.push(data))
      .on("end", () => {
        resolve(records);
      })
      .on("error", (error) => reject(`error: ${error}`));
  });
};

const initPineconeIndex = async () => {
  try {
    await ensureIndex();

    const records = await loadRecords();

    console.log("Pineconeへのデータ保存を開始します...");
    let successCount = 0;
    let errorCount = 0;

    for (const [index, record] of records.entries()) {
      try {
        const content = `タイトル: ${record.title}\n説明: ${record.description}\n解決策: ${record.solution}`;
        const vector = await embedText(content);

        await saveToPinecone(
          `trouble-${record.date}-${record.line}-${record.machine}`,
          vector,
          {
            date: record.date,
            line: record.line,
            machine: record.machine,
            type: record.type,
            title: record.title,
            description: record.description,
            solution: record.solution,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            expectedInquiry: record.expectedInquiry,
          },
        );

        successCount++;
        if ((index + 1) % 5 === 0 || index === records.length - 1) {
          console.log(
            `${index + 1}/${records.length}件のレコードを処理しました`,
          );
        }
      } catch (error) {
        console.error(`レコード処理エラー (${record.title}): ${error}`);
        errorCount++;
      }
    }

    console.log(`処理結果: ${successCount}件成功, ${errorCount}件失敗`);
    console.log("初期化が完了しました");
  } catch (error) {
    console.error("初期化エラー:", error);
  }
};

initPineconeIndex()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
