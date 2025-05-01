import { Pinecone } from "@pinecone-database/pinecone";

// Singleton Pinecone client for use throughout the app
export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
