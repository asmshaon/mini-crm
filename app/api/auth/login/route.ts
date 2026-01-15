import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { AuthResponse, User } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" } as AuthResponse,
        { status: 400 }
      );
    }

    // Query user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" } as AuthResponse,
        { status: 401 }
      );
    }

    // Verify password (simple comparison - in production use bcrypt)
    if ((user as User & { password: string }).password !== password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" } as AuthResponse,
        { status: 401 }
      );
    }

    // Create session
    const response = NextResponse.json(
      { success: true, message: "Login successful", data: user } as AuthResponse,
      { status: 200 }
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" } as AuthResponse,
      { status: 500 }
    );
  }
}
