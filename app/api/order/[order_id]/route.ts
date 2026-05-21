import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { coreApi } from "@/lib/midtrans";

type RouteContext = { params: { order_id: string } };

/**
 * Actively check Midtrans transaction status and update our DB.
 * This is needed because webhooks can't reach localhost during development,
 * and even in production there can be race conditions where the user
 * arrives at the success page before the webhook fires.
 */
async function syncMidtransStatus(orderId: string) {
  try {
    const statusResponse = await (coreApi as any).transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let finalStatus = "pending";

    if (transactionStatus === "capture") {
      finalStatus = fraudStatus === "accept" ? "settlement" : "challenge";
    } else if (transactionStatus === "settlement") {
      finalStatus = "settlement";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      finalStatus = transactionStatus;
    }

    if (finalStatus !== "pending") {
      const supabase = getSupabaseServer();
      const updates: Record<string, unknown> = {
        status: finalStatus,
        method: statusResponse.payment_type,
      };
      if (finalStatus === "settlement") {
        updates.paid_at =
          statusResponse.settlement_time || new Date().toISOString();
      }
      await supabase
        .from("payment_history")
        .update(updates)
        .eq("order_id", orderId);
    }

    return finalStatus;
  } catch {
    // If the Midtrans API call fails (e.g. network error), just return null
    // and we'll rely on whatever status is in the DB.
    return null;
  }
}

/**
 * Actively check Paymenku transaction status and update our DB.
 */
async function syncPaymenkuStatus(orderId: string) {
  try {
    const apiKey = process.env.PAYMENKU_API_KEY;
    if (!apiKey) return null;

    const res = await fetch(
      `https://paymenku.com/api/v1/check-status/${orderId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    const pmStatus = json.data?.status;

    const statusMap: Record<string, string> = {
      paid: "success",
      expired: "expired",
      cancelled: "cancelled",
      pending: "pending",
    };
    const finalStatus = statusMap[pmStatus] ?? pmStatus;

    if (finalStatus && finalStatus !== "pending") {
      const supabase = getSupabaseServer();
      await supabase
        .from("payment_history")
        .update({
          status: finalStatus,
          paid_at: json.data?.paid_at || new Date().toISOString(),
        })
        .eq("order_id", orderId);
    }

    return finalStatus;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const orderId = params.order_id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // 1. Fetch the payment record
    const { data: order, error: orderErr } = await supabase
      .from("payment_history")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 2. Check if link was already claimed
    if (order.link_claimed) {
      return NextResponse.json(
        {
          error: "expired",
          message:
            "Link sudah pernah diakses. Hubungi admin jika Anda memerlukan akses ulang.",
        },
        { status: 410 }
      );
    }

    // 3. If status is still pending, actively check the payment provider
    const validStatuses = ["success", "paid", "settlement"];
    let currentStatus = order.status;

    if (!validStatuses.includes(currentStatus)) {
      // Try to sync status from the payment provider
      let syncedStatus: string | null = null;

      if (order.provider === "paymenku") {
        syncedStatus = await syncPaymenkuStatus(orderId);
      } else {
        // Default: Midtrans
        syncedStatus = await syncMidtransStatus(orderId);
      }

      if (syncedStatus) {
        currentStatus = syncedStatus;
      }
    }

    // 4. If still not paid after syncing, return pending status
    if (!validStatuses.includes(currentStatus)) {
      return NextResponse.json({
        data: {
          order_id: order.order_id,
          status: currentStatus,
          amount: order.amount,
          items: order.items,
          links: null,
        },
      });
    }

    // 5. Extract product IDs from order items
    const items: { productId: string; title: string; quantity: number }[] =
      order.items || [];
    const productIds = items.map((i) => i.productId);

    // 6. Fetch gdrive links from product_assets (there may be multiple per product)
    const { data: assets } = await supabase
      .from("product_assets")
      .select("product_id, gdrive_link, notes")
      .in("product_id", productIds);

    // 7. Build links per item — include all assets for each product
    const links: {
      productId: string;
      title: string;
      quantity: number;
      gdrive_link: string | null;
      notes: string | null;
    }[] = [];

    for (const item of items) {
      const itemAssets = (assets || []).filter(
        (a) => a.product_id === item.productId
      );

      if (itemAssets.length === 0) {
        // Still show the product even if no asset exists
        links.push({
          productId: item.productId,
          title: item.title,
          quantity: item.quantity,
          gdrive_link: null,
          notes: null,
        });
      } else {
        for (const asset of itemAssets) {
          links.push({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            gdrive_link: asset.gdrive_link || null,
            notes: asset.notes || null,
          });
        }
      }
    }

    // 8. Mark link as claimed (one-time access)
    await supabase
      .from("payment_history")
      .update({ link_claimed: true })
      .eq("order_id", orderId);

    return NextResponse.json({
      data: {
        order_id: order.order_id,
        status: currentStatus,
        amount: order.amount,
        links,
      },
    });
  } catch (err) {
    console.error("[order API] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
