import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireNumber,
  optionalString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── GET /api/payment-history ───────────────────────────────────────
// List all payment history entries. Supports:
//   ?status=    — filter by status (e.g. pending, paid, failed)
//   ?limit=     — limit results (default: 50)
//   ?offset=    — offset for pagination (default: 0)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") || 50), 500);
    const offset = Number(searchParams.get("offset") || 0);

    const supabase = getSupabaseServer();
    let query = supabase
      .from("payment_history")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    const response = NextResponse.json({
      data: data ?? [],
      meta: { total: count ?? (data?.length ?? 0), limit, offset }
    });
    response.headers.set("Cache-Control", "private, no-cache");
    return response;
  } catch (error) {
    return catchError(error);
  }
}

// ── POST /api/payment-history ──────────────────────────────────────
// Create a new payment record
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const amount = requireNumber(payload?.amount, "amount");
    if (amount <= 0) {
      return errorResponse("amount must be greater than 0", 400);
    }

    const orderId = typeof payload?.orderId === "string" && payload.orderId.trim()
      ? payload.orderId.trim()
      : `ORD-${randomUUID()}`;

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("payment_history")
      .insert({
        order_id: orderId,
        amount,
        currency: optionalString(payload?.currency) ?? "IDR",
        status: optionalString(payload?.status) ?? "pending",
        provider: optionalString(payload?.provider),
        method: optionalString(payload?.method),
        reference: optionalString(payload?.reference),
        items: payload?.items ?? null,
        metadata: payload?.metadata ?? null,
        paid_at: optionalString(payload?.paidAt ?? payload?.paid_at)
      })
      .select("*")
      .single();

    if (error) {
      if (error.message.includes("duplicate key") || error.message.includes("unique")) {
        return errorResponse("A payment with this orderId already exists", 409);
      }
      return errorResponse(error.message, 500);
    }

    return successResponse(data, 201);
  } catch (error) {
    return catchError(error);
  }
}
