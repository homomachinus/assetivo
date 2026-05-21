import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireString, successResponse, errorResponse, catchError } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

// GET /api/admin/payment-gateways
export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// PUT /api/admin/payment-gateways
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const activeId = body.active_id;

    if (activeId === undefined) {
      return errorResponse("active_id is required");
    }

    const supabase = getSupabaseServer();

    // First, set all to inactive
    const { error: updateAllError } = await supabase
      .from("payment_gateways")
      .update({ is_active: false })
      .neq("id", -1); // update all rows

    if (updateAllError) {
      return errorResponse(updateAllError.message, 500);
    }

    // Second, set the selected one to active
    const { data, error } = await supabase
      .from("payment_gateways")
      .update({ is_active: true })
      .eq("id", activeId)
      .select("*")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ active_gateway: data });
  } catch (error) {
    return catchError(error);
  }
}
