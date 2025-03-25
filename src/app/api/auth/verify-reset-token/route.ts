import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

// Extend the User type to include our reset token fields
interface UserWithResetToken extends User {
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    
    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }
    
    // Find user with this token using raw query to avoid TypeScript issues
    const users = await prisma.$queryRaw<UserWithResetToken[]>`
      SELECT * FROM "User" WHERE "resetToken" = ${token}
    `;
    
    const user = users.length > 0 ? users[0] : null;
    
    // Check if user exists and token hasn't expired
    if (!user || !user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Token is valid" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying the token" },
      { status: 500 }
    );
  }
}
