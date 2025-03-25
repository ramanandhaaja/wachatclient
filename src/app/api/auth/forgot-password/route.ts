import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

// Define a schema for input validation
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the input
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    console.log(`Processing password reset request for email: ${email}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // For security reasons, don't reveal if the user exists or not
    // Just return a success response regardless
    if (!user) {
      console.log(`User with email ${email} not found`);
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link" },
        { status: 200 }
      );
    }
    
    console.log(`User found: ${user.id}`);
    
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    console.log(`Generated reset token: ${resetToken.substring(0, 10)}...`);
    
    // Save the reset token to the user using raw SQL
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "resetToken" = ${resetToken}, "resetTokenExpires" = ${resetTokenExpires} 
      WHERE "id" = ${user.id}
    `;
    
    console.log(`Updated user with reset token`);
    
    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Using Resend API Key: ${process.env.RESEND_API_KEY ? "Set" : "Not set"}`);
    console.log(`Email From: ${process.env.EMAIL_FROM || "Not set"}`);
    
    // Send email with reset link
    try {
      console.log(`Attempting to send email to: ${email}`);
      
      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #333; text-align: center;">Password Reset</h1>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${resetUrl}</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `,
      });
      
      console.log(`Email sent successfully`);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't reveal the error to the client for security reasons
    }
    
    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a password reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing password reset request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
