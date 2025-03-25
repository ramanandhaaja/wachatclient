import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    // Log environment variables
    console.log('Environment variables:');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set (length: ' + process.env.RESEND_API_KEY.length + ')' : 'Not set');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
    
    // Get email from query parameters
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to send test email to: ${email}`);
    
    // Send a test email
    const result = await sendEmail({
      to: email,
      subject: "Test Email from Next.js App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Test Email</h1>
          <p>This is a test email from your Next.js application.</p>
          <p>If you're receiving this, your email configuration is working correctly!</p>
          <p>Time sent: ${new Date().toISOString()}</p>
          <p>Using API Key: ${process.env.RESEND_API_KEY ? 'Yes (masked)' : 'No'}</p>
          <p>From Email: ${process.env.EMAIL_FROM || 'Default'}</p>
        </div>
      `,
    });
    
    console.log('Email test result:', result);
    
    return NextResponse.json(
      { 
        message: "Test email sent successfully", 
        result,
        env: {
          RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set (masked)' : 'Not set',
          EMAIL_FROM: process.env.EMAIL_FROM || 'Not set',
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    
    // Return detailed error information
    return NextResponse.json(
      { 
        error: "Failed to send test email", 
        details: error instanceof Error ? error.message : String(error),
        env: {
          RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set (masked)' : 'Not set',
          EMAIL_FROM: process.env.EMAIL_FROM || 'Not set',
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set'
        }
      },
      { status: 500 }
    );
  }
}
