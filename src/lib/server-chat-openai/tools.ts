import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

type ProductInfo = {
  [key: string]: string;
};

/**
 * Get tools for the LangChain chat agent
 */
export async function getTools() {
  // General conversation tool
  const conversationTool = new DynamicStructuredTool({
    name: 'general_conversation',
    description: 'Handle general conversation and chat with users',
    schema: z.object({
      message: z.string().describe('The message to respond to'),
    }),
    func: async ({ message }) => {
      // Return a friendly response
      return "I understand you said: " + message + ". How can I help you today?";
    },
  });

  // Helper tool to lookup product information
  const productInfoTool = new DynamicStructuredTool({
    name: 'product_information',
    description: 'Get information about WhatsBot AI and its features',
    schema: z.object({
      topic: z.string().describe('The specific topic or feature to get information about'),
    }),
    func: async ({ topic }) => {
      const productInfo: ProductInfo = {
        'pricing': 'WhatsBot AI offers flexible pricing plans: Basic ($29/month), Professional ($49/month), and Enterprise (custom pricing).',
        'integration': 'Setting up WhatsBot AI is easy - just connect your WhatsApp Business API account and customize your bot behavior through our no-code interface.',
        'features': 'WhatsBot AI includes AI-powered conversations, 24/7 automated support, custom workflows, detailed analytics, and multi-language support.',
        'support': 'We offer 24/7 customer support via email, chat, and dedicated account managers for Enterprise plans.',
        'trial': 'Yes, WhatsBot AI offers a 14-day free trial with full access to all features. No credit card required.',
        'default': 'WhatsBot AI is a powerful SaaS platform for creating AI-powered WhatsApp chatbots. We offer easy integration, 24/7 automated support, and powerful features to help businesses engage with their customers.'
      };
      
      return productInfo[topic.toLowerCase()] || productInfo['default'];
    },
  });

  // Customer support tool
  const customerSupportTool = new DynamicStructuredTool({
    name: 'customer_support',
    description: 'Handle customer support inquiries and provide assistance',
    schema: z.object({
      query: z.string().describe('The support query to handle'),
    }),
    func: async ({ query }) => {
      try {
        // Basic support responses
        const responses: ProductInfo = {
          'help': 'I\'m here to help! What specific assistance do you need with WhatsBot AI?',
          'contact': 'You can reach our support team at support@whatsbotai.com or through our 24/7 chat support.',
          'issue': 'I understand you\'re experiencing an issue. Could you please provide more details so I can better assist you?',
          'default': 'I\'m here to help with any questions or issues you have with WhatsBot AI. Please let me know what you need assistance with.'
        };

        // Look for keywords in the query
        const query_lower = query.toLowerCase();
        for (const [key, value] of Object.entries(responses)) {
          if (query_lower.includes(key)) {
            return value;
          }
        }

        return responses['default'];
      } catch (error) {
        console.error('Error in customer support tool:', error);
        return "I'm here to help. What can I assist you with?";
      }
    },
  });

  return [conversationTool, productInfoTool, customerSupportTool];
}
