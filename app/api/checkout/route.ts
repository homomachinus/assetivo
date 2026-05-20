import { getSupabaseServer } from "@/lib/supabase/server";
import { snap } from "@/lib/midtrans";
import {
  requireString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    const firstName = requireString(customer?.firstName, "First name");
    const email = requireString(customer?.email, "Email");
    const phone = requireString(customer?.phone, "Phone");

    const supabase = getSupabaseServer();

    // 1. Fetch products to calculate secure total
    const productIds = items.map((item: any) => item.productId);
    const { data: dbProducts, error: dbError } = await supabase
      .from("products")
      .select("id, title, price, currency")
      .in("id", productIds);

    if (dbError || !dbProducts) {
      return errorResponse("Failed to fetch products", 500);
    }

    let grossAmount = 0;
    const midtransItems = [];
    const orderItems = []; // To save in payment_history

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 404);
      }

      const qty = parseInt(item.quantity) || 1;
      const price = product.price;
      const lineTotal = price * qty;
      grossAmount += lineTotal;

      midtransItems.push({
        id: product.id,
        price: price,
        quantity: qty,
        name: product.title.substring(0, 50),
      });

      orderItems.push({
        productId: product.id,
        title: product.title,
        quantity: qty,
        price: price,
      });
    }

    // Generate Order ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const orderId = `ORD-${timestamp}-${random}`;

    // 2. Insert into payment_history as pending
    const { error: insertError } = await supabase
      .from("payment_history")
      .insert({
        order_id: orderId,
        amount: grossAmount,
        currency: "IDR",
        status: "pending",
        provider: "midtrans",
        items: orderItems,
        metadata: { customer },
      });

    if (insertError) {
      return errorResponse(insertError.message, 500);
    }

    // 3. Create Midtrans Transaction
    const transactionDetails = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: midtransItems,
      customer_details: {
        first_name: firstName,
        last_name: customer?.lastName || "",
        email: email,
        phone: phone,
      },
      callbacks: {
        // Redirection after payment on Midtrans hosted page
        finish: `${process.env.R2_PUBLIC_URL || "http://localhost:3000"}/order-success?order_id=${orderId}`,
        error: `${process.env.R2_PUBLIC_URL || "http://localhost:3000"}/cart`,
        pending: `${process.env.R2_PUBLIC_URL || "http://localhost:3000"}/order-success?order_id=${orderId}`,
      },
    };

    const transaction = await snap.createTransaction(transactionDetails);

    return successResponse({
      redirect_url: transaction.redirect_url,
      token: transaction.token,
    });
  } catch (error) {
    return catchError(error);
  }
}
