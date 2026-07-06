import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const normalizeSupabaseUrl = (url: string) =>
  url
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");

const supabaseUrl = normalizeSupabaseUrl(env.supabaseUrl);

export const supabaseAdmin = createClient(
  supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

export const supabaseAuth = createClient(supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export const createSupabaseUserClient = (accessToken: string) =>
  createClient(supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
