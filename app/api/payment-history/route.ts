import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseServer } from "@/lib/supabase/server";

type PaymentPayload = {
  orderId?: string;
  amount: number;
  currency?: string;
  status?: string;
  provider?: string;
  method?: string;
  reference?: string;
  items?: unknown;
  metadata?: unknown;
  paidAt?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PaymentPayload;

    if (!payload.amount || payload.amount <= 0) {
      return NextResponse.json(
        { error: "amount is required and must be > 0" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    const orderId = payload.orderId ?? `ORD-${randomUUID()}`;

    const { data, error } = await supabase
      .from("payment_history")
      .insert({
        order_id: orderId,
        amount: payload.amount,
        currency: payload.currency ?? "IDR",
        status: payload.status ?? "pending",
        provider: payload.provider ?? null,
        method: payload.method ?? null,
        reference: payload.reference ?? null,
        items: payload.items ?? null,
        metadata: payload.metadata ?? null,
        paid_at: payload.paidAt ?? null
      })
      .select("id, order_id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
