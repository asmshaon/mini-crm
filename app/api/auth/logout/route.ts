import { NextResponse } from "next/server";
import type { AuthResponse } from "@/lib/types";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logout successful" } as AuthResponse,
    { status: 200 }
  );

  // Clear session cookie
  response.cookies.delete("session");

  return response;
}
