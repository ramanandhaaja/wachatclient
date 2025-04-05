import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Get tools for the LangChain chat agent
 */
export async function getTools() {
  // Helper tool to lookup product information
  const productInfoTool = new DynamicStructuredTool({
    name: 'product_information',
    description: 'Get information about WhatsBot AI and its features',
    schema: z.object({
      topic: z.string().describe('The specific topic or feature to get information about'),
    }),
    func: async ({ topic }) => {
      const productInfo = {
        'pricing': 'WhatsBot AI offers flexible pricing plans: Basic ($29/month), Professional ($49/month), and Enterprise (custom pricing).',
        'integration': 'Setting up WhatsBot AI is easy - just connect your WhatsApp Business API account and customize your bot behavior through our no-code interface.',
        'features': 'WhatsBot AI includes AI-powered conversations, 24/7 automated support, custom workflows, detailed analytics, and multi-language support.',
        'support': 'We offer 24/7 customer support via email, chat, and dedicated account managers for Enterprise plans.',
        'trial': 'Yes, WhatsBot AI offers a 14-day free trial with full access to all features. No credit card required.',
      }[topic.toLowerCase()] || 'I don\'t have specific information about that topic. Please check our website or contact support for more details.';
      
      return productInfo;
    },
  });

  return [productInfoTool];
}
