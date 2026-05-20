import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import { coreApi } from "@/lib/midtrans";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // 1. Verify Signature Key
    const orderId = payload.order_id;
    const statusCode = payload.status_code;
    const grossAmount = payload.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    
    const signatureInput = orderId + statusCode + grossAmount + serverKey;
    const mySignatureKey = crypto
      .createHash("sha512")
      .update(signatureInput)
      .digest("hex");

    if (mySignatureKey !== payload.signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Optional but recommended: Verify via CoreAPI to be absolutely sure
    const statusResponse = await coreApi.transaction.status(orderId);
    if (statusResponse.signature_key !== payload.signature_key) {
      return NextResponse.json({ error: "Validation failed" }, { status: 403 });
    }

    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let finalStatus = "pending";

    // 2. Map Midtrans Status to our DB Status
    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        finalStatus = "challenge";
      } else if (fraudStatus === "accept") {
        finalStatus = "settlement";
      }
    } else if (transactionStatus === "settlement") {
      finalStatus = "settlement";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      finalStatus = transactionStatus; // cancel, deny, expire
    } else if (transactionStatus === "pending") {
      finalStatus = "pending";
    }

    const supabase = getSupabaseServer();

    // 3. Update DB
    const updates: any = {
      status: finalStatus,
      method: statusResponse.payment_type,
    };

    if (finalStatus === "settlement") {
      updates.paid_at = statusResponse.settlement_time || new Date().toISOString();
    }

    const { error } = await supabase
      .from("payment_history")
      .update(updates)
      .eq("order_id", orderId);

    if (error) {
      console.error("Webhook DB update error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
