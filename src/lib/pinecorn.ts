import type { RecordMetadata } from "@pinecone-database/pinecone";
import { pinecone } from "./clinet";

const PINECONE_TRUBLE_RECORDS_INDEX_NAME = "trouble-records";

export async function saveToPinecone(
  id: string,
  vector: number[],
  metadata: RecordMetadata,
) {
  const res = await pinecone.describeIndex(PINECONE_TRUBLE_RECORDS_INDEX_NAME);
  const index = pinecone.index(
    PINECONE_TRUBLE_RECORDS_INDEX_NAME,
    `http://${res.host}`,
  );

  await index.upsert([
    {
      id,
      values: vector,
      metadata,
    },
  ]);
}

export async function searchSimilarCasesFromPinecone(
  vector: number[],
  limit = 10,
) {
  const res = await pinecone.describeIndex(PINECONE_TRUBLE_RECORDS_INDEX_NAME);

  const index = pinecone.index(
    PINECONE_TRUBLE_RECORDS_INDEX_NAME,
    `http://${res.host}`,
  );

  const searchResults = await index.query({
    vector: vector,
    topK: limit,
    includeMetadata: true,
  });

  if (!searchResults.matches || searchResults.matches.length === 0) {
    return [];
  }

  const formattedResults = searchResults.matches.map((match) => {
    if (!match.metadata) {
      throw new Error("metadata is undefined");
    }

    return {
      id: String(match.id),
      title: String(match.metadata.title),
      description: String(match.metadata.description),
      date: String(match.metadata.date),
      line: String(match.metadata.line),
      machine: String(match.metadata.machine),
      type: String(match.metadata.type),
      solution: String(match.metadata.solution),
      expectedInquiry: String(match.metadata.expectedInquiry),
      similarity: Number(match.score || 0),
    };
  });

  return formattedResults;
}
