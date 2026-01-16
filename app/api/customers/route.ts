import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession, unauthorized } from "@/lib/auth";
import type { CustomerInsert, CustomerUpdate } from "@/lib/types";

// GET /api/customers - List customers with search and pagination
export async function GET(request: NextRequest) {
  const user = await getSession(request);
  if (!user) {
    return unauthorized();
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,account_number.ilike.%${search}%,phone.ilike.%${search}%,nominee.ilike.%${search}%,nid.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  const user = await getSession(request);
  if (!user) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const customerData: CustomerInsert = {
      name: body.name,
      account_number: body.account_number,
      phone: body.phone,
      nominee: body.nominee || null,
      nid: body.nid || null,
      status: body.status || "active",
      notes: body.notes || null,
      created_by: user.id,
    };

    const { data, error } = await (supabase.from("customers") as any)
      .insert(customerData)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Account number already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Customer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
