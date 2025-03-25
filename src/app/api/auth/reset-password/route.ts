import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { z } from "zod";

// Define a schema for input validation
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the input
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }
    
    const { token, password } = result.data;
    
    console.log(`Verifying reset token: ${token.substring(0, 10)}...`);
    
    // Find user with this token using raw query to avoid TypeScript issues
    const users = await prisma.$queryRaw<any[]>`
      SELECT * FROM "User" WHERE "resetToken" = ${token}
    `;
    
    const user = users.length > 0 ? users[0] : null;
    
    // Check if user exists and token hasn't expired
    if (!user || !user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) {
      console.log('Invalid or expired token');
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    
    console.log(`User found with token: ${user.id}`);
    
    // Hash the new password
    const hashedPassword = await hash(password, 10);
    
    console.log('Password hashed, updating user record');
    
    // Update user with new password and clear reset token using raw query
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "password" = ${hashedPassword}, "resetToken" = NULL, "resetTokenExpires" = NULL 
      WHERE "id" = ${user.id}
    `;
    
    console.log('Password reset successful');
    
    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
