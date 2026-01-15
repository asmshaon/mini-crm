import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession, unauthorized } from "@/lib/auth";
import type { CustomerUpdate } from "@/lib/types";

// GET /api/customers/[id] - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession(request);
  if (!user) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Customer fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession(request);
  if (!user) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const customerData: CustomerUpdate = {
      name: body.name,
      account_number: body.account_number,
      phone: body.phone,
      nominee: body.nominee || null,
      nid: body.nid || null,
      status: body.status,
      notes: body.notes || null,
    };

    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", id)
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

    if (!data) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Customer update error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession(request);
  if (!user) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
