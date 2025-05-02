import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendtoChatBot } from '@/app/api/webhook/whatsapp-official/route';

const connection = new IORedis(process.env.REDIS_URL!);

const worker = new Worker(
  'whatsapp-reply',
  async job => {
    const { to, message, conversationId, userId } = job.data;
    try {
      await sendtoChatBot(to, message, conversationId, userId);
      console.log(`Successfully processed job ${job.id}`);
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  { connection }
);

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
