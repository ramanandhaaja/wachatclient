import { createChatAgent } from './agent';

export async function processMessage(
  sessionId: string,
  message: string,
  userId: string,
): Promise<string> {
  try {
    const agent = await createChatAgent(sessionId, userId);

    const result = await agent.generate(message, {
      memory: {
        thread: sessionId,
        resource: userId,
      },
    });

    return result.text || "I apologize, but I couldn't process your message properly.";
  } catch (error) {
    console.error('[processMessage] Error:', error);
    return 'I apologize, but an error occurred while processing your message.';
  }
}
