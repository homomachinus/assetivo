import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paymenku-signature") ?? "";
    const timestamp = request.headers.get("x-paymenku-timestamp") ?? "";
    const webhookSecret = process.env.PAYMENKU_WEBHOOK_SECRET ?? "";

    // Verify HMAC-SHA256 signature
    const signaturePayload = `${timestamp}.${rawBody}`;
    const expected = createHmac("sha256", webhookSecret)
      .update(signaturePayload)
      .digest("hex");

    if (
      webhookSecret &&
      Buffer.from(expected, "utf8").toString("hex") !==
        Buffer.from(signature, "utf8").toString("hex")
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const {
      reference_id,
      status,
      amount,
      payment_channel,
      customer_name,
      customer_email,
      paid_at,
    } = payload;

    if (!reference_id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Map Paymenku statuses to internal statuses
    const statusMap: Record<string, string> = {
      paid: "success",
      expired: "expired",
      cancelled: "cancelled",
      pending: "pending",
    };
    const internalStatus = statusMap[status] ?? status;

    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("payment_history")
      .update({
        status: internalStatus,
        metadata: {
          payment_channel,
          customer_name,
          customer_email,
          paid_at,
          raw_amount: amount,
        },
      })
      .eq("order_id", reference_id);

    if (error) {
      console.error("[paymenku-webhook] DB update error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paymenku-webhook] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
