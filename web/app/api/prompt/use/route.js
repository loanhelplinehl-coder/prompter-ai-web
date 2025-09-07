import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/prompt/use
 * Uses session.user.email and calls Supabase RPC `decrement_quota_email(p_email text)`.
 * Returns the RPC JSON result or proper errors.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  try {
    const admin = supabaseAdmin();

    // Call Supabase RPC function (defined in your SQL)
    const { data, error } = await admin.rpc("decrement_quota_email", {
      p_email: email,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("prompt/use error:", err);
    return NextResponse.json(
      { error: "internal_error", detail: String(err) },
      { status: 500 }
    );
  }
}
