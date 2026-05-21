import { getSupabaseServer } from "@/lib/supabase/server";
import { snap } from "@/lib/midtrans";
import {
  requireString,
  successResponse,
  errorResponse,
  catchError,
} from "@/lib/api-helpers";

async function getActiveGatewayId(): Promise<number> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("payment_gateways")
    .select("id")
    .eq("is_active", true)
    .single();
  return data?.id ?? 0; // default to Midtrans
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    const name = requireString(customer?.name, "Name");
    const phone = requireString(customer?.phone, "Phone");

    const supabase = getSupabaseServer();

    // 1. Fetch products to calculate secure total
    const productIds = items.map((item: any) => item.productId);
    const { data: dbProducts, error: dbError } = await supabase
      .from("products")
      .select("id, title, price, currency, assets:product_assets(gdrive_link)")
      .in("id", productIds);

    if (dbError || !dbProducts) {
      return errorResponse("Failed to fetch products", 500);
    }

    let grossAmount = 0;
    const lineItems = [];
    const orderItems = [];

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 404);
      }

      // Check if product has a valid gdrive link
      const productAssets = (product as any).assets || [];
      const hasDriveLink = productAssets.some(
        (a: any) => a.gdrive_link && a.gdrive_link.trim() !== ""
      );
      if (!hasDriveLink) {
        return errorResponse(`Produk belum ready: ${product.title}`, 400);
      }

      const qty = 1; // Force quantity to 1 for digital products
      const price = product.price;
      const lineTotal = price * qty;
      grossAmount += lineTotal;

      lineItems.push({
        id: product.id,
        price,
        quantity: qty,
        name: product.title.substring(0, 50),
      });

      orderItems.push({
        productId: product.id,
        title: product.title,
        quantity: qty,
        price,
      });
    }

    // Generate Order ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderId = `ORD-${timestamp}-${random}`;

    // 2. Determine active gateway
    const gatewayId = await getActiveGatewayId();

    // 3. Insert into payment_history as pending
    const { error: insertError } = await supabase
      .from("payment_history")
      .insert({
        order_id: orderId,
        amount: grossAmount,
        currency: "IDR",
        status: "pending",
        provider: gatewayId === 1 ? "paymenku" : "midtrans",
        items: orderItems,
        metadata: { customer },
      });

    if (insertError) {
      return errorResponse(insertError.message, 500);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // ── MIDTRANS ──────────────────────────────────────────────────────
    if (gatewayId === 0) {
      const transactionDetails = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        item_details: lineItems,
        customer_details: {
          first_name: name,
          last_name: "",
          phone,
        },
        callbacks: {
          finish: `${baseUrl}/order-success?order_id=${orderId}`,
          error: `${baseUrl}/cart`,
          pending: `${baseUrl}/order-success?order_id=${orderId}`,
        },
      };

      const transaction = await snap.createTransaction(transactionDetails);
      return successResponse({
        redirect_url: transaction.redirect_url,
        token: transaction.token,
        order_id: orderId,
        gateway: "midtrans",
      });
    }

    // ── PAYMENKU (QRIS) ───────────────────────────────────────────────
    if (gatewayId === 1) {
      const apiKey = process.env.PAYMENKU_API_KEY;
      if (!apiKey) {
        return errorResponse("PAYMENKU_API_KEY is not configured", 500);
      }

      const payload = {
        reference_id: orderId,
        amount: grossAmount,
        customer_name: name,
        customer_email: "noreply@assetivo.com", // email placeholder (required by API)
        customer_phone: phone,
        channel_code: "qris",
        return_url: `${baseUrl}/order-success?order_id=${orderId}`,
      };

      const pmRes = await fetch(
        "https://paymenku.com/api/v1/transaction/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const pmJson = await pmRes.json();

      if (!pmRes.ok || pmJson.status !== "success") {
        console.error("[checkout] Paymenku error:", pmJson);
        return errorResponse(
          pmJson?.message || "Failed to create Paymenku transaction",
          500
        );
      }

      const payUrl: string = pmJson.data?.pay_url;
      const trxId: string = pmJson.data?.trx_id;

      // Update metadata with Paymenku trx_id
      await supabase
        .from("payment_history")
        .update({ metadata: { customer, paymenku_trx_id: trxId } })
        .eq("order_id", orderId);

      return successResponse({
        redirect_url: payUrl,
        order_id: orderId,
        gateway: "paymenku",
      });
    }

    return errorResponse("Unknown payment gateway", 500);
  } catch (error) {
    return catchError(error);
  }
}
