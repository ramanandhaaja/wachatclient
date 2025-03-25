import { Resend } from 'resend';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// Initialize Resend with API key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn('RESEND_API_KEY is not set. Email functionality will not work.');
}

const resend = new Resend(apiKey);

export const sendEmail = async (data: EmailPayload) => {
  try {
    const { to, subject, html } = data;
    
    // Check if required environment variables are set
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }
    
    const fromEmail = process.env.EMAIL_FROM;
    if (!fromEmail) {
      console.warn('EMAIL_FROM is not set. Using default email.');
    }
    
    console.log(`Sending email to ${to} from ${fromEmail || 'onboarding@resend.dev'}`);
    
    // Using the exact structure from Resend documentation
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail || 'onboarding@resend.dev',
      to: [to], // Resend expects an array of recipients
      subject,
      html,
    });
    
    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }
    
    console.log('Email sent successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error sending email:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};
