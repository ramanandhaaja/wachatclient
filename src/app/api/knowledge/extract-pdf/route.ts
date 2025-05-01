import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "langchain/document";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

async function extractTextFromPdfToPinecone(buffer: Buffer, filename: string, userId: string): Promise<string> {
  // 1. Extract text from PDF buffer using LangChain's PDFLoader
  const loader = new PDFLoader(new Blob([buffer]), { splitPages: false });
  const docs: Document[] = await loader.load();
  const fullText = docs.map(doc => doc.pageContent).join("\n");

  // 2. Chunk the text
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.createDocuments([fullText]);

  // 3. Embed the chunks
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY_SERVER,
  });
  const vectors = await embeddings.embedDocuments(chunks.map(chunk => chunk.pageContent));

  // 4. Upsert to Pinecone
  const index = pinecone.Index(process.env.PINECONE_INDEX!);
  const upserts = vectors.map((values, i) => ({
    id: `${userId}-${filename}-${i}`,
    values,
    metadata: {
      filename,
      chunk: i,
      text: chunks[i].pageContent,
      userId,
    },
  }));
  await index.namespace(userId).upsert(upserts);

  return `Inserted ${upserts.length} chunks for file ${filename}`;
}


async function extractTextFromPdfWithOpenAI(buffer: Buffer, filename: string): Promise<string> {
  // 1. Extract text from PDF buffer using LangChain's PDFLoader
  const loader = new PDFLoader(new Blob([buffer]), { splitPages: false });
  const docs: Document[] = await loader.load();
  const fullText = docs.map(doc => doc.pageContent).join("\n");

  // 2. Use OpenAI (via LangChain) to process/extract/structure the text
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    openAIApiKey: process.env.OPENAI_API_KEY_SERVER,
    temperature: 0,
  });

  const prompt = `Extract and return the full readable text from this PDF content. Clean it and remove unnecessary special characters. If it is a menu, preserve the structure as much as possible.`;

  const result = await llm.call([
    { role: "system", content: prompt },
    { role: "user", content: fullText }
  ]);

  return typeof result === "string" ? result : (result.content ?? "");
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      console.error("[extract-pdf API] No file uploaded or file is not a Blob", { file });
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    // Log file info
    const fileName = (file as File).name ?? "unknown";
    const fileSize = (file as File).size ?? "unknown";
    console.log(`[extract-pdf API] Received file: name=${fileName}, size=${fileSize}, type=${(file as File).type}`);
    const buffer = Buffer.from(await file.arrayBuffer());

    //const text = await extractTextFromPdfWithOpenAI(buffer, fileName);

    const text = await extractTextFromPdfToPinecone(buffer, fileName, userId);
    
    return NextResponse.json({ text });
  } catch (error) {
    console.error("[extract-pdf API] PDF extraction error:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }
}


