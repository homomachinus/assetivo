import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireNumber,
  optionalString,
  getIdParam,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

type RouteContext = { params: { id: string } };

// ── GET /api/payment-history/[id] ──────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("payment_history")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Payment record not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/payment-history/[id] ──────────────────────────────────
// Update a payment record (typically status changes)
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body?.status !== undefined) {
      const status = optionalString(body.status);
      if (!status) {
        return errorResponse("status cannot be empty", 400);
      }
      updates.status = status;
    }
    if (body?.amount !== undefined) {
      updates.amount = requireNumber(body.amount, "amount");
    }
    if (body?.currency !== undefined) {
      updates.currency = optionalString(body.currency) ?? "IDR";
    }
    if (body?.provider !== undefined) {
      updates.provider = optionalString(body.provider);
    }
    if (body?.method !== undefined) {
      updates.method = optionalString(body.method);
    }
    if (body?.reference !== undefined) {
      updates.reference = optionalString(body.reference);
    }
    if (body?.items !== undefined) {
      updates.items = body.items;
    }
    if (body?.metadata !== undefined) {
      updates.metadata = body.metadata;
    }
    if (body?.paidAt !== undefined || body?.paid_at !== undefined) {
      updates.paid_at = optionalString(body.paidAt ?? body.paid_at);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("payment_history")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Payment record not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/payment-history/[id] ───────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("payment_history")
      .delete()
      .eq("id", id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return catchError(error);
  }
}
