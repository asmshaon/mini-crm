import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession, unauthorized } from "@/lib/auth";
import type { CustomerInsert } from "@/lib/types";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  const user = await getSession(request);
  if (!user) {
    return unauthorized();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload .xlsx, .xls, or .csv" },
        { status: 400 }
      );
    }

    // Read file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    // Process customers
    let success = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>;
      const rowNum = i + 2; // Excel rows are 1-indexed, header is row 1

      try {
        // Validate required fields
        const name = row.name || row.Name;
        const accountNumber = row.account_number || row.accountNumber || row["Account Number"];
        const phone = row.phone || row.Phone;

        if (!name || !accountNumber || !phone) {
          errors.push({
            row: rowNum,
            error: "Missing required fields (name, account_number, phone)",
          });
          failed++;
          continue;
        }

        const customerData: CustomerInsert = {
          name: String(name),
          account_number: String(accountNumber),
          phone: String(phone),
          nominee: row.nominee || row.nominee ? String(row.nominee) : null,
          nid: row.nid || row.NID ? String(row.nid) : null,
          status: (row.status as "active" | "inactive" | "lead") || "active",
          notes: row.notes || row.Notes ? String(row.notes) : null,
          created_by: user.id,
        };

        const { error } = await (supabase.from("customers") as any)
          .insert(customerData);

        if (error) {
          if (error.code === "23505") {
            errors.push({
              row: rowNum,
              error: `Account number ${accountNumber} already exists`,
            });
          } else {
            errors.push({
              row: rowNum,
              error: error.message,
            });
          }
          failed++;
        } else {
          success++;
        }
      } catch (err) {
        errors.push({
          row: rowNum,
          error: err instanceof Error ? err.message : "Unknown error",
        });
        failed++;
      }
    }

    return NextResponse.json({
      success,
      failed,
      errors,
      total: jsonData.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import customers" },
      { status: 500 }
    );
  }
}
