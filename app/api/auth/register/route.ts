import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { AuthResponse, UserInsert } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" } as AuthResponse,
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" } as AuthResponse,
        { status: 409 }
      );
    }

    // Create new user
    const newUser: UserInsert = {
      email,
      password,
      name: name || null,
    };

    const result = await (supabase.from("users") as any)
      .insert(newUser)
      .select()
      .single();

    const user = result.data;

    if (result.error || !user) {
      console.error("User creation error:", result.error);
      return NextResponse.json(
        { success: false, message: "Failed to create account" } as AuthResponse,
        { status: 500 }
      );
    }

    // Create session
    const response = NextResponse.json(
      { success: true, message: "Registration successful", data: user } as AuthResponse,
      { status: 201 }
    );

    // Set session cookie
    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" } as AuthResponse,
      { status: 500 }
    );
  }
}
