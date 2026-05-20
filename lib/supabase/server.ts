import { createClient } from "@supabase/supabase-js";

type SupabaseEnv = {
  url: string;
  serviceRoleKey: string;
};

function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return { url, serviceRoleKey };
}

export function getSupabaseServer() {
  const { url, serviceRoleKey } = getSupabaseEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
