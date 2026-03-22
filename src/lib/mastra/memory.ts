import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/pg';

export const memory = new Memory({
  storage: new PostgresStore({
    id: 'wa-chatbot-storage',
    connectionString: process.env.DATABASE_URL!,
  }),
  options: {
    lastMessages: 20,
  },
});
