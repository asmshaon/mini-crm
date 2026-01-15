import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./supabase";
import type { User } from "./types";

export async function getSession(request: NextRequest): Promise<User | null> {
  const sessionId = request.cookies.get("session")?.value;

  if (!sessionId) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized. Please login to continue." },
    { status: 401 }
  );
}
