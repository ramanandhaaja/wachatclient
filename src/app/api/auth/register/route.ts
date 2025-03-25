import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { z } from "zod";

// Define a schema for input validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the input
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the user - using a try-catch to handle any Prisma errors
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          // @ts-ignore - We know the password field exists in the database
          password: hashedPassword,
        },
      });
      
      // Return user data without sensitive information
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      
      return NextResponse.json(
        { message: "User created successfully", user: safeUser },
        { status: 201 }
      );
    } catch (prismaError) {
      console.error("Prisma error:", prismaError);
      return NextResponse.json(
        { error: "Database error during user creation" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the user" },
      { status: 500 }
    );
  }
}
